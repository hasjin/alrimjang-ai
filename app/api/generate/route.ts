import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'
import { checkHearts, useHearts, HEART_COSTS } from '@/lib/rate-limit'
import { DOCUMENT_TYPE_INFO, DocumentType } from '@/lib/document-prompts'
import { searchKnowledge } from '@/lib/rag-knowledge'
import { buildCachedPrompt, buildRAGSystemMessage, buildGeneralSystemMessage, buildUserPrompt } from '@/lib/prompt-caching'
import { encryptContent, decryptUserKey } from '@/lib/encryption'
import pool from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface RequestBody {
  documentType: DocumentType
  childName: string
  childAge?: number
  inputData: Record<string, any>
  style: string
  tone?: string
  targetType?: string
  isRegenerate?: boolean
  curriculum?: string
  useRAG?: boolean
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
    const { documentType, childName, childAge, inputData, style, tone, targetType, isRegenerate, curriculum, useRAG } = body

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

    // 하트 비용 계산
    let heartsRequired = HEART_COSTS.GENERATE
    if (useRAG) {
      heartsRequired = HEART_COSTS.GENERATE * HEART_COSTS.RAG_MULTIPLIER // 30 하트
    }

    // 하트 확인 (재생성 첫 회는 무료)
    let heartsCheck
    if (!isRegenerate) {
      heartsCheck = await checkHearts(session.user.id, heartsRequired, session.user.email || undefined)

      if (!heartsCheck.allowed) {
        return NextResponse.json(
          {
            error: useRAG
              ? `RAG 기능은 ${heartsRequired} 하트를 사용합니다. 남은 하트(${heartsCheck.remaining}❤️)가 부족합니다.`
              : `하트가 부족합니다. 필요: ${heartsRequired}❤️, 남은 하트: ${heartsCheck.remaining}❤️`,
            remaining: heartsCheck.remaining,
            resetAt: heartsCheck.resetAt.toISOString(),
          },
          { status: 429 }
        )
      }
    } else {
      // 재생성이어도 현재 하트 정보는 필요
      heartsCheck = await checkHearts(session.user.id, heartsRequired, session.user.email || undefined)
    }

    // RAG 지식베이스 검색
    let ragKnowledge = ''
    if (useRAG && curriculum) {
      // area와 outputType은 선택사항, AI가 자동으로 적용
      ragKnowledge = searchKnowledge(curriculum, '', '') // 전체 지식베이스 제공
    }

    // 프롬프트 캐싱 전략:
    // 1. RAG 모드: 지식베이스를 시스템 메시지로 캐싱 (큰 절감 효과)
    // 2. 일반 모드: 기본 가이드라인을 시스템 메시지로 캐싱
    let cachedPrompt

    if (useRAG && ragKnowledge) {
      // RAG 모드: 지식베이스 캐싱
      const systemMessage = buildRAGSystemMessage(ragKnowledge)
      const userMessage = buildUserPrompt({
        documentType,
        childName,
        memo: inputData.memo || '',
        style,
        tone: tone || '균형',
        targetType: targetType || '개인',
      })

      cachedPrompt = buildCachedPrompt({
        staticContent: systemMessage,
        dynamicPrompt: userMessage,
        enableCaching: true,
      })
    } else {
      // 일반 모드: 기존 프롬프트 생성 방식 유지 (캐싱은 가이드라인만)
      const promptFn = DOCUMENT_TYPE_INFO[documentType].promptFn
      const prompt = promptFn({
        childName,
        inputData,
        style,
        tone: tone || '균형',
        targetType: targetType || '개인',
        curriculum,
        useRAG,
        ragKnowledge,
      })

      // 일반 가이드라인 캐싱
      const systemMessage = buildGeneralSystemMessage()
      cachedPrompt = buildCachedPrompt({
        staticContent: systemMessage,
        dynamicPrompt: prompt,
        enableCaching: true,
      })
    }

    // Claude API 호출 (프롬프트 캐싱 활성화)
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: cachedPrompt.system,
      messages: cachedPrompt.messages,
    }, {
      headers: {
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
    })

    const result = message.content[0]
    if (result.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // 성공 시 하트 차감 (재생성 첫 회는 제외)
    if (!isRegenerate) {
      await useHearts(session.user.id, heartsRequired)
    }

    // 문서 생성 이력 저장 (암호화 적용)
    try {
      // 사용자 암호화 키 조회
      const userKeyResult = await pool.query(
        'SELECT encrypted_key FROM alrimjang.users WHERE id = $1',
        [session.user.id]
      )

      let encryptedContent = result.text.trim()

      // 암호화 키가 있으면 암호화
      if (userKeyResult.rows[0]?.encrypted_key) {
        const userKey = decryptUserKey(userKeyResult.rows[0].encrypted_key)
        encryptedContent = encryptContent(result.text.trim(), userKey)
      }

      await pool.query(
        'INSERT INTO alrimjang.documents (user_id, document_type, child_name, input_data, generated_content, curriculum, area, output_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [session.user.id, documentType, childName || 'ㅇㅇ', JSON.stringify({ ...inputData, childAge }), encryptedContent, curriculum || null, null, '알림장']
      )
    } catch (historyError) {
      console.error('Failed to save document:', historyError)
      // 이력 저장 실패해도 생성된 결과는 반환
    }

    return NextResponse.json({
      message: result.text.trim(),
      remaining: isRegenerate ? heartsCheck.remaining : heartsCheck.remaining - heartsRequired,
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
