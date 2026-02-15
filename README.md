# 국회의원 의정활동 정보

대한민국 국회의원의 의정활동 정보를 한눈에 확인할 수 있는 웹 플랫폼입니다.

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | Next.js, React, TanStack Query, shadcn/ui, Radix UI |
| Backend | NestJS, Prisma ORM |
| Database | Supabase PostgreSQL |
| Cache | Upstash Redis |
| Deploy | Vercel (Frontend), Railway (Backend) |
| CI | GitHub Actions (Lint, Format, Knip, Typecheck, Build) |

## Project Structure

```
congressman/
├── frontend/          # Next.js 프론트엔드
├── backend/           # NestJS API 서버
│   ├── src/
│   │   ├── members/   # 의원 API
│   │   ├── bills/     # 법안 API
│   │   ├── terms/     # 국회 대수 API
│   │   ├── attendance/# 출석 API
│   │   ├── health/    # 헬스체크
│   │   ├── redis/     # Redis 캐싱
│   │   ├── prisma/    # DB 연결
│   │   └── sync/      # 국회 데이터 동기화 스크립트
│   └── prisma/        # Prisma 스키마
├── package.json       # 루트 워크스페이스 설정
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
pnpm sync              # 전체 동기화 (의원 + 법안)
pnpm sync:members      # 의원 정보만
pnpm sync:bills        # 법안 정보만
```

- 의원: 296명
- 법안: 15,394건
- 공동발의: 180,319건

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | 헬스체크 (DB + Redis) |
| GET | `/api/terms` | 국회 대수 목록 |
| GET | `/api/members?termId=22` | 의원 목록 |
| GET | `/api/members/:id` | 의원 상세 |
| GET | `/api/members/:id/terms` | 의원 역대 활동 |
| GET | `/api/members/:id/history` | 의원 이력 (출석/법안 집계) |
| GET | `/api/bills?termId=22` | 법안 목록 (페이지네이션) |
| GET | `/api/attendance?memberId=...&termId=22` | 출석 정보 |

## Scripts

```bash
pnpm dev            # 개발 서버 실행
pnpm build          # 전체 빌드
pnpm lint           # ESLint 검사
pnpm typecheck      # TypeScript 타입 체크
```

## License

Private
