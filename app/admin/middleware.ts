import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/admin-auth'

/**
 * 관리자 페이지 접근 권한 확인
 */
export async function requireAdminAccess() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/admin')
  }

  const adminCheck = await isAdmin(session.user.id)

  if (!adminCheck) {
    redirect('/generate')
  }

  return { session, isAdmin: true }
}
