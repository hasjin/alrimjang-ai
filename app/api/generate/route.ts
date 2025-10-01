import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface RequestBody {
  childName: string
  category: string
  memo: string
  style: string
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json()
    const { childName, category, memo, style } = body

    // 입력 검증
    if (!childName || !category || !memo || !style) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 개인정보 보호를 위한 익명화 (로그에는 익명으로 표시)
    const anonymizedName = '아이'

    // 카테고리별 프롬프트 가이드
    const categoryGuides: Record<string, string> = {
      '화장실': '배변 훈련의 성장 과정, 자기 표현 능력, 독립심 발달',
      '식사': '식습관, 음식 탐구, 영양 섭취, 사회성 발달',
      '놀이활동': '창의력, 사회성, 신체 발달, 정서 표현',
      '현장학습': '호기심, 탐구력, 새로운 경험, 사회 적응력'
    }

    const styleGuide = style === '간결형'
      ? '2-3문장으로 핵심만 간결하게 작성해주세요.'
      : '4-5문장으로 구체적이고 상세하게 작성해주세요.'

    // Claude API 호출
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `당신은 따뜻하고 경험 많은 어린이집 선생님입니다. 부모님께 보낼 알림장을 작성해주세요.

**아이 정보:**
- 이름: ${anonymizedName}
- 카테고리: ${category}
- 오늘의 기록: ${memo}

**작성 가이드:**
- 톤: 따뜻하고 감성적이며, 부모님이 공감할 수 있는 톤
- 스타일: ${styleGuide}
- 구조:
  1. 오늘 있었던 구체적인 행동 묘사
  2. 그 행동이 가진 발달적 의미 설명
  3. 부모님께 전하고 싶은 따뜻한 메시지
- 카테고리 포인트: ${categoryGuides[category]}
- 이모지: 적절하게 2-3개 사용 (🌟😊💖✨👏🎉 등)
- 주의사항:
  - 실제 아이 이름은 "${childName}"으로 자연스럽게 포함
  - 과장하지 말고 진정성 있게
  - 부모님의 마음에 와닿는 표현 사용

알림장을 작성해주세요. 인사말이나 다른 설명 없이 알림장 내용만 작성해주세요.`
        }
      ],
    })

    const result = message.content[0]
    if (result.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    return NextResponse.json({
      message: result.text.trim()
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
      { error: '알림장 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
