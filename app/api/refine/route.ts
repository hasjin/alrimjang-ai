import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'
import { checkHearts, useHearts, HEART_COSTS } from '@/lib/rate-limit'
import { buildCachedPrompt } from '@/lib/prompt-caching'
import pool from '@/lib/db'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface RequestBody {
  documentId?: number
  originalText: string
  refinementType: 'shorten' | 'lengthen' | 'adjust_tone' | 'remove_fluff' | 'add_emoji' | 'formal' | 'casual' | 'polite' | 'friendly' | 'custom'
  customRequest?: string
  currentRefinementCount: number
  originalInput?: string // 사용자 원본 입력 (memo 등)
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
    const { documentId, originalText, refinementType, customRequest, currentRefinementCount, originalInput } = body

    // 입력 검증
    if (!originalText || !refinementType) {
      return NextResponse.json(
        { error: '원본 텍스트와 수정 유형을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 수정 횟수 제한 확인
    if (currentRefinementCount >= 5) {
      return NextResponse.json(
        { error: '최대 수정 횟수(5회)를 초과했습니다.' },
        { status: 400 }
      )
    }

    // 하트 확인
    const heartsCheck = await checkHearts(session.user.id, HEART_COSTS.REFINE, session.user.email || undefined)

    if (!heartsCheck.allowed) {
      return NextResponse.json(
        {
          error: `하트가 부족합니다. 필요: ${HEART_COSTS.REFINE}❤️, 남은 하트: ${heartsCheck.remaining}❤️`,
          remaining: heartsCheck.remaining,
          resetAt: heartsCheck.resetAt.toISOString(),
        },
        { status: 429 }
      )
    }

    // 수정 타입별 프롬프트 생성 (시스템 메시지용)
    let systemMessage = `당신은 유치원/어린이집 알림장 작성 전문가입니다.

## 텍스트 수정 가이드라인

- **원문 맥락 유지**: 사용자가 처음 입력한 원문의 핵심 내용과 의미를 반드시 유지
- **간결한 출력**: 수정된 텍스트만 출력하고, 추가 설명이나 코멘트는 포함하지 않음
- **자연스러움**: 기계적이지 않고 자연스러운 표현 사용
- **일관성**: 기존 문체와 톤을 고려하여 일관성 있게 수정

## 수정 유형별 가이드

- **간결하게**: 핵심 내용 유지하되 불필요한 표현 제거, 문장을 짧게
- **자세하게**: 구체적인 예시나 설명 추가, 내용을 풍부하게
- **어조 조정**: 더 부드럽고 자연스러운 표현으로 변경
- **미사여구 제거**: 꾸밈말을 줄이고 핵심만 담백하게 전달
- **이모지 추가**: 적절한 이모지로 따뜻하고 친근한 느낌, 과하지 않게
- **격식있게**: 공식적인 상황에 어울리는 정중한 표현
- **편안하게**: 부담 없이 읽히는 친근한 표현
- **정중하게**: 존댓말과 공손한 표현 사용
- **따뜻하게**: 다정하고 부드러운 어조로 작성`

    let refinementInstruction = ''
    switch (refinementType) {
      case 'shorten':
        refinementInstruction = '다음 텍스트를 더 간결하게 줄여주세요.'
        break
      case 'lengthen':
        refinementInstruction = '다음 텍스트를 더 자세하고 풍부하게 확장해주세요.'
        break
      case 'adjust_tone':
        refinementInstruction = '다음 텍스트의 어조를 조정해주세요. 더 부드럽고 자연스러운 표현으로 바꿔주세요.'
        break
      case 'remove_fluff':
        refinementInstruction = '다음 텍스트에서 미사여구와 불필요한 꾸밈말을 줄여주세요.'
        break
      case 'add_emoji':
        refinementInstruction = '다음 텍스트에 적절한 이모지를 추가하여 더 따뜻하고 친근한 느낌으로 만들어주세요.'
        break
      case 'formal':
        refinementInstruction = '다음 텍스트를 격식 있고 정중한 어조로 바꿔주세요.'
        break
      case 'casual':
        refinementInstruction = '다음 텍스트를 편안하고 자연스러운 어조로 바꿔주세요.'
        break
      case 'polite':
        refinementInstruction = '다음 텍스트를 존댓말로 바꿔주세요.'
        break
      case 'friendly':
        refinementInstruction = '다음 텍스트를 더 따뜻하고 부드러운 느낌으로 바꿔주세요.'
        break
      case 'custom':
        if (!customRequest) {
          return NextResponse.json(
            { error: '직접 수정 요청 시 구체적인 요청 내용을 입력해주세요.' },
            { status: 400 }
          )
        }
        refinementInstruction = customRequest
        break
    }

    // 원문 맥락 포함 사용자 프롬프트 구성
    let contextInfo = ''
    if (originalInput) {
      contextInfo = `사용자가 처음 입력한 원문:\n${originalInput}\n\n`
    }

    const userPrompt = `${refinementInstruction}

${contextInfo}현재 생성된 텍스트:
${originalText}

수정된 텍스트:`

    // 프롬프트 캐싱 적용 (시스템 메시지 캐싱)
    const cachedPrompt = buildCachedPrompt({
      staticContent: systemMessage,
      dynamicPrompt: userPrompt,
      enableCaching: true,
    })

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

    // 성공 시 하트 차감
    await useHearts(session.user.id, HEART_COSTS.REFINE)

    // 문서 수정 이력 저장 (documentId가 있는 경우)
    if (documentId) {
      try {
        await pool.query(
          'UPDATE alrimjang.documents SET refinement_count = COALESCE(refinement_count, 0) + 1, updated_at = NOW() WHERE id = $1 AND user_id = $2',
          [documentId, session.user.id]
        )
      } catch (updateError) {
        console.error('Failed to update document refinement count:', updateError)
        // 이력 업데이트 실패해도 수정된 결과는 반환
      }
    }

    return NextResponse.json({
      message: result.text.trim(),
      remaining: heartsCheck.remaining - HEART_COSTS.REFINE,
      refinementCount: currentRefinementCount + 1,
    })

  } catch (error: unknown) {
    console.error('Refine API Error:', error)

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude API 오류: ${error.message}` },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { error: '문서 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
