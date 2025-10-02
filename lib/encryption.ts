import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const KEY_LENGTH = 32

// 환경변수에서 마스터 키 가져오기
function getMasterKey(): Buffer {
  const masterKeyHex = process.env.ENCRYPTION_MASTER_KEY
  if (!masterKeyHex) {
    throw new Error('ENCRYPTION_MASTER_KEY 환경변수가 설정되지 않았습니다.')
  }
  return Buffer.from(masterKeyHex, 'hex')
}

/**
 * 사용자별 고유 암호화 키 생성
 */
export function generateUserKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex')
}

/**
 * 사용자 키를 마스터 키로 암호화 (DB 저장용)
 */
export function encryptUserKey(userKey: string): string {
  const masterKey = getMasterKey()
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv)
  const encrypted = Buffer.concat([
    cipher.update(userKey, 'hex'),
    cipher.final()
  ])

  const authTag = cipher.getAuthTag()

  // 형식: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

/**
 * 암호화된 사용자 키를 복호화
 */
export function decryptUserKey(encryptedKey: string): string {
  const masterKey = getMasterKey()
  const [ivHex, authTagHex, encryptedHex] = encryptedKey.split(':')

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('잘못된 암호화 키 형식입니다.')
  }

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ])

  return decrypted.toString('hex')
}

/**
 * 문서 내용을 사용자 키로 암호화
 */
export function encryptContent(content: string, userKeyHex: string): string {
  const userKey = Buffer.from(userKeyHex, 'hex')
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, userKey, iv)
  const encrypted = Buffer.concat([
    cipher.update(content, 'utf8'),
    cipher.final()
  ])

  const authTag = cipher.getAuthTag()

  // 형식: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

/**
 * 암호화된 문서 내용을 사용자 키로 복호화
 */
export function decryptContent(encryptedContent: string, userKeyHex: string): string {
  const userKey = Buffer.from(userKeyHex, 'hex')
  const [ivHex, authTagHex, encryptedHex] = encryptedContent.split(':')

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('잘못된 암호화 데이터 형식입니다.')
  }

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, userKey, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ])

  return decrypted.toString('utf8')
}

/**
 * 암호화된 데이터인지 확인 (형식 체크)
 */
export function isEncrypted(data: string): boolean {
  const parts = data.split(':')
  return parts.length === 3 && parts.every(part => /^[0-9a-f]+$/.test(part))
}
