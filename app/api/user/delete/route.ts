import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pool from '@/lib/db'

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await pool.connect()
    try {
      // CASCADE로 인해 관련 데이터가 모두 삭제됩니다
      // children, documents, accounts, sessions 등이 자동으로 삭제됨
      await client.query(
        'DELETE FROM alrimjang.users WHERE id = $1',
        [session.user.id]
      )

      return NextResponse.json({ success: true })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
