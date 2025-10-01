import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pool from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const result = await pool.query(
      'SELECT * FROM alrimjang.children WHERE user_id = $1 ORDER BY created_at DESC',
      [session.user.id]
    )

    return NextResponse.json({ children: result.rows })
  } catch (error) {
    console.error('Children fetch error:', error)
    return NextResponse.json({ error: '원아 목록 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const body = await req.json()
    const { name, birthDate, className, notes, age } = body

    if (!name) {
      return NextResponse.json({ error: '이름을 입력해주세요.' }, { status: 400 })
    }

    if (age === undefined || age === null) {
      return NextResponse.json({ error: '나이를 선택해주세요.' }, { status: 400 })
    }

    if (age < 0 || age > 5) {
      return NextResponse.json({ error: '나이는 만 0세에서 5세 사이여야 합니다.' }, { status: 400 })
    }

    const result = await pool.query(
      'INSERT INTO alrimjang.children (user_id, name, birth_date, class_name, notes, age) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [session.user.id, name, birthDate || null, className || null, notes || null, age]
    )

    return NextResponse.json({ child: result.rows[0] })
  } catch (error) {
    console.error('Child creation error:', error)
    return NextResponse.json({ error: '원아 등록 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
