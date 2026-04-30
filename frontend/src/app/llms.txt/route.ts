const CONTENT = `# lawmake — 국회의원 의정활동 정보 플랫폼

> 대한민국 22대 국회의원 295명의 출석률·법안 발의·표결 기록을 검색하고 비교하세요.

lawmake는 열린국회정보 공공 API에서 제공하는 객관적 데이터를 기반으로 국회의원의 의정활동을 분석·제공하는 플랫폼입니다.

## 주요 기능

- **의원 검색·비교**: 295명 의원의 출석률, 법안 발의 건수, 표결 참여율, 재산 신고 내역 비교
- **법안 검색**: 22대 국회 18,000건+ 발의 법안 검색, AI 요약, 심사 경과 추적
- **본회의 표결**: 1,400건+ 표결 기록, 의원별 찬반 투표 현황 공개
- **선거구 지도**: 전국 254개 지역구 인터랙티브 지도
- **의원 성적표**: 출석·표결·발의·가결률 종합 평가 (의원별 스코어카드)
- **주간 국회 뉴스**: 매주 주요 법안·정치 이슈 요약
- **재보궐선거**: 6·3 재보궐선거 14곳 선거구·후보 정보

## 주요 페이지

- 홈: https://www.lawmake.kr/
- 의원 목록: https://www.lawmake.kr/members
- 의원 상세: https://www.lawmake.kr/members/{id}
- 의원 성적표: https://www.lawmake.kr/members/scorecard
- 의원 재산: https://www.lawmake.kr/members/property
- 법안 검색: https://www.lawmake.kr/bills
- 법안 상세: https://www.lawmake.kr/bills/{id}
- 본회의 표결: https://www.lawmake.kr/votes
- 선거구 지도: https://www.lawmake.kr/map
- 의원 비교: https://www.lawmake.kr/compare
- 위원회: https://www.lawmake.kr/committees
- 주간 뉴스: https://www.lawmake.kr/weekly
- 입법 과정 안내: https://www.lawmake.kr/guide
- 국회 용어 사전: https://www.lawmake.kr/glossary
- 재보궐선거: https://www.lawmake.kr/elections/2026-06-03

## 데이터 출처

- 열린국회정보 공공 API (https://open.assembly.go.kr)
- 국회의원 정보·법안 발의·본회의 표결·출석·위원회 회의록
- 매일 자동 동기화, AI 요약 제공

## 기술 스택

- Next.js (React), NestJS, Prisma ORM, PostgreSQL
- Upstash Redis (캐싱), Vercel (프론트엔드), Railway (백엔드)

## 연락처

- 웹사이트: https://www.lawmake.kr
- 이메일: dev@lawmake.kr
`;

export async function GET() {
  return new Response(CONTENT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
