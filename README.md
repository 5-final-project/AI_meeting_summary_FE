# 회의 자동 요약/보고서 프론트엔드 (React + TypeScript + Vite)

이 프로젝트는 회의 녹음 파일(음성)을 받아 텍스트로 변환(STT)하고, LLM 기반으로 요약 및 시각화(그래프 등)를 제공하는 자동화 시스템의 프론트엔드 데모입니다.  
보안이 중요한 회의(임원 회의 등)에도 적용할 수 있도록 자체 서버와 연동을 염두에 두고 설계되었습니다.

---

## 주요 기능

- 회의 정보(제목, 부서, 인원) 입력
- 실시간 음성 녹음 및 시각화
- 녹음본과 회의 정보 서버 전송
- AI 기반 회의 요약, 인사이트, 감정 분석 시각화
- 관련 문서 및 보고서 다운로드 링크 제공
- React 기반의 직관적이고 현대적인 UI

---

## 디렉토리 구조 및 파일 설명

```
/ (프로젝트 루트)
├── public/                # 정적 파일(파비콘, 공개 이미지 등)
├── src/                   # 소스 코드
│   ├── assets/            # 이미지, 아이콘 등 정적 리소스
│   ├── components/        # UI 컴포넌트(Atomic Design 패턴)
│   │   ├── molecules/     # 여러 원자적 요소가 결합된 중간 단위 컴포넌트
│   │   │   ├── DocumentListItem.tsx      # 문서 리스트의 개별 아이템
│   │   │   └── MeetingListItem.tsx       # 회의 리스트의 개별 아이템
│   │   └── organisms/     # 페이지 내 주요 섹션 단위의 복합 컴포넌트
│   │       ├── AppHeader.tsx             # 상단 헤더(상태, AI 강조 등)
│   │       ├── DocumentList.tsx          # 관련 문서 리스트
│   │       ├── MeetingForm.tsx           # 회의 정보 입력 폼
│   │       ├── MeetingListSidebar.tsx    # 좌측 회의 리스트 사이드바
│   │       ├── ProcessStepsBar.tsx       # 프로세스 단계 진행 바
│   │       ├── RealtimeVisualization.tsx # 실시간 음성/키워드/감정 시각화
│   │       └── RightSidebar.tsx          # 우측 문서/리포트 사이드바
│   ├── App.tsx               # 메인 앱 컴포넌트(전체 페이지/상태 관리)
│   ├── index.css             # 전체 스타일
│   ├── main.tsx              # React 진입점
│   └── vite-env.d.ts         # Vite 환경 타입 정의
├── package.json              # 프로젝트 의존성 및 스크립트
├── tsconfig*.json            # TypeScript 설정
├── vite.config.ts            # Vite 번들러 설정
└── README.md                 # 프로젝트 설명 파일
```

---

## 주요 파일/폴더 상세 설명

### 1. `/src/App.tsx`
- 전체 앱의 상태 관리 및 페이지 구조를 담당합니다.
- 회의 정보 입력, 녹음, AI 분석, 보고서 생성 등 모든 주요 로직이 이곳에 있습니다.
- 실제 서버 연동이 필요한 부분은 `TODO` 주석으로 명확히 표시되어 있습니다.

### 2. `/src/components/organisms/`
- **AppHeader.tsx**: 상단 헤더, 녹음 상태/AI 강조 모드 등 표시
- **MeetingForm.tsx**: 회의 제목/부서/인원 입력 폼
- **MeetingListSidebar.tsx**: 좌측 회의 리스트(더미 데이터 기반)
- **ProcessStepsBar.tsx**: STT, 문서탐색, 요약, 보고서 등 단계별 진행상태 표시
- **RealtimeVisualization.tsx**: 실시간 음성 파형, 키워드, 감정 분석 시각화
- **DocumentList.tsx**: 관련 문서 리스트
- **RightSidebar.tsx**: 우측 문서/리포트/다운로드 등 표시

### 3. `/src/components/molecules/`
- **MeetingListItem.tsx**: 회의 리스트의 개별 아이템
- **DocumentListItem.tsx**: 문서 리스트의 개별 아이템

### 4. `/src/assets/`
- **react.svg**: React 로고 등 정적 이미지 리소스

### 5. `/public/`
- **vite.svg**: Vite 로고 등 정적 공개 리소스

### 6. 기타 설정 파일
- **package.json**: 의존성, 빌드/실행 스크립트
- **tsconfig*.json**: TypeScript 컴파일러 옵션
- **vite.config.ts**: Vite 번들러 설정

---

## 개발/실행 방법

1. 의존성 설치  
   ```
   npm install
   ```
2. 개발 서버 실행  
   ```
   npm run dev
   ```
3. 브라우저에서 `http://localhost:5173` 접속

---

## 서버 연동 및 확장

- 현재는 더미 데이터와 UI 데모 위주로 동작합니다.
- 실제 서버와 연동 시, `App.tsx`의 `TODO` 주석 부분을 참고하여 API 연동/실시간 분석(WebSocket) 등을 구현하면 됩니다.
- 보안이 중요한 환경(사내망 등)에서도 자체 서버와 연동하여 사용할 수 있도록 설계되어 있습니다.

---

## 문의/기여

- 버그 제보, 기능 제안, 코드 기여는 언제든 환영합니다!
