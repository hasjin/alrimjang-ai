// Claude API 프롬프트 캐싱 유틸리티
import Anthropic from '@anthropic-ai/sdk'

/**
 * 프롬프트를 시스템 메시지와 사용자 메시지로 분리
 * 정적 콘텐츠(지식베이스, 가이드)는 시스템 메시지에 캐싱
 */
export interface CachedPromptResult {
  system: Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }>
  messages: Anthropic.MessageParam[]
}

export interface BuildCachedPromptOptions {
  staticContent?: string // RAG 지식베이스, 고정 가이드라인 등
  dynamicPrompt: string // 사용자별 동적 프롬프트
  enableCaching: boolean // 캐싱 활성화 여부
}

/**
 * 캐싱을 위한 프롬프트 구조 생성
 */
export function buildCachedPrompt(options: BuildCachedPromptOptions): CachedPromptResult {
  const { staticContent, dynamicPrompt, enableCaching } = options

  // 정적 콘텐츠가 있고 캐싱이 활성화된 경우
  if (staticContent && enableCaching) {
    return {
      system: [
        {
          type: 'text',
          text: staticContent,
          cache_control: { type: 'ephemeral' }, // 5분 캐싱
        },
      ],
      messages: [
        {
          role: 'user',
          content: dynamicPrompt,
        },
      ],
    }
  }

  // 캐싱 없이 기존 방식
  return {
    system: [],
    messages: [
      {
        role: 'user',
        content: staticContent
          ? `${staticContent}\n\n${dynamicPrompt}`
          : dynamicPrompt,
      },
    ],
  }
}

/**
 * RAG 지식베이스를 시스템 메시지로 변환
 */
export function buildRAGSystemMessage(ragKnowledge: string): string {
  return `당신은 유치원/어린이집 전문 보육교사입니다. 아래는 보육과정 전문 지식베이스입니다.

## 전문 지식베이스

${ragKnowledge}

위 전문 지식을 바탕으로 교육적으로 의미 있고 전문적인 문서를 작성해주세요.
발달단계, 교육과정 영역, 관찰 포인트 등을 참고하여 작성하되, 자연스럽고 부모님이 이해하기 쉽게 표현해주세요.`
}

/**
 * 일반 가이드라인을 시스템 메시지로 변환
 */
export function buildGeneralSystemMessage(): string {
  return `당신은 따뜻하고 경험 많은 어린이집/유치원 선생님입니다.

## 전문적 작성 가이드

- **구체적 행동 묘사**: "~했습니다", "~하는 모습이었습니다" 등 관찰 가능한 사실 중심
- **발달적 의미**: 단순 행동 나열이 아닌, 그 행동이 보여주는 성장과 발달의 의미 포함
- **개별성 존중**: 아이의 고유한 특성과 강점에 초점
- **긍정적 시각**: 도전적 행동도 성장의 과정으로 긍정적 재해석
- **부모 공감**: 부모가 아이의 하루를 생생히 그릴 수 있도록 구체적 묘사

## 카테고리별 작성 가이드

- **일상생활**: 식사, 낮잠, 등하원, 화장실 훈련, 옷 갈아입기, 개인위생
- **건강관리**: 투약, 병원, 발열, 건강검진, 알레르기
- **놀이/활동**: 실내외 놀이, 미술, 음악, 신체활동, 요리, 과학탐구
- **특별행사**: 현장학습, 운동회, 생일, 절기행사
- **교육/발달**: 언어, 수학, 영어, 특별활동
- **사회성/정서**: 친구관계, 갈등해결, 성장과 칭찬
- **부모소통**: 준비물, 일정안내, 상담요청

입력된 내용을 분석하여 적절한 카테고리를 자동으로 판단하고, 그에 맞는 톤과 표현을 사용하세요.`
}

/**
 * 문서 타입별 사용자 프롬프트 생성 (동적 부분)
 */
export function buildUserPrompt(options: {
  documentType: string
  childName: string
  memo: string
  style: string
  tone: string
  targetType: string
}): string {
  const { childName, memo, style, tone, targetType } = options

  const styleGuide = style === '간결형'
    ? '3-5문장으로 핵심만 간결하게 작성해주세요.'
    : '10-15문장으로 구체적이고 상세하게 작성해주세요.'

  const toneGuide = tone === '감성적'
    ? '따뜻하고 감성적인 표현을 사용하여, 부모님의 마음에 깊이 와닿도록 작성해주세요.'
    : tone === '균형'
    ? '적절한 감성과 정보를 균형있게 담아 작성해주세요.'
    : '사실 중심의 객관적이고 정보 전달에 충실한 톤으로 작성해주세요.'

  if (targetType === '개인') {
    return `부모님께 보낼 알림장을 작성해주세요.

**아이 정보:**
- 이름: ${childName}
- 오늘의 기록: ${memo}

**요청사항:**
- 전체적인 톤: ${toneGuide}
- 길이: ${styleGuide}
- 구조:
  1. 오늘 있었던 구체적인 행동 묘사
  2. 그 행동이 가진 발달적 의미 설명
  3. 부모님께 전하고 싶은 따뜻한 메시지
- 이모지: 적절하게 2-3개 사용 (🌟😊💖✨👏🎉 등)
- 주의사항:
  - 실제 아이 이름은 "${childName}"으로 자연스럽게 포함
  - 과장하지 말고 진정성 있게
  - 여러 주제가 있다면 하나의 흐름있는 글로 작성
  - 부모님의 마음에 와닿는 표현 사용

알림장을 작성해주세요. 인사말이나 다른 설명 없이 알림장 내용만 작성해주세요.`
  } else {
    return `부모님들께 보낼 반 알림장을 작성해주세요.

**반 전체 정보:**
- 반 이름: ${childName}
- 오늘의 기록: ${memo}

**요청사항:**
- 전체적인 톤: ${toneGuide}
- 길이: ${styleGuide}
- 구조:
  1. 오늘 반 전체가 함께한 활동 묘사
  2. 아이들의 반응과 참여 모습
  3. 부모님들께 전하고 싶은 따뜻한 메시지
- 이모지: 적절하게 2-3개 사용 (🌟😊💖✨👏🎉 등)
- 주의사항:
  - 반 전체를 대상으로 작성
  - 우리 반, 친구들, 아이들 등의 표현 사용
  - 여러 주제가 있다면 하나의 흐름있는 글로 작성
  - 과장하지 말고 진정성 있게
  - 부모님들의 마음에 와닿는 표현 사용

알림장을 작성해주세요. 인사말이나 다른 설명 없이 알림장 내용만 작성해주세요.`
  }
}
