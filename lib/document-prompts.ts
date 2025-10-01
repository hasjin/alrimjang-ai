// 문서 타입별 프롬프트 생성 함수들

export interface GenerateOptions {
  childName: string
  inputData: Record<string, any>
  style: string
  tone: string
  targetType?: string
}

export function generateAlrimjangPrompt(options: GenerateOptions): string {
  const { childName, inputData, style, tone, targetType = '개인' } = options
  const { categories, memo } = inputData

  const CATEGORY_GUIDES: Record<string, { tone: string; focus: string; keywords: string[] }> = {
    // 일상생활
    '화장실 훈련': { tone: '격려와 성취감 강조', focus: '자기표현, 성공/실패, 진행상황, 다음 목표', keywords: ['스스로', '표현', '성공', '진전', '응원'] },
    '식사': { tone: '긍정적이고 격려하는', focus: '식사량, 새로운 음식 도전, 식사 태도, 편식 개선', keywords: ['맛있게', '도전', '골고루', '스스로'] },
    '낮잠': { tone: '차분하고 안정적인', focus: '수면 시간, 잠드는 과정, 기상 후 컨디션', keywords: ['편안하게', '푹', '상쾌하게', '숙면'] },
    '등하원': { tone: '안정적이고 따뜻한', focus: '등원 시간, 분리불안, 하원 준비, 부모님 만날 때 반응', keywords: ['씩씩하게', '기다림', '준비', '반가운'] },
    '옷 갈아입기': { tone: '격려와 독립심 강조', focus: '스스로 하기, 도움 요청, 진행 상황, 자립심 발달', keywords: ['혼자서', '도전', '점점', '멋지게'] },
    '개인위생': { tone: '긍정적이고 교육적인', focus: '손 씻기, 양치, 청결 습관, 건강 의식', keywords: ['깨끗하게', '건강', '스스로', '습관'] },
    // 건강관리
    '투약': { tone: '정확하고 전문적인', focus: '투약 시간, 용량, 아이 반응, 보관 상태', keywords: ['정확히', '안전하게', '복용', '건강'] },
    '병원/상처': { tone: '안심시키는, 구체적인', focus: '발생 경위, 처치 내용, 현재 상태, 관찰사항', keywords: ['안전', '처치', '괜찮아요', '지켜보겠습니다'] },
    '발열/몸살': { tone: '걱정과 안심의 균형', focus: '체온, 증상, 처치 내용, 관찰 사항', keywords: ['확인', '관찰', '안정', '회복'] },
    '건강검진': { tone: '긍정적이고 안심시키는', focus: '검진 내용, 아이 반응, 결과, 건강 상태', keywords: ['건강', '잘', '확인', '튼튼'] },
    '알레르기/특이사항': { tone: '신중하고 세심한', focus: '증상, 대응, 관찰 사항, 주의점', keywords: ['주의', '관찰', '확인', '안전'] },
    // 놀이/활동
    '실내 자유놀이': { tone: '즐겁고 생동감있는', focus: '놀이 선택, 집중도, 창의력, 친구와의 상호작용', keywords: ['즐겁게', '창의적', '집중', '몰입'] },
    '실외 활동': { tone: '활기차고 생동감있는', focus: '신체활동, 자연 탐구, 안전, 에너지 발산', keywords: ['활발하게', '뛰어놀며', '탐험', '즐거운'] },
    '미술 활동': { tone: '칭찬과 격려 가득한', focus: '작품 설명, 창의성, 표현력, 발달 의미', keywords: ['아름다운', '독특한', '표현', '창의력'] },
    '음악/율동': { tone: '리드미컬하고 즐거운', focus: '참여도, 리듬감, 표현력, 즐거움', keywords: ['신나게', '리듬', '표현', '함께'] },
    '신체 활동': { tone: '활기차고 격려하는', focus: '운동능력, 도전, 협응력, 체력', keywords: ['활발하게', '도전', '튼튼하게', '성장'] },
    '요리 활동': { tone: '즐겁고 교육적인', focus: '참여도, 호기심, 협력, 완성 기쁨', keywords: ['함께', '만들기', '맛있게', '협력'] },
    '과학/탐구': { tone: '호기심과 발견의 기쁨', focus: '관찰력, 질문, 실험 과정, 발견의 즐거움', keywords: ['관찰', '발견', '궁금해하며', '탐구'] },
    // 특별행사
    '현장학습': { tone: '생생하고 구체적인', focus: '장소, 주요 활동, 아이 반응, 배운 점', keywords: ['체험', '탐구', '발견', '즐거운 시간'] },
    '운동회/발표회': { tone: '자랑스럽고 감동적인', focus: '참여 모습, 노력, 성취, 감동 포인트', keywords: ['최선', '자랑스러운', '열심히', '빛났습니다'] },
    '생일 파티': { tone: '축하와 기쁨 가득한', focus: '축하 분위기, 친구들 반응, 특별한 순간', keywords: ['축하', '특별한', '행복', '소중한'] },
    '절기/기념일': { tone: '의미있고 교육적인', focus: '의미 이해, 활동 참여, 전통 경험', keywords: ['의미', '전통', '배움', '소중한'] },
    '졸업/입학식': { tone: '감동적이고 격려하는', focus: '성장, 새로운 시작, 기대감, 응원', keywords: ['성장', '새로운', '응원', '자랑스러운'] },
    // 교육/발달
    '언어/한글': { tone: '격려와 성취감', focus: '언어 발달, 표현력, 이해력, 학습 태도', keywords: ['표현', '이해', '발전', '잘'] },
    '수학/인지': { tone: '칭찬과 격려', focus: '인지 발달, 문제 해결, 논리력, 집중력', keywords: ['생각', '이해', '발견', '똑똑하게'] },
    '영어': { tone: '긍정적이고 격려하는', focus: '참여도, 흥미, 표현 시도, 자신감', keywords: ['재미있게', '도전', '표현', '자신감'] },
    '특별활동': { tone: '즐거움과 성장 강조', focus: '활동 내용, 참여도, 발달 효과, 흥미', keywords: ['즐겁게', '배움', '성장', '열심히'] },
    // 사회성/정서
    '친구 관계': { tone: '따뜻하고 긍정적인', focus: '친구와 상호작용, 나눔, 협력, 사회성 발달', keywords: ['사이좋게', '함께', '배려', '친구'] },
    '갈등/문제행동': { tone: '객관적이되 희망적인', focus: '상황 설명, 교사 개입, 아이 반응, 개선 방향', keywords: ['이해', '배우는 중', '성장', '지도'] },
    '칭찬/성장': { tone: '자랑스럽고 감동적인', focus: '구체적 성장, 변화, 노력, 발달 의미', keywords: ['대견한', '성장', '발전', '자랑스러운'] },
    // 부모소통
    '준비물 요청': { tone: '공손하고 구체적인', focus: '필요 물품, 수량, 기한, 사용 목적', keywords: ['부탁드립니다', '준비', '필요', '감사합니다'] },
    '일정 안내': { tone: '명확하고 친절한', focus: '일시, 장소, 준비사항, 참고사항', keywords: ['안내', '일정', '참고', '확인'] },
    '상담 요청': { tone: '정중하고 협력적인', focus: '상담 필요성, 일정 제안, 논의 주제', keywords: ['말씀', '논의', '부탁', '시간'] },
  }

  const categoryGuidesText = categories.map((cat: string) => {
    const guide = CATEGORY_GUIDES[cat]
    if (!guide) return ''
    return `**${cat}**\n- 톤: ${guide.tone}\n- 집중 포인트: ${guide.focus}\n- 추천 키워드: ${guide.keywords.join(', ')}`
  }).filter(Boolean).join('\n')

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
- 카테고리: ${categories.join(', ')}
- 오늘의 기록: ${memo}

**카테고리별 작성 가이드:**
${categoryGuidesText}

**전체 톤 및 스타일:**
- 전체적인 톤: ${toneGuide}
- 길이: ${styleGuide}
- 구조:
  ${categories.length > 1
    ? '1. 각 카테고리 내용을 자연스럽게 연결하여 작성\n  2. 하나의 통일된 알림장으로 작성 (카테고리별로 나누지 말 것)\n  3. 부모님께 전하고 싶은 따뜻한 메시지'
    : '1. 오늘 있었던 구체적인 행동 묘사\n  2. 그 행동이 가진 발달적 의미 설명\n  3. 부모님께 전하고 싶은 따뜻한 메시지'}
- 이모지: 적절하게 2-3개 사용 (🌟😊💖✨👏🎉 등)
- 주의사항:
  - 실제 아이 이름은 "${childName}"으로 자연스럽게 포함
  - 과장하지 말고 진정성 있게
  - 각 카테고리 가이드의 키워드와 톤을 참고하되 자연스럽게 융합
  - ${categories.length > 1 ? '여러 주제를 하나의 흐름있는 글로 작성' : ''}
  - 부모님의 마음에 와닿는 표현 사용

알림장을 작성해주세요. 인사말이나 다른 설명 없이 알림장 내용만 작성해주세요.`
  } else {
    return `당신은 따뜻하고 경험 많은 어린이집 선생님입니다. 부모님들께 보낼 반 알림장을 작성해주세요.

**반 전체 정보:**
- 반 이름: ${childName}
- 카테고리: ${categories.join(', ')}
- 오늘의 기록: ${memo}

**카테고리별 작성 가이드:**
${categoryGuidesText}

**전체 톤 및 스타일:**
- 전체적인 톤: ${toneGuide}
- 길이: ${styleGuide}
- 구조:
  ${categories.length > 1
    ? '1. 각 카테고리 내용을 자연스럽게 연결하여 작성\n  2. 하나의 통일된 알림장으로 작성 (카테고리별로 나누지 말 것)\n  3. 부모님들께 전하고 싶은 따뜻한 메시지'
    : '1. 오늘 반 전체가 함께한 활동 묘사\n  2. 아이들의 반응과 참여 모습\n  3. 부모님들께 전하고 싶은 따뜻한 메시지'}
- 이모지: 적절하게 2-3개 사용 (🌟😊💖✨👏🎉 등)
- 주의사항:
  - 반 전체를 대상으로 작성
  - 우리 반, 친구들, 아이들 등의 표현 사용
  - 각 카테고리 가이드의 키워드와 톤을 참고하되 자연스럽게 융합
  - ${categories.length > 1 ? '여러 주제를 하나의 흐름있는 글로 작성' : ''}
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
