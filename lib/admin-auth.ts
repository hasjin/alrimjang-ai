// 관리자 인증 및 2FA 유틸리티
import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import bcrypt from 'bcryptjs'
import pool from './db'
import { Session } from 'next-auth'

export type AdminRole = 'super_admin' | 'admin' | 'moderator'

export interface AdminUser {
  user_id: string
  role: AdminRole
  granted_by: string | null
  granted_at: Date
  notes: string | null
}

export interface Admin2FA {
  user_id: string
  secret: string
  backup_codes: string[]
  enabled: boolean
  created_at: Date
  last_verified_at: Date | null
}

/**
 * 사용자가 관리자인지 확인
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'SELECT user_id FROM alrimjang.admin_users WHERE user_id = $1',
      [userId]
    )
    return result.rows.length > 0
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * 관리자 정보 조회
 */
export async function getAdminUser(userId: string): Promise<AdminUser | null> {
  try {
    const result = await pool.query(
      'SELECT * FROM alrimjang.admin_users WHERE user_id = $1',
      [userId]
    )
    if (result.rows.length === 0) return null
    return result.rows[0] as AdminUser
  } catch (error) {
    console.error('Error getting admin user:', error)
    return null
  }
}

/**
 * 관리자 권한 확인 (역할별)
 */
export async function hasAdminRole(userId: string, requiredRole: AdminRole): Promise<boolean> {
  const roleHierarchy: Record<AdminRole, number> = {
    super_admin: 3,
    admin: 2,
    moderator: 1,
  }

  try {
    const admin = await getAdminUser(userId)
    if (!admin) return false

    return roleHierarchy[admin.role] >= roleHierarchy[requiredRole]
  } catch (error) {
    console.error('Error checking admin role:', error)
    return false
  }
}

/**
 * 2FA 활성화 여부 확인
 */
export async function has2FAEnabled(userId: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'SELECT enabled FROM alrimjang.admin_2fa WHERE user_id = $1',
      [userId]
    )
    if (result.rows.length === 0) return false
    return result.rows[0].enabled
  } catch (error) {
    console.error('Error checking 2FA status:', error)
    return false
  }
}

/**
 * 2FA Secret 생성 및 QR 코드 반환
 */
export async function setup2FA(userId: string, userEmail: string): Promise<{
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}> {
  // TOTP Secret 생성
  const secret = authenticator.generateSecret()

  // Google Authenticator용 OTP Auth URL
  const otpauthUrl = authenticator.keyuri(
    userEmail,
    '알림장AI Admin',
    secret
  )

  // QR 코드 생성
  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl)

  // 백업 코드 생성 (10개)
  const backupCodes: string[] = []
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    backupCodes.push(code)
  }

  // 백업 코드 해시화
  const hashedBackupCodes = await Promise.all(
    backupCodes.map(code => bcrypt.hash(code, 10))
  )

  // DB에 저장
  await pool.query(
    `INSERT INTO alrimjang.admin_2fa (user_id, secret, backup_codes, enabled)
     VALUES ($1, $2, $3, false)
     ON CONFLICT (user_id)
     DO UPDATE SET secret = $2, backup_codes = $3, enabled = false`,
    [userId, secret, hashedBackupCodes]
  )

  return {
    secret,
    qrCodeUrl,
    backupCodes,
  }
}

/**
 * 2FA 활성화 (OTP 검증 후)
 */
export async function enable2FA(userId: string, token: string): Promise<boolean> {
  try {
    // Secret 조회
    const result = await pool.query(
      'SELECT secret FROM alrimjang.admin_2fa WHERE user_id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      throw new Error('2FA not set up')
    }

    const { secret } = result.rows[0]

    // OTP 검증
    const isValid = authenticator.verify({ token, secret })

    if (!isValid) {
      return false
    }

    // 2FA 활성화
    await pool.query(
      `UPDATE alrimjang.admin_2fa
       SET enabled = true, last_verified_at = NOW()
       WHERE user_id = $1`,
      [userId]
    )

    return true
  } catch (error) {
    console.error('Error enabling 2FA:', error)
    return false
  }
}

/**
 * 2FA 비활성화
 */
