import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'
import { checkRateLimit, incrementRateLimit } from '@/lib/rate-limit'
import { DOCUMENT_TYPE_INFO, DocumentType } from '@/lib/document-prompts'
import pool from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface RequestBody {
  documentType: DocumentType
  childId?: number
  childName: string
  inputData: Record<string, any>
  style: string
  tone?: string
  targetType?: string
  isRegenerate?: boolean
}

export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const body: RequestBody = await req.json()
    const { documentType, childId, childName, inputData, style, tone, targetType, isRegenerate } = body

    // 입력 검증
    if (!documentType || !childName || !inputData || !style) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 문서 타입 유효성 검증
    if (!DOCUMENT_TYPE_INFO[documentType]) {
      return NextResponse.json(
        { error: '유효하지 않은 문서 타입입니다.' },
        { status: 400 }
      )
    }

    // 사용량 제한 확인 (재생성 첫 회는 무료)
    let rateLimitResult
    if (!isRegenerate) {
      rateLimitResult = await checkRateLimit(session.user.id)
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          {
            error: '일일 생성 횟수를 초과했습니다.',
            remaining: 0,
            resetAt: rateLimitResult.resetAt.toISOString(),
          },
          { status: 429 }
        )
      }
    } else {
      // 재생성이어도 현재 사용량 정보는 필요
      rateLimitResult = await checkRateLimit(session.user.id)
    }

    // 문서 타입별 프롬프트 생성
    const promptFn = DOCUMENT_TYPE_INFO[documentType].promptFn
    const prompt = promptFn({
      childName,
      inputData,
      style,
      tone: tone || '균형',
      targetType: targetType || '개인',
    })

    // Claude API 호출
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        }
      ],
    })

    const result = message.content[0]
    if (result.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // 성공 시 사용량 증가 (재생성 첫 회는 제외)
    if (!isRegenerate) {
      await incrementRateLimit(session.user.id)
    }

    // 문서 생성 이력 저장
    try {
      await pool.query(
        'INSERT INTO alrimjang.documents (user_id, child_id, document_type, child_name, input_data, generated_content) VALUES ($1, $2, $3, $4, $5, $6)',
        [session.user.id, childId || null, documentType, childName, JSON.stringify(inputData), result.text.trim()]
      )
    } catch (historyError) {
      console.error('Failed to save document:', historyError)
      // 이력 저장 실패해도 생성된 결과는 반환
    }

    return NextResponse.json({
      message: result.text.trim(),
      remaining: isRegenerate ? rateLimitResult.remaining : rateLimitResult.remaining - 1,
    })

  } catch (error: unknown) {
    console.error('API Error:', error)

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude API 오류: ${error.message}` },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { error: '문서 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
