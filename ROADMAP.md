# ROADMAP — 국회의원 의정활동 정보 플랫폼

> 기획안 v5.0 + v4.2(비즈니스/콘텐츠/타겟) 기반 전체 작업 계획
> 최종 갱신: 2026-02-16

---

## Phase 1: MVP (8주) — ✅ 완료

### 백엔드
- [x] NestJS + Prisma 대수별 스키마 (Member ↔ MemberTerm 분리)
- [x] Upstash Redis + CacheModule (글로벌 등록, TTL 1시간)
- [x] TermsModule — 대수 목록 API
- [x] MembersModule — 의원 목록/상세/대수별 정보/역대 활동
- [x] AttendanceModule — 출석 통계 + 결석 상세
- [x] BillsModule — 법안 목록 (페이지네이션, 필터)
- [x] CollectorModule (sync-runner) — 의원, 법안, 표결, 사진, 출석 동기화
- [x] Railway 배포 설정

### 프론트엔드
- [x] Next.js 앱 라우터 + 디자인 시스템 (shadcn/ui, Radix UI)
- [x] 대수 선택 UI (Header 드롭다운, ?term= 쿼리 파라미터)
- [x] 의원 목록 (/members) — 검색 + 정당 필터 + 그리드
- [x] 의원 상세 (/members/[id]) — 프로필 + 출석 탭 + 법안 탭
- [x] 출석률 도넛 차트 + 법안 목록
- [x] 역대 활동 비교 (/members/[id]/history) — 대수별 바 차트
- [x] ISR + Redis 이중 캐싱 전략

---

## Phase 2: 확장 (6주) — ✅ 완료

### 백엔드
- [x] VotesModule — 표결 목록 + 요약 + 의원별 표결 이력
- [x] AssetsModule — 재산 정보 (연도별 그룹 + 카테고리별 합산)
- [x] CSV 임포트 (pnpm sync:assets)
- [x] Swagger 공개 API 문서 (/api/docs)

### 프론트엔드
- [x] 표결 탭 — 찬/반/기권 이력, 정당 이탈 하이라이트
- [x] 재산 탭 — 연도별 바 차트 + 카테고리 스택 바 + 아코디언
- [x] 선거구 지도 (/map) — D3 + TopoJSON (카카오맵 대신)
  - [x] 전국 → 시도 → 선거구 드릴다운
  - [x] 정당 컬러 폴리곤 오버레이
  - [x] 바텀시트 팝업 (의원 사진 + 이름 + 정당 + 상세 보기)
- [x] 의원 비교 (/compare) — 최대 4명 비교
- [x] 카카오톡 OG 공유 최적화 (동적 OG 이미지)
- [x] 표결 목록 페이지 (/votes)
- [x] 법안 목록 페이지 (/bills)

---

## Phase 3: 본회의장 좌석 배치도 (4주) — ✅ 완료

### 백엔드
- [x] GET /api/votes/:id/member-votes — 표결별 의원 투표 내역

### 프론트엔드
- [x] Hemicycle 레이아웃 알고리즘 (17행 300석 반원형 좌표 자동 생성)
- [x] 의원-좌석 매핑 (정당 좌→우 정렬)
- [x] 본회의장 SVG 렌더링 (/chamber) — viewBox 1000x600, 300 circles
- [x] 좌석 터치 → 의원 바텀시트 팝업 (이름 + 정당 + 선거구 + 상세 보기)
- [x] 표결 시각화 — 드롭다운으로 법안 선택 → 찬성(초록)/반대(빨강)/기권(노랑)/불참(회색) 좌석 색상 전환
- [x] 정당별/표결별 범례

---

## Phase 3.5: 법안/표결 상세 페이지 — ✅ 완료

> 목록 페이지만 있고 상세 페이지가 없어 사용자가 개별 법안/표결 정보를 확인할 수 없는 문제 해결

### 백엔드
- [x] GET /api/bills/:id — 법안 상세 조회 (제목, 상태, 위원회, 발의자 목록)
- [x] GET /api/votes/:id — 표결 상세 조회 (기존 member-votes 엔드포인트 활용/정리)

### 프론트엔드 — 표결 상세 (`/votes/[id]`)
- [x] 표결 기본 정보 (법안명, 표결일, 결과, 위원회)
- [x] 찬/반/기권/불참 비율 차트 (VoteResultBar 활용)
- [x] 의원별 투표 목록 (정당별 그룹핑, 사진 + 이름 + 투표 결과)

### 프론트엔드 — 법안 상세 (`/bills/[id]`)
- [x] 법안 기본 정보 (제목, 상태, 제안일, 위원회)
- [x] 대표 발의자 + 공동 발의 의원 목록 (사진 + 이름 + 정당)
- [x] 관련 표결 연결 (해당 법안의 본회의 표결이 있으면 링크)

### 페이지 간 연결
- [x] 표결 목록 → 표결 상세 링크
- [x] 법안 목록 → 법안 상세 링크
- [x] 의원 상세 표결 탭 → 해당 표결 상세 링크
- [x] 의원 상세 법안 탭 → 해당 법안 상세 링크

---

## Phase 4: 품질 개선 + 운영 준비 — ✅ 완료

