import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { decryptContent, decryptUserKey, isEncrypted } from '@/lib/encryption'
import pool from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const childId = searchParams.get('childId')
    const documentType = searchParams.get('type')

    let query = 'SELECT d.*, u.encrypted_key FROM alrimjang.documents d LEFT JOIN alrimjang.users u ON d.user_id = u.id WHERE d.user_id = $1'
    const queryParams: any[] = [session.user.id]

    if (childId) {
      query += ` AND d.child_id = $${queryParams.length + 1}`
      queryParams.push(parseInt(childId))
    }

    if (documentType && documentType !== 'all') {
      query += ` AND d.document_type = $${queryParams.length + 1}`
      queryParams.push(documentType)
    }

    query += ' ORDER BY d.created_at DESC LIMIT 100'

    const result = await pool.query(query, queryParams)

    // 문서 복호화
    const documents = result.rows.map((doc) => {
      try {
        // 암호화된 키가 있고, 내용이 암호화되어 있으면 복호화
        if (doc.encrypted_key && doc.generated_content && isEncrypted(doc.generated_content)) {
          const userKey = decryptUserKey(doc.encrypted_key)
          doc.generated_content = decryptContent(doc.generated_content, userKey)
        }
        // encrypted_key 필드는 클라이언트에 전송하지 않음
        delete doc.encrypted_key
      } catch (error) {
        console.error('Decryption error for document:', doc.id, error)
        // 복호화 실패 시 원본 유지 (하지만 암호화된 상태)
      }
      return doc
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Documents fetch error:', error)
    return NextResponse.json({ error: '문서 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
