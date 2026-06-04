const crypto = require('crypto')

const getKey = () => {
  const raw = process.env.ADMIN_2FA_ENCRYPTION_KEY
  if (!raw) {
    throw new Error('Missing ADMIN_2FA_ENCRYPTION_KEY')
  }
  const key = Buffer.from(raw, 'base64')
  if (key.length !== 32) {
    throw new Error('ADMIN_2FA_ENCRYPTION_KEY must be a 32-byte base64 string')
  }
  return key
}

const encrypt = (value) => {
  if (!value) return null
  const iv = crypto.randomBytes(12)
  const key = getKey()
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`
}

const decrypt = (payload) => {
  if (!payload) return null
  const [ivB64, tagB64, dataB64] = payload.split(':')
  if (!ivB64 || !tagB64 || !dataB64) return null
  const iv = Buffer.from(ivB64, 'base64')
  const tag = Buffer.from(tagB64, 'base64')
  const data = Buffer.from(dataB64, 'base64')
  const key = getKey()
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()])
  return decrypted.toString('utf8')
}

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex')

const generateToken = (length = 48) => crypto.randomBytes(length).toString('hex')

module.exports = {
  encrypt,
  decrypt,
  hashToken,
  generateToken,
}
