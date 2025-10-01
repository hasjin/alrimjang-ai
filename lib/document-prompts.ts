// 문서 타입별 프롬프트 생성 함수들

export interface GenerateOptions {
  childName: string
  inputData: Record<string, any>
  style: string
  tone: string
  targetType?: string
  curriculum?: string // 'standard-v4' | 'nuri-2019'
  area?: string
  outputType?: string // '알림장' | '배움읽기' | '배움지원'
  useRAG?: boolean // RAG 사용 여부
  ragKnowledge?: string // RAG 지식베이스
}

// 제4차 표준보육과정 영역 (0-2세)
export const STANDARD_AREAS = [
  '기본생활',
  '신체운동',
  '의사소통',
  '사회관계',
  '예술경험',
  '자연탐구',
] as const

// 2019 개정 누리과정 영역 (3-5세)
export const NURI_AREAS = [
  '신체운동·건강',
  '의사소통',
  '사회관계',
  '예술경험',
  '자연탐구',
] as const

export function generateAlrimjangPrompt(options: GenerateOptions): string {
  const { childName, inputData, style, tone, targetType = '개인', curriculum, outputType = '알림장', useRAG, ragKnowledge } = options
  const { memo } = inputData

  // 커리큘럼 기반 모드일 경우
  if (curriculum) {
    return generateCurriculumBasedPrompt(options)
  }

  // RAG 지식베이스 섹션
  const knowledgeSection = useRAG && ragKnowledge ? `
**전문 지식베이스 (참고용):**
${ragKnowledge}

위 전문 지식을 참고하여 더욱 전문적이고 교육적 의미가 담긴 알림장을 작성해주세요.
` : ''

  // 일반 모드: AI가 자동으로 카테고리 분석
  const professionalGuide = `
**전문적 작성을 위한 가이드:**
- 입력된 내용을 분석하여 어떤 주제/카테고리에 해당하는지 자동으로 판단하세요
- 구체적 행동 묘사: "~했습니다", "~하는 모습이었습니다" 등 관찰 가능한 사실 중심
- 발달적 의미: 단순 행동 나열이 아닌, 그 행동이 보여주는 성장과 발달의 의미 포함
- 개별성 존중: "${childName}"의 고유한 특성과 강점에 초점
- 긍정적 시각: 도전적 행동도 성장의 과정으로 긍정적 재해석
- 부모 공감: 부모가 아이의 하루를 생생히 그릴 수 있도록 구체적 묘사

**카테고리 자동 판단 가이드:**
내용을 보고 다음 중 어떤 영역에 해당하는지 판단하여 적절한 톤과 표현을 사용하세요:
- 일상생활: 식사, 낮잠, 등하원, 화장실 훈련, 옷 갈아입기, 개인위생
- 건강관리: 투약, 병원, 발열, 건강검진, 알레르기
- 놀이/활동: 실내외 놀이, 미술, 음악, 신체활동, 요리, 과학탐구
- 특별행사: 현장학습, 운동회, 생일, 절기행사
- 교육/발달: 언어, 수학, 영어, 특별활동
- 사회성/정서: 친구관계, 갈등해결, 성장과 칭찬
- 부모소통: 준비물, 일정안내, 상담요청
`

  const styleGuide = style === '간결형'
    ? '3-5문장으로 핵심만 간결하게 작성해주세요.'
    : '10-15문장으로 구체적이고 상세하게 작성해주세요.'

  const toneGuide = tone === '감성적'
    ? '따뜻하고 감성적인 표현을 사용하여, 부모님의 마음에 깊이 와닿도록 작성해주세요.'
    : tone === '균형'
    ? '적절한 감성과 정보를 균형있게 담아 작성해주세요.'
    : '사실 중심의 객관적이고 정보 전달에 충실한 톤으로 작성해주세요.'

  if (targetType === '개인') {
    return `당신은 따뜻하고 경험 많은 어린이집 선생님입니다. 부모님께 보낼 알림장을 작성해주세요.

**아이 정보:**
- 이름: ${childName}
- 오늘의 기록: ${memo}

${professionalGuide}
${knowledgeSection}

**전체 톤 및 스타일:**
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
    return `당신은 따뜻하고 경험 많은 어린이집 선생님입니다. 부모님들께 보낼 반 알림장을 작성해주세요.

**반 전체 정보:**
- 반 이름: ${childName}
- 오늘의 기록: ${memo}

${professionalGuide}
${knowledgeSection}

**전체 톤 및 스타일:**
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

export function generateBoyukIljiPrompt(options: GenerateOptions): string {
  const { childName, inputData, style } = options
  const { playContent, teacherSupport, evaluation } = inputData

  const styleGuide = style === '간결형'
    ? '간결하고 핵심 위주로 작성해주세요.'
    : '구체적이고 상세하게 작성해주세요.'

  return `당신은 경험 많은 어린이집 보육교사입니다. 보육일지를 작성해주세요.

**기본 정보:**
- 반/아이: ${childName}
- 날짜: ${inputData.date || '오늘'}

**입력 정보:**
- 놀이 내용: ${playContent}
- 교사 지원: ${teacherSupport}
- 평가 및 지원 계획: ${evaluation}

**작성 가이드:**
- ${styleGuide}
- 영유아 중심, 놀이 중심 누리과정 반영
- 객관적이고 전문적인 기록
- 발달 영역 고려 (신체, 의사소통, 사회관계, 예술경험, 자연탐구)
- 긍정적 표현 위주

**구조:**
1. **놀이 내용**: 실제 있었던 놀이와 활동 기술
2. **교사 지원**: 교사가 제공한 지원과 상호작용
3. **놀이 평가 및 지원 계획**: 오늘의 평가와 내일의 지원 방향

보육일지를 작성해주세요. 다른 설명 없이 내용만 작성해주세요.`
}

export function generateGwanchalPrompt(options: GenerateOptions): string {
  const { childName, inputData, style } = options
  const { observation, context } = inputData

  const styleGuide = style === '간결형'
    ? '핵심 행동만 간결하게 기록해주세요.'
    : '상황과 행동을 구체적으로 상세하게 기록해주세요.'

  return `당신은 경험 많은 어린이집 보육교사입니다. 영유아 관찰기록을 작성해주세요.

**관찰 대상:**
- 아이: ${childName}
- 날짜: ${inputData.date || '오늘'}
- 상황: ${context}

**관찰 내용:**
${observation}

**작성 가이드:**
- ${styleGuide}
- 객관적 사실만 기록 (개인 판단이나 평가 배제)
- 한 가지 행동에 초점
- 발달 영역별 특성 반영 (신체, 언어, 인지, 사회정서)
- 구체적인 행동 묘사
- 긍정적 표현 사용

**구조:**
1. **관찰 상황**: 언제, 어디서, 무엇을 하다가
2. **관찰 내용**: 아이가 보인 구체적 행동과 반응
3. **해석 (선택)**: 발달적 의미나 특성 (객관적으로)

관찰기록을 작성해주세요. 다른 설명 없이 내용만 작성해주세요.`
}

export function generateBaldalPyeongGaPrompt(options: GenerateOptions): string {
  const { childName, inputData } = options
  const { period, areas } = inputData

  return `당신은 경험 많은 어린이집 보육교사입니다. 영유아 발달평가를 작성해주세요.

**평가 대상:**
- 아이: ${childName}
- 평가 기간: ${period}

**평가 영역 및 내용:**
${Object.entries(areas).map(([area, content]) => `- ${area}: ${content}`).join('\n')}

**작성 가이드:**
- 관찰 기록을 바탕으로 작성
- 긍정적이고 발전 지향적인 표현
- 구체적인 예시와 함께 서술
- 영역별 발달 수준과 특성 반영
- 개별 아동의 고유한 특성 존중

**발달 영역:**
- 기본생활: 건강, 안전한 생활 습관
- 신체운동: 대근육, 소근육 발달
- 의사소통: 듣기, 말하기, 읽기, 쓰기
- 사회관계: 또래관계, 사회적 기술
- 예술경험: 창의적 표현, 심미감
- 자연탐구: 호기심, 탐구 태도, 수학적 사고

발달평가를 작성해주세요. 다른 설명 없이 내용만 작성해주세요.`
}

export function generateBumoMyeondamPrompt(options: GenerateOptions): string {
  const { childName, inputData } = options
  const { date, method, teacherOpinion, parentOpinion, topics } = inputData

  return `당신은 경험 많은 어린이집 보육교사입니다. 부모면담 기록을 작성해주세요.

**면담 정보:**
- 아이: ${childName}
- 면담 일자: ${date}
- 면담 방법: ${method}
- 면담 주제: ${topics || '아동의 적응, 또래관계, 발달 상황'}

**교사 의견:**
${teacherOpinion}

**학부모 의견:**
${parentOpinion}

**작성 가이드:**
- 객관적이고 전문적인 기록
- 아동의 긍정적 측면 강조
- 구체적 사례 포함
- 가정과 원의 협력 방안 제시
- 발달 특성과 개별 특성 고려

**구조:**
1. **교사 의견**: 원에서의 적응, 놀이 특성, 또래관계, 발달 상황 등
2. **학부모 의견**: 가정에서의 모습, 걱정되는 부분, 궁금한 점 등
3. **종합 의견**: 아동의 전반적 발달과 지원 방향
4. **협력 방안**: 가정-원 연계 지도 방안

부모면담 기록을 작성해주세요. 다른 설명 없이 내용만 작성해주세요.`
}

export const DOCUMENT_TYPE_INFO = {
  '알림장': {
    title: '알림장',
    description: '일일 활동과 아이의 모습을 부모님께 전달',
    promptFn: generateAlrimjangPrompt,
  },
  '보육일지': {
    title: '보육일지',
    description: '놀이 내용, 교사 지원, 평가 및 계획 기록',
    promptFn: generateBoyukIljiPrompt,
  },
  '관찰기록': {
    title: '관찰기록',
    description: '아이의 특정 행동과 발달 관찰',
    promptFn: generateGwanchalPrompt,
  },
  '발달평가': {
    title: '발달평가',
    description: '영역별 발달 상태 평가 (연 2회)',
    promptFn: generateBaldalPyeongGaPrompt,
  },
  '부모면담': {
    title: '부모면담',
    description: '부모 상담 내용 및 의견 기록',
    promptFn: generateBumoMyeondamPrompt,
  },
}

export type DocumentType = keyof typeof DOCUMENT_TYPE_INFO

// 커리큘럼 기반 프롬프트 생성
function generateCurriculumBasedPrompt(options: GenerateOptions): string {
  const { childName, inputData, style, tone, curriculum, outputType = '알림장', useRAG, ragKnowledge } = options
  const { memo } = inputData

  const curriculumName = curriculum === 'standard-v4' ? '제4차 표준보육과정' : '2019 개정 누리과정'
  const ageGroup = curriculum === 'standard-v4' ? '영아(0-2세)' : '유아(3-5세)'
  const areas = curriculum === 'standard-v4'
    ? '기본생활, 신체운동, 의사소통, 사회관계, 예술경험, 자연탐구'
    : '신체운동·건강, 의사소통, 사회관계, 예술경험, 자연탐구'

  const styleGuide = style === '간결형'
    ? '3-5문장으로 핵심만 간결하게 작성해주세요.'
    : '10-15문장으로 구체적이고 상세하게 작성해주세요.'

  const toneGuide = tone === '감성적'
    ? '따뜻하고 감성적인 표현을 사용하여, 부모님의 마음에 깊이 와닿도록 작성해주세요.'
    : tone === '균형'
    ? '적절한 감성과 정보를 균형있게 담아 작성해주세요.'
    : '사실 중심의 객관적이고 정보 전달에 충실한 톤으로 작성해주세요.'

  // RAG 지식베이스 추가
  const knowledgeSection = useRAG && ragKnowledge
    ? `\n\n**참고 자료 (전문가 지식):**\n${ragKnowledge}\n\n위 자료를 참고하여 더욱 전문적이고 교육적으로 작성해주세요.\n`
    : ''

  // 출력 유형별 프롬프트
  if (outputType === '배움읽기') {
    return `당신은 ${curriculumName}에 정통한 전문 보육교사입니다. ${ageGroup} 영유아의 행동을 관찰하고 분석하는 "배움읽기"를 작성해주세요.
${knowledgeSection}
**아이 정보:**
- 이름: ${childName}
- 커리큘럼: ${curriculumName}
- 발달 영역: 관찰 내용을 분석하여 자동으로 판단 (${areas})
- 관찰 내용: ${memo}

**영역 자동 판단 및 분석:**
관찰 내용을 보고 해당되는 발달 영역을 스스로 판단하세요.
${curriculumName}의 영역: ${areas}
각 영역의 핵심 내용을 참고하여 가장 적합한 영역에 연결하여 작성하세요.

**필수 작성 구조 (3단계 - 반드시 순서대로):**

1. **Observation (사실 기록)**
   - 관찰 가능한 구체적 행동만 기록
   - 시간, 장소, 상황 포함
   - "~하는 모습을 보였습니다" (사실)
   - 예: "${childName}이가 블록 5개를 일렬로 늘어놓고 '기차!'라고 말했습니다"

2. **Interpretation (배움 해석 - 3가지 렌즈)**
   - **개념 학습**: 무엇을 이해했는가? (수량, 크기, 색깔, 인과관계 등)
   - **전략 사용**: 어떤 방법을 시도했는가? (시행착오, 모방, 계획하기 등)
   - **사회정서**: 어떤 태도를 보였는가? (집중력, 협력, 자신감 등)

3. **Grounding (교육과정 연결)**
   - 발달 영역 명시
   - 교육과정 목표 연결
   - 발달 단계 설명

**작성 가이드:**
- ${styleGuide}
- ${toneGuide}
- 긍정적이고 존중하는 표현 사용
- 이모지 1-2개 사용 가능
- **반드시 위 3단계 순서대로 작성**

배움읽기를 작성해주세요. 다른 설명 없이 내용만 작성해주세요.`
  }

  if (outputType === '배움지원') {
    return `당신은 ${curriculumName}에 정통한 전문 보육교사입니다. ${ageGroup} 영유아의 배움을 지원하는 "다음 활동 계획"을 작성해주세요.
${knowledgeSection}
**아이 정보:**
- 이름: ${childName}
- 커리큘럼: ${curriculumName}
- 발달 영역: 관찰 내용을 분석하여 자동으로 판단 (${areas})
- 오늘의 관찰: ${memo}

**영역 자동 판단 및 분석:**
관찰 내용을 보고 해당되는 발달 영역을 스스로 판단하세요.
${curriculumName}의 영역: ${areas}
각 영역의 핵심 내용을 참고하여 가장 적합한 영역에 연결하여 작성하세요.

**필수 작성 구조:**

1. **오늘의 배움 요약**
   - 관찰에서 발견한 ${childName}이의 흥미와 강점
   - 현재 발달 수준

2. **다음 활동 제안 (반드시 2가지 난이도)**

   **✓ 확장 활동 (Extend) - 현재 수준에서 다양성 추가**
   - 활동명
   - 구체적 방법
   - 필요 재료
   - **Why (이유)**: 왜 이 활동이 적합한가? 현재 발달과 어떻게 연결되는가?

   **✓ 심화 활동 (Deepen) - 한 단계 높은 도전**
   - 활동명
   - 구체적 방법
   - 필요 재료
   - **Why (이유)**: 왜 이 도전이 적절한가? 다음 발달 단계와 어떻게 연결되는가?

3. **교사 역할**
   - 관찰 포인트
   - 지원 방법
   - 상호작용 전략

**작성 가이드:**
- ${styleGuide}
- ${toneGuide}
- ${curriculumName}의 발달 영역을 촉진하는 구체적 활동
- 실행 가능하고 실용적인 제안
- 이모지 1-2개 사용 가능
- **반드시 확장/심화 2가지 난이도 포함**
- **각 활동마다 Why (이유) 필수 작성**

배움지원 계획을 작성해주세요. 다른 설명 없이 내용만 작성해주세요.`
  }

  // 기본: 알림장 (커리큘럼 기반)
  return `당신은 ${curriculumName}에 정통한 전문 보육교사입니다. ${ageGroup} 부모님께 보낼 알림장을 작성해주세요.
${knowledgeSection}
**아이 정보:**
- 이름: ${childName}
- 커리큘럼: ${curriculumName}
- 발달 영역: 관찰 내용을 분석하여 자동으로 판단 (${areas})
- 오늘의 기록: ${memo}

**영역 자동 판단 및 분석:**
관찰 내용을 보고 해당되는 발달 영역을 스스로 판단하세요.
${curriculumName}의 영역: ${areas}
각 영역의 핵심 내용을 참고하여 가장 적합한 영역에 연결하여 작성하세요.

**전체 톤 및 스타일:**
- 전체적인 톤: ${toneGuide}
- 길이: ${styleGuide}
- ${curriculumName} 관점에서 발달적 의미 해석
- 발달적 의미를 자연스럽게 담아냄
- 이모지: 적절하게 2-3개 사용 (🌟😊💖✨👏🎉 등)
- 주의사항:
  - 실제 아이 이름은 "${childName}"으로 자연스럽게 포함
  - 과장하지 말고 진정성 있게
  - 커리큘럼 용어를 직접 나열하지 말고 자연스럽게 녹여냄
  - 부모님의 마음에 와닿는 표현 사용

알림장을 작성해주세요. 인사말이나 다른 설명 없이 알림장 내용만 작성해주세요.`
}

// 커리큘럼별 영역 가이드
function getCurriculumAreaGuide(curriculum: string, area: string): string {
  if (curriculum === 'standard-v4') {
    // 제4차 표준보육과정 (0-2세)
    const guides: Record<string, string> = {
      '기본생활': '- 건강하고 안전한 일상생활 습관 형성\n- 신체 조절과 기본 운동 능력 발달\n- 규칙적 생활 리듬 형성',
      '신체운동': '- 감각 및 신체 인식 능력 발달\n- 신체 움직임과 조절 능력 향상\n- 실내외 신체활동 참여',
      '의사소통': '- 듣기와 말하기 능력 발달\n- 읽기와 쓰기에 관심 가지기\n- 의사소통 즐기기',
      '사회관계': '- 나와 다른 사람 알기\n- 더불어 생활하기\n- 사회적 가치 알기',
      '예술경험': '- 아름다움 찾아보기\n- 창의적 표현하기\n- 예술 감상하기',
      '자연탐구': '- 탐구과정 즐기기\n- 생활 속 수학적 탐구\n- 주변 세계 알아가기',
    }
    return guides[area] || ''
  } else {
    // 2019 개정 누리과정 (3-5세)
    const guides: Record<string, string> = {
      '신체운동·건강': '- 신체활동 즐기기\n- 건강하게 생활하기\n- 안전하게 생활하기',
      '의사소통': '- 듣기와 말하기\n- 읽기와 쓰기에 관심 가지기\n- 책과 이야기 즐기기',
      '사회관계': '- 나를 알고 존중하기\n- 더불어 생활하기\n- 사회에 관심 가지기',
      '예술경험': '- 아름다움 찾아보기\n- 창의적으로 표현하기\n- 예술 감상하기',
      '자연탐구': '- 탐구과정 즐기기\n- 생활 속 수학적 탐구하기\n- 자연과 더불어 살기',
    }
    return guides[area] || ''
  }
}
