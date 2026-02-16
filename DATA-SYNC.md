# 데이터 동기화 가이드

## 데이터 소스별 업데이트 주기

국회 Open API의 공식 갱신 주기는 **"수시"** — 고정 스케줄 없이 국회 내부 시스템 입력 후 API에 반영된다.
실제로는 이벤트 발생 후 **1~3 영업일** 내에 데이터가 반영된다.

| 데이터 | API 엔드포인트 | 변경 빈도 | 반영 지연 | 동기화 주기 |
|--------|---------------|----------|----------|------------|
| 의원 정보 | `nwvrqwxyaytdsfvhu` | 극히 드묾 (당적 변경, 보궐선거) | 수일~수주 | **주 1회** |
| 의원 사진 | (의원 정보 내 URL) | 극히 드묾 | - | **주 1회** |
| 발의 법안 | `nzmimeepazxkubdpn` | 거의 매일 (월 500~900건) | 1~2 영업일 | **매일** |
| 본회의 표결 | `ncocpgfiaoituanbr` | 월 2~5회 (본회의 시) | 1~3 영업일 | **매일** |
| 의원별 표결 | `nojepdqqaweusdfbi` | 본회의 표결과 동시 | 1~3 영업일 | **매일** |
| 출석 통계 | (의원별 표결에서 계산) | 본회의 표결과 동시 | - | **매일** |
| 재산 정보 | 뉴스타파 CSV (수동) | 연 1회 | - | **수동** |

## 국회 회기 패턴

데이터 발생량은 국회 회기에 따라 크게 달라진다.

| 회기 | 기간 | 데이터 활동 |
|------|------|-----------|
| 정기회 | 9/1 ~ 12월 (100일) | 가장 활발, 12월 예산 처리로 피크 |
| 임시회 | 2, 3, 4, 5, 6/1, 8/16 개회 | 해당 월 말까지 |
| 비회기 | 1월, 7월 | 보통 휴회 (저활동) |

참고: 22대 국회 기준 12월 표결이 120~180건으로 최대, 비회기에도 60~100건 발생한 이력 있음.

---

## 동기화 스크립트

모든 스크립트는 `backend/` 디렉토리에서 실행한다.

### 매일 동기화 — `pnpm sync:daily`

법안, 본회의 표결, 의원별 표결, 출석 통계를 순차 실행한다.

```bash
cd backend
pnpm sync:daily        # 기본 22대
pnpm sync:daily 21     # 21대 지정
```

- 스크립트: `src/sync/sync-daily.ts`
- 대상: bills → votes → member-votes → attendance
- 실행 후 관련 Redis 캐시 자동 무효화
- 실패한 작업이 있으면 exit code 1 반환 (CI/cron 연동 용이)
- 권장 시간: **매일 04:00 KST**

### 주간 동기화 — `pnpm sync:weekly`

의원 정보, 사진을 동기화한다.

```bash
cd backend
pnpm sync:weekly       # 기본 22대
pnpm sync:weekly 21    # 21대 지정
```

- 스크립트: `src/sync/sync-weekly.ts`
- 대상: members → photos
- 권장 시간: **매주 월요일 03:00 KST**

### 개별 동기화

특정 데이터만 동기화할 때 사용한다.

```bash
pnpm sync:members       # 의원 정보
pnpm sync:bills          # 발의 법안
pnpm sync:votes          # 본회의 표결
pnpm sync:photos         # 의원 사진
pnpm sync:member-votes   # 의원별 표결 (35만건+, 오래 걸림)
pnpm sync:attendance     # 출석 통계
pnpm sync:assets         # 재산 정보 (CSV 수동)
pnpm sync                # 전체 (members + bills + votes)
```

### 재산 동기화 (수동)

재산 데이터는 API가 아닌 CSV 파일에서 수동으로 가져온다.

```bash
# 1. CSV 파일을 backend/data/assets/ 디렉토리에 배치
#    파일명 규칙: assets_YYYY.csv (예: assets_2023.csv, assets_2024.csv)
# 2. 동기화 실행
pnpm sync:assets
```

---

## cron 설정 예시

### Linux/macOS crontab

```cron
# 매일 04:00 KST — 법안/표결/출석 동기화
0 4 * * * cd /path/to/congressman/backend && pnpm sync:daily >> /var/log/sync-daily.log 2>&1

# 매주 월요일 03:00 KST — 의원 정보/사진 동기화
0 3 * * 1 cd /path/to/congressman/backend && pnpm sync:weekly >> /var/log/sync-weekly.log 2>&1
```

### GitHub Actions (예시)

```yaml
name: Data Sync
on:
  schedule:
    - cron: '0 19 * * *'   # UTC 19:00 = KST 04:00 (매일)
    - cron: '0 18 * * 0'   # UTC 18:00 일요일 = KST 03:00 월요일 (주간)
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter backend prisma:generate
      - name: Daily sync
        if: github.event.schedule == '0 19 * * *' || github.event_name == 'workflow_dispatch'
        run: pnpm --filter backend sync:daily
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          ASSEMBLY_API_KEY: ${{ secrets.ASSEMBLY_API_KEY }}
          UPSTASH_REDIS_REST_URL: ${{ secrets.UPSTASH_REDIS_REST_URL }}
          UPSTASH_REDIS_REST_TOKEN: ${{ secrets.UPSTASH_REDIS_REST_TOKEN }}
      - name: Weekly sync
        if: github.event.schedule == '0 18 * * 0'
        run: pnpm --filter backend sync:weekly
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          ASSEMBLY_API_KEY: ${{ secrets.ASSEMBLY_API_KEY }}
          UPSTASH_REDIS_REST_URL: ${{ secrets.UPSTASH_REDIS_REST_URL }}
          UPSTASH_REDIS_REST_TOKEN: ${{ secrets.UPSTASH_REDIS_REST_TOKEN }}
```

---

## 환경 변수

동기화 스크립트에 필요한 환경 변수 (`backend/.env`):

| 변수 | 용도 |
|------|------|
| `DATABASE_URL` | Supabase PostgreSQL 연결 (Session pooler) |
| `ASSEMBLY_API_KEY` | 열린국회정보 Open API 키 |
| `UPSTASH_REDIS_REST_URL` | Redis 캐시 무효화용 |
| `UPSTASH_REDIS_REST_TOKEN` | Redis 인증 토큰 |

---

## 데이터량 참고 (22대 기준)

| 데이터 | 건수 | 풀싱크 소요 시간 |
|--------|------|----------------|
| 의원 정보 | 296건 | ~5초 |
| 발의 법안 | ~15,400건 | ~30초 |
| 본회의 표결 | ~1,225건 | ~10초 |
| 의원별 표결 | ~359,000건 | ~5분 |
| 출석 통계 | 296건 (계산) | ~10초 |
| 의원 사진 | 296건 | ~20초 |

매일 동기화 전체 소요: 약 **6~7분**
주간 동기화 전체 소요: 약 **30초**
