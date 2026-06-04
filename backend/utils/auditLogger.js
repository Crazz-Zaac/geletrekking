const AuditLog = require('../models/AuditLog')

const logAudit = async ({
  actor,
  actorEmail,
  action,
  targetType,
  targetId,
  targetLabel,
  outcome = 'success',
  ip,
  userAgent,
  meta,
}) => {
  try {
    await AuditLog.create({
      actor,
      actorEmail,
      action,
      targetType,
      targetId,
      targetLabel,
      outcome,
      ip,
      userAgent,
      meta,
    })
  } catch (error) {
    console.error('Audit log error:', error.message)
  }
}

module.exports = { logAudit }
