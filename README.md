# AI 알림장 도우미 ✨

어린이집 알림장을 AI가 따뜻하고 감성적으로 작성해드리는 웹앱입니다.

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **AI**: Claude API (claude-sonnet-4-5-20250929)
- **배포**: Vercel

## 주요 기능

- 아이 이름, 카테고리, 메모를 입력하면 AI가 감성적인 알림장 작성
- 카테고리: 화장실, 식사, 놀이활동, 현장학습
- 스타일: 간결형, 상세형
- 복사 버튼으로 손쉬운 공유
- 개인정보 보호 (서버 로그에 아이 이름 익명화)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일을 생성하고 Anthropic API 키를 설정하세요:

```
ANTHROPIC_API_KEY=your_api_key_here
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## Vercel 배포

1. GitHub에 프로젝트 푸시
2. [Vercel](https://vercel.com)에 접속하여 프로젝트 import
3. 환경변수 `ANTHROPIC_API_KEY` 설정
4. 배포 완료!

## 프로젝트 구조

```
alrimjang-ai/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts      # Claude API 호출
│   ├── globals.css           # 글로벌 스타일
│   ├── layout.tsx            # 루트 레이아웃
│   └── page.tsx              # 메인 페이지
├── .env.local                # 환경변수 (gitignore)
├── .env.example              # 환경변수 예제
├── next.config.ts            # Next.js 설정
├── tailwind.config.ts        # Tailwind 설정
├── tsconfig.json             # TypeScript 설정
└── package.json              # 프로젝트 의존성
```

## 라이선스

MIT
