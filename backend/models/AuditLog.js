const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorEmail: { type: String },
    action: { type: String, required: true },
    targetType: { type: String },
    targetId: { type: String },
    targetLabel: { type: String },
    outcome: { type: String, enum: ['success', 'failure'], default: 'success' },
    ip: { type: String },
    userAgent: { type: String },
    meta: { type: Object },
  },
  { timestamps: true }
)

auditLogSchema.index({ action: 1, createdAt: -1 })

auditLogSchema.index({ actor: 1, createdAt: -1 })

module.exports = mongoose.model('AuditLog', auditLogSchema)
