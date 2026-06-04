const { logAudit } = require('../utils/auditLogger')

const auditContent = (resource, getTarget) => {
  return (req, res, next) => {
    if (!req.user) return next()

    res.on('finish', () => {
      if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return

      const outcome = res.statusCode >= 400 ? 'failure' : 'success'
      const target = getTarget ? getTarget(req) : {}

      logAudit({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: `${resource}.${req.method.toLowerCase()}`,
        outcome,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        targetType: resource,
        ...target,
      })
    })

    next()
  }
}

module.exports = {
  auditContent,
}
