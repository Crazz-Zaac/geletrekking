const bcrypt = require('bcrypt')
const User = require('../models/user')
const AdminInvite = require('../models/AdminInvite')
const { generateToken, hashToken } = require('../utils/crypto')
const { logAudit } = require('../utils/auditLogger')

const INVITE_EXPIRY_HOURS = Number(process.env.ADMIN_INVITE_EXPIRY_HOURS || 48)

const normalizeEmail = (email) => (email || '').toLowerCase().trim()

const getInviteUrl = (token) => {
  const base = (process.env.ADMIN_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
  return `${base}/admin/invite?token=${token}`
}

exports.createInvite = async (req, res) => {
  const { email } = req.body
  const normalized = normalizeEmail(email)

  if (!normalized) {
    return res.status(400).json({ message: 'Email is required.' })
  }

  try {
    const existing = await User.findOne({ email: normalized })
    if (existing) {
      return res.status(400).json({ message: 'User already exists.' })
    }

    const token = generateToken(32)
    const tokenHash = hashToken(token)
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000)

    await AdminInvite.create({
      email: normalized,
      role: 'editor',
      tokenHash,
      expiresAt,
      createdBy: req.user._id,
    })

    const inviteUrl = getInviteUrl(token)

    await logAudit({
      actor: req.user._id,
      actorEmail: req.user.email,
      action: 'admin.invite.create',
      targetType: 'invite',
      targetLabel: normalized,
      outcome: 'success',
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    res.status(201).json({
      message: 'Invite created.',
      inviteUrl,
      expiresAt,
    })
  } catch (error) {
    await logAudit({
      actor: req.user?._id,
      actorEmail: req.user?.email,
      action: 'admin.invite.create',
      targetType: 'invite',
      targetLabel: normalized,
      outcome: 'failure',
      ip: req.ip,
      userAgent: req.get('user-agent'),
      meta: { error: error.message },
    })

    res.status(500).json({ message: 'Unable to create invite.' })
  }
}

exports.listInvites = async (req, res) => {
  try {
    const invites = await AdminInvite.find().sort({ createdAt: -1 })
    res.status(200).json(invites)
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch invites.' })
  }
}

exports.acceptInvite = async (req, res) => {
  const { token, password, name } = req.body

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required.' })
  }

  try {
    const tokenHash = hashToken(token)
    const invite = await AdminInvite.findOne({ tokenHash })

    if (!invite || invite.usedAt) {
      return res.status(400).json({ message: 'Invalid invite.' })
    }

    if (invite.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invite expired.' })
    }

    const existing = await User.findOne({ email: invite.email })
    if (existing) {
      return res.status(400).json({ message: 'User already exists.' })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({
      name: name || invite.email.split('@')[0],
      email: invite.email,
      password: hashed,
      role: invite.role,
      status: 'active',
    })

    invite.usedAt = new Date()
    await invite.save()

    await logAudit({
      actor: user._id,
      actorEmail: user.email,
      action: 'admin.invite.accept',
      targetType: 'user',
      targetId: user._id.toString(),
      targetLabel: user.email,
      outcome: 'success',
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    res.status(201).json({ message: 'Account created. Please login.' })
  } catch (error) {
    res.status(500).json({ message: 'Unable to accept invite.' })
  }
}

exports.updateUserStatus = async (req, res) => {
  const { id } = req.params
  const { status, reason } = req.body

  if (!['active', 'suspended', 'disabled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' })
  }

  try {
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ message: 'User not found.' })

    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot modify superadmin status.' })
    }

    user.status = status
    user.suspendedAt = status === 'suspended' ? new Date() : null
    user.suspendedReason = status === 'suspended' ? reason || null : null

    await user.save()

    await logAudit({
      actor: req.user._id,
      actorEmail: req.user.email,
      action: 'admin.user.status',
      targetType: 'user',
      targetId: user._id.toString(),
      targetLabel: user.email,
      outcome: 'success',
      ip: req.ip,
      userAgent: req.get('user-agent'),
      meta: { status },
    })

    res.status(200).json({ message: 'User status updated.' })
  } catch (error) {
    res.status(500).json({ message: 'Unable to update user status.' })
  }
}

exports.listAuditLogs = async (req, res) => {
  const { action, actor, outcome, limit = 50, offset = 0 } = req.query

  try {
    const AuditLog = require('../models/AuditLog')
    
    const filter = {}
    if (action) filter.action = action
    if (actor) filter.actor = actor
    if (outcome) filter.outcome = outcome

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset))
      .populate('actor', 'email')
      .lean()

    const total = await AuditLog.countDocuments(filter)

    res.status(200).json({
      logs,
      total,
      limit: Number(limit),
      offset: Number(offset),
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    res.status(500).json({ message: 'Unable to fetch audit logs.' })
  }
}
