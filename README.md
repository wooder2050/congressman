# 국회의원 의정활동 정보

대한민국 국회의원의 의정활동 정보를 한눈에 확인할 수 있는 웹 플랫폼입니다.

## 주요 기능

- **홈**: 의원 수/법안/표결 통계 요약, 최근 활동, 의정활동 하이라이트(최다발의/부결표결/접전표결)
- **의원 목록**: 정당 필터, 검색, 그리드 카드
- **의원 상세**: 프로필, 출석(도넛 차트 + 결석 상세), 법안(대표/공동발의), 표결(정당 이탈 표시), 재산, 경력, 위원회별 활동
- **역대 활동 비교**: 대수별 출석/법안/표결 바 차트
- **법안 목록/상세**: 페이지네이션, 상태 필터, 발의자 목록, 관련 표결 연결
- **표결 목록/상세**: 페이지네이션, 결과 필터, 찬반 비율 차트, 정당별 의원 투표 내역
- **선거구 지도**: D3 + TopoJSON 전국 → 시도 → 선거구 드릴다운, 정당 컬러 오버레이
- **의원 비교**: 최대 4명 출석/법안/표결 비교
- **카카오톡 OG 공유**: 동적 OG 이미지 생성

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | Next.js 16, React, TanStack Query, shadcn/ui, Radix UI, D3 |
| Backend | NestJS, Prisma ORM |
| Database | Supabase PostgreSQL |
| Cache | Upstash Redis |
| Deploy | Vercel (Frontend), Railway (Backend) |
| CI | GitHub Actions (Lint, Format, Knip, Typecheck, Build) |

## Project Structure

```
congressman/
├── frontend/               # Next.js 프론트엔드
│   └── src/
│       ├── app/            # 페이지 라우트
│       │   ├── page.tsx              # 홈
│       │   ├── members/              # 의원 목록/상세/출석상세/역대활동
│       │   ├── bills/                # 법안 목록/상세
│       │   ├── votes/                # 표결 목록/상세
│       │   ├── map/                  # 선거구 지도
│       │   └── compare/              # 의원 비교
│       ├── components/     # UI 컴포넌트
│       ├── hooks/          # 커스텀 훅 (useCongressQuery)
│       ├── lib/            # API 클라이언트, 유틸리티
│       └── types/          # TypeScript 타입 정의
├── backend/                # NestJS API 서버
│   ├── src/
│   │   ├── members/        # 의원 API
│   │   ├── bills/          # 법안 API
│   │   ├── votes/          # 표결 API
│   │   ├── attendance/     # 출석 API
│   │   ├── stats/          # 홈 통계 API
│   │   ├── terms/          # 국회 대수 API
│   │   ├── health/         # 헬스체크
│   │   ├── redis/          # Redis 캐싱
│   │   ├── prisma/         # DB 연결
│   │   └── sync/           # 국회 데이터 동기화 스크립트
│   └── prisma/             # Prisma 스키마
├── package.json            # 루트 워크스페이스 설정
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js >= 22
- pnpm 10.18.3

### Installation

```bash
pnpm install
```

### Development

```bash
# 프론트엔드 + 백엔드 동시 실행
pnpm dev

# 개별 실행
pnpm dev:frontend   # http://localhost:3000
pnpm dev:backend    # http://localhost:4000
```

### Environment Variables

**backend/.env**

```
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
PORT=4000
CORS_ORIGIN="http://localhost:3000"
ASSEMBLY_API_KEY="your-api-key"
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="your-token"
```

**frontend/.env.local**

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

> `NEXT_PUBLIC_API_URL`이 없으면 mock 데이터로 동작합니다.

## Data Sync

국회 공공데이터 API에서 22대 국회 데이터를 동기화합니다.

```bash
pnpm sync                # 전체 동기화
pnpm sync:members        # 의원 정보
pnpm sync:bills          # 법안 정보
pnpm sync:votes          # 표결 정보
pnpm sync:member-votes   # 의원별 표결 내역
pnpm sync:photos         # 의원 사진
pnpm sync:attendance     # 출석 통계
pnpm sync:assets         # 재산 정보 (CSV 임포트)
pnpm sync:bill-content   # 법안 본문
pnpm sync:daily          # 일간 동기화 (법안 + 표결)
pnpm sync:weekly         # 주간 동기화 (전체)
```

## API Endpoints

### 의원

| Method | Path | Description |
|---|---|---|
| GET | `/api/members?termId=22` | 의원 목록 |
| GET | `/api/members/:id` | 의원 상세 |
| GET | `/api/members/:id/terms` | 의원 역대 활동 |
| GET | `/api/members/:id/history` | 의원 이력 (출석/법안/표결 집계) |
| GET | `/api/members/:id/assets?termId=22` | 재산 정보 |
| GET | `/api/members/:id/monthly-attendance?termId=22` | 월별 출석 통계 |
| GET | `/api/members/:id/committee-bills?termId=22` | 위원회별 법안 |
| GET | `/api/members/:id/committee-activity?termId=22` | 위원회별 활동 통계 |
| GET | `/api/members/:id/votes?termId=22` | 의원별 표결 이력 |

### 법안

| Method | Path | Description |
|---|---|---|
| GET | `/api/bills?termId=22&page=1&limit=20` | 법안 목록 (페이지네이션) |
| GET | `/api/bills/summary?termId=22` | 법안 통계 요약 |
| GET | `/api/bills/committees?termId=22` | 위원회 목록 |
| GET | `/api/bills/:id` | 법안 상세 |

### 표결

| Method | Path | Description |
|---|---|---|
| GET | `/api/votes?termId=22&page=1&limit=20` | 표결 목록 (페이지네이션) |
| GET | `/api/votes/summary?termId=22` | 표결 통계 요약 |
| GET | `/api/votes/:id/member-votes` | 표결 상세 + 의원별 투표 내역 |

### 기타

| Method | Path | Description |
|---|---|---|
| GET | `/api/terms` | 국회 대수 목록 |
| GET | `/api/attendance?memberId=...&termId=22` | 출석 정보 |
| GET | `/api/attendance/absence?memberId=...&termId=22` | 결석 상세 내역 |
| GET | `/api/stats/home?termId=22` | 홈 통계 (의원수, 법안수, 표결수, 최다발의) |
| GET | `/api/health` | 헬스체크 (DB + Redis) |

## Scripts

```bash
pnpm dev            # 개발 서버 실행
pnpm build          # 전체 빌드
pnpm lint           # ESLint 검사
pnpm typecheck      # TypeScript 타입 체크
pnpm format:check   # Prettier 포맷 체크
pnpm knip           # 미사용 코드/의존성 검사
```

## License

Private