export async function disable2FA(userId: string): Promise<boolean> {
  try {
    await pool.query(
      'DELETE FROM alrimjang.admin_2fa WHERE user_id = $1',
      [userId]
    )
    return true
  } catch (error) {
    console.error('Error disabling 2FA:', error)
    return false
  }
}

/**
 * OTP 토큰 검증
 */
export async function verify2FAToken(userId: string, token: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'SELECT secret, enabled FROM alrimjang.admin_2fa WHERE user_id = $1',
      [userId]
    )

    if (result.rows.length === 0 || !result.rows[0].enabled) {
      return false
    }

    const { secret } = result.rows[0]
    const isValid = authenticator.verify({ token, secret })

    if (isValid) {
      // 마지막 검증 시간 업데이트
      await pool.query(
        'UPDATE alrimjang.admin_2fa SET last_verified_at = NOW() WHERE user_id = $1',
        [userId]
      )
    }

    return isValid
  } catch (error) {
    console.error('Error verifying 2FA token:', error)
    return false
  }
}

/**
 * 백업 코드로 검증
 */
export async function verify2FABackupCode(userId: string, code: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'SELECT backup_codes FROM alrimjang.admin_2fa WHERE user_id = $1 AND enabled = true',
      [userId]
    )

    if (result.rows.length === 0) {
      return false
    }

    const { backup_codes } = result.rows[0]

    // 백업 코드 중 일치하는 것 찾기
    for (let i = 0; i < backup_codes.length; i++) {
      const isMatch = await bcrypt.compare(code, backup_codes[i])
      if (isMatch) {
        // 사용된 백업 코드 제거
        const updatedCodes = backup_codes.filter((_: string, idx: number) => idx !== i)
        await pool.query(
          'UPDATE alrimjang.admin_2fa SET backup_codes = $1, last_verified_at = NOW() WHERE user_id = $2',
          [updatedCodes, userId]
        )
        return true
      }
    }

    return false
  } catch (error) {
    console.error('Error verifying backup code:', error)
    return false
  }
}

/**
 * 관리자 활동 로그 기록
 */
export async function logAdminActivity(
  adminUserId: string,
  action: string,
  targetUserId: string | null = null,
  details: Record<string, any> | null = null,
  ipAddress: string | null = null
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO alrimjang.admin_logs (admin_user_id, action, target_user_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminUserId, action, targetUserId, details ? JSON.stringify(details) : null, ipAddress]
    )
  } catch (error) {
    console.error('Error logging admin activity:', error)
  }
}

/**
 * 관리자 권한 부여
 */
export async function grantAdminRole(
  targetUserId: string,
  role: AdminRole,
  grantedBy: string,
  notes?: string
): Promise<boolean> {
  try {
    await pool.query(
      `INSERT INTO alrimjang.admin_users (user_id, role, granted_by, notes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET role = $2, granted_by = $3, notes = $4, granted_at = NOW()`,
      [targetUserId, role, grantedBy, notes || null]
    )

    await logAdminActivity(grantedBy, 'grant_admin', targetUserId, { role, notes })
    return true
  } catch (error) {
    console.error('Error granting admin role:', error)
    return false
  }
}

/**
 * 관리자 권한 제거
 */
export async function revokeAdminRole(
  targetUserId: string,
  revokedBy: string
): Promise<boolean> {
  try {
    const admin = await getAdminUser(targetUserId)

    await pool.query(
      'DELETE FROM alrimjang.admin_users WHERE user_id = $1',
      [targetUserId]
    )

    await logAdminActivity(revokedBy, 'revoke_admin', targetUserId, {
      previous_role: admin?.role
    })

    return true
  } catch (error) {
    console.error('Error revoking admin role:', error)
    return false
  }
}

/**
 * 세션에서 관리자 확인 (미들웨어용)
 */
export async function requireAdmin(session: Session | null): Promise<{
  isAdmin: boolean
  adminUser: AdminUser | null
  requires2FA: boolean
}> {
  if (!session || !session.user) {
    return { isAdmin: false, adminUser: null, requires2FA: false }
  }

  const adminUser = await getAdminUser(session.user.id)
  if (!adminUser) {
    return { isAdmin: false, adminUser: null, requires2FA: false }
  }

  const requires2FA = await has2FAEnabled(session.user.id)

  return {
    isAdmin: true,
    adminUser,
    requires2FA,
  }
}