> 기획안 v5.0 §12 성과 지표 + v4.2 §10 비즈니스 평가 기반

### 성능 최적화
- [x] Pretendard 폰트 CDN dynamic subset 전환 (2.0MB → ~200KB)
- [x] recharts/lucide-react optimizePackageImports 적용
- [x] 지도 페이지 dynamic import (ssr: false)
- [x] Mock 데이터 완전 제거 (프로덕션 번들 경량화)
- [ ] Lighthouse Performance 90+, Accessibility 95+ 달성 (배포 후 측정)
- [ ] Android '매우 크게' 글꼴 설정 시 전 페이지 정상 확인

### SEO + 검색 유입
- [x] sitemap.xml 자동 생성 (정적 7페이지 + 동적 의원 URL)
- [x] robots.txt 설정
- [x] 각 페이지 메타 태그 점검 (metadataBase, twitter card, OG)
- [x] GTM 삽입 (GTM-5BXVCW6Z) + GA4 연결 (G-ZTER67RLWG)
- [x] 구글 서치콘솔 + 네이버 서치어드바이저 인증 메타태그
- [x] SVG 파비콘 (국회 돔 스타일)

### 접근성
- [x] Skip Link 추가 ("본문으로 건너뛰기")
- [x] Header aria-current="page" 추가

### 국회일정 연동
- [x] 열린국회정보 API 활용 (본회의 94건 + 위원회 1,409건)
- [x] Schedule DB 모델 추가 (Prisma)
- [x] 일정 동기화 서비스 (`pnpm sync:schedules`)
- [x] GET /api/schedules — 일정 목록 API (타입/페이지네이션)
- [x] GET /api/schedules/upcoming — 다가오는 일정 API
- [x] 홈화면 "다가오는 국회 일정" 섹션 추가
- [x] /schedule 페이지 (타입 필터, 날짜별 그룹핑, 안건 펼치기/접기)

### 운영
- [x] 데이터 동기화 자동화 (GitHub Actions cron: daily 04:00 KST, weekly 월 03:00 KST)
- [x] 수집 실패 시 GitHub Issue 자동 생성 알림
- [x] GitHub Actions Summary 마크다운 테이블 출력

---

## Phase 5: 콘텐츠 + 수익화 — ❌ 미착수

> 기획안 v4.2 §11 수익화 전략 + §12 콘텐츠 유통 전략 기반

### 콘텐츠 유통
- [ ] SEO 블로그 글 10~20개 선 작성 (검색 유입 자산화)
- [ ] 카드뉴스 템플릿 제작 (데이터 업데이트 시 반자동 생성)
- [ ] 커뮤니티 글 격주 1회 (반응 확인, 소재 발굴)
- [ ] "우리 동네 의원 성적표" 공유 기능

### 콘텐츠 소재
- [ ] 월간 출석률 랭킹 (TOP/WORST)
- [ ] 정당별 표결 이탈률
- [ ] 특정 법안 표결 시 찬/반 좌석 시각화 콘텐츠
- [ ] 21대 vs 22대 같은 선거구 의원 비교

### 수익화
- [ ] 애드센스 적용 (서버비 충당 목표, 총선 시즌 보너스)
- [ ] 후원/기부 모델 도입 (Buy Me a Coffee 등)
- [ ] API/데이터 라이선스 검토 (언론사/시민단체 대상)

---

## 기획안 참고 정보

### 데이터 소스 (v5.0 §5, §13)
| 데이터 | 출처 | 비고 |
|--------|------|------|
| 의원 정보 | 열린국회정보 API `nwvrqwxyaytdsfvhu` | 296건/22대 |
| 발의 법안 | 열린국회정보 API `nzmimeepazxkubdpn` | ~15,000건/22대 |
| 본회의 표결 | 열린국회정보 API `ncocpgfiaoituanbr` | 1,225건/22대 |
| 의원별 표결 | 열린국회정보 API `nojepdqqaweusdfbi` | 359,009건/22대 |
| 국회일정 | 국회일정 통합 API (data.go.kr/15126132) | Phase 4 예정 |
| 재산 정보 | 뉴스타파/정보공개센터 CSV | 수동 다운로드 |
| 선거구 GeoJSON | OhmyNews/southkorea-maps GitHub | 대수별 경계 |
| 행정동 경계 | vuski/admdongkor GitHub | 통계청 기준 |

### 타겟 사용자 (v4.2 §13)
- **메인 타겟**: 30~50대 정치 관심층
- **서브 타겟**: 시민단체/리서처, 언론사/기자
- UX 방향: 정보 밀도 높고 탐색 자유로운 설계 (기본 16px+, 터치 44px+, 명확한 컬러 대비)

### 성과 지표 (v5.0 §12)
- Lighthouse: Performance 90+, Accessibility 95+
- 유입: 카카오톡 공유 링크 유입 50%+
- 검색: '의원이름 + 국회' 네이버 1페이지
- 체류: 의원 상세 평균 2분+
- 지도: 선거구 지도 방문 20%+

### 비용 목표 (v5.0 §9)
- Vercel + Supabase + Upstash 무료 티어 + Railway Hobby
- 월 ~$5 목표
