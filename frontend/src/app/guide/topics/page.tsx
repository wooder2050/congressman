import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "주제별 법안 가이드 — 22대 국회 주요 분야별 입법 동향 분석",
  description:
    "22대 국회에서 논의 중인 주요 분야별 법안 동향을 살펴보세요. 보건의료, 부동산, 경제, 교육, 노동, 환경 등 15개 분야별 핵심 쟁점과 입법 방향을 알기 쉽게 설명합니다.",
  alternates: { canonical: "https://www.lawmake.kr/guide/topics" },
  openGraph: {
    title: "주제별 법안 가이드 — 22대 국회 주요 분야별 입법 동향",
    description:
      "보건의료, 부동산, 경제, 교육 등 15개 분야별 핵심 쟁점과 입법 방향을 알기 쉽게 설명합니다.",
    url: "https://www.lawmake.kr/guide/topics",
  },
};

const topics = [
  {
    emoji: "\u{1F3E5}",
    name: "보건\u00B7의료",
    summary: "국민 건강권 보장과 의료 접근성 향상을 위한 입법 활동",
    background:
      "대한민국은 전 국민 건강보험 체계를 운영하고 있으며, 의료 접근성과 보장성 확대는 국회의 핵심 의제 중 하나입니다. 고령화 사회 진입과 함께 의료비 부담, 지역 의료 격차, 필수의료 인력 부족 등이 주요 과제로 떠오르고 있습니다.",
    issues: [
      "건강보험 보장 범위 확대와 비급여 항목 축소를 통한 국민 의료비 부담 경감",
      "필수의료(응급의학, 소아과, 산부인과 등) 인력 확충 및 처우 개선",
      "지역 공공의료 인프라 강화와 의료 취약지 해소",
      "디지털 헬스케어, 원격의료 등 새로운 의료 기술에 대한 제도적 기반 마련",
    ],
    significance:
      "의료 관련 법안은 국민의 생명과 건강에 직접적으로 영향을 미치는 만큼, 모든 시민이 관심을 가지고 입법 과정을 지켜볼 필요가 있습니다. 특히 고령사회 진입에 따른 의료비 증가와 의료인력 수급 문제는 향후 수십 년간 한국 사회의 핵심 과제가 될 것입니다.",
  },
  {
    emoji: "\u{1F3E0}",
    name: "부동산\u00B7주거",
    summary: "주거 안정과 부동산 시장 건전화를 위한 입법 활동",
    background:
      "주거 문제는 대한민국 국민의 가장 큰 관심사 중 하나입니다. 수도권 집중에 따른 주택 가격 상승, 전세 사기 피해, 1인 가구 증가에 따른 주거 형태 다양화 등이 주요 과제입니다. 국회에서는 공급 확대, 세제 조정, 임차인 보호 등 다양한 접근의 법안이 논의되고 있습니다.",
    issues: [
      "주택 공급 확대를 위한 재건축·재개발 규제 완화 및 공공주택 확충",
      "임대차 3법(전월세상한제, 계약갱신청구권, 전월세신고제) 개선",
      "전세 사기 피해 방지와 임차인 보호 강화",
      "청년·신혼부부 주거 지원 확대와 1인 가구 주거 대책",
    ],
    significance:
      "부동산 관련 법안은 국민의 자산과 주거 안정에 직결됩니다. 주택 정책의 방향에 따라 부동산 가격, 임대료, 주거 형태가 변화하므로 시민의 적극적인 관심과 의견 개진이 중요합니다.",
  },
  {
    emoji: "\u{1F4B0}",
    name: "경제\u00B7산업",
    summary: "경제 성장과 공정한 시장 질서를 위한 입법 활동",
    background:
      "글로벌 경제 불확실성 속에서 대한민국 경제의 경쟁력 강화와 공정한 시장 질서 확립은 국회의 중요한 과제입니다. 반도체·배터리 등 첨단산업 육성, 중소기업·소상공인 지원, 공정거래 질서 확립 등이 주요 의제로 다뤄지고 있습니다.",
    issues: [
      "첨단산업(반도체, 2차전지, 바이오) 투자 촉진 및 세제 지원",
      "공정거래법 강화와 대기업-중소기업 간 상생 협력",
      "소상공인·자영업자 지원 확대 및 온라인 플랫폼 규제",
      "금융 소비자 보호와 가계부채 관리 방안",
    ],
    significance:
      "경제·산업 관련 법안은 기업 활동의 규칙을 정하고, 소비자와 노동자를 보호하며, 국가 경제의 방향을 결정합니다. 일자리, 물가, 투자 환경 등 국민 생활 전반에 영향을 미치는 중요한 분야입니다.",
  },
  {
    emoji: "\u{1F476}",
    name: "육아\u00B7교육",
    summary: "저출생 대응과 교육 혁신을 위한 입법 활동",
    background:
      "대한민국은 세계 최저 수준의 출산율을 기록하고 있으며, 이에 대한 종합적인 대응이 시급합니다. 보육·돌봄 지원 확대, 교육 과정 개편, 사교육비 부담 완화 등이 국회에서 활발하게 논의되고 있습니다. 교육 분야에서는 AI 시대에 맞는 교육 체계 혁신도 주요 과제입니다.",
    issues: [
      "출산·양육 지원금 확대 및 육아휴직 제도 개선",
      "국공립 어린이집 확충과 보육 서비스 품질 향상",
      "사교육비 부담 완화 및 공교육 정상화",
      "학교폭력 예방·대응 체계 강화와 학생 정신건강 지원",
    ],
    significance:
      "육아·교육 관련 법안은 미래 세대의 성장 환경을 결정합니다. 저출생 문제 해결과 교육의 질 향상은 국가의 지속가능한 발전을 위한 필수 과제이며, 학부모와 학생 모두에게 직접적인 영향을 미칩니다.",
  },
  {
    emoji: "\u{1F4BC}",
    name: "노동\u00B7고용",
    summary: "근로자 권익 보호와 고용 환경 개선을 위한 입법 활동",
    background:
      "산업 구조의 변화, 플랫폼 노동의 확산, 고령 노동자 증가 등으로 노동 시장이 빠르게 변화하고 있습니다. 근로시간 유연화, 비정규직 보호, 산업안전 강화 등이 주요 쟁점이며, 노사 간 이해관계가 첨예하게 대립하는 분야이기도 합니다.",
    issues: [
      "근로시간 제도 개편과 유연근무제 확대",
      "플랫폼 노동자(배달, 대리운전 등) 보호 및 사회보험 적용",
      "중대재해 예방과 산업안전 체계 강화",
      "최저임금 결정 구조 개선과 임금 격차 해소",
    ],
    significance:
      "노동·고용 관련 법안은 수천만 근로자의 근무 환경, 임금, 안전에 직접적인 영향을 미칩니다. 일하는 사람이라면 누구나 관심을 가져야 할 분야이며, 노동 정책의 변화는 사회 전체의 삶의 질을 좌우합니다.",
  },
  {
    emoji: "\u{1F331}",
    name: "환경\u00B7에너지",
    summary: "기후변화 대응과 지속가능한 발전을 위한 입법 활동",
    background:
      "기후변화가 전 세계적 과제로 부상하면서, 대한민국도 2050 탄소중립 목표를 설정하고 에너지 전환을 추진하고 있습니다. 재생에너지 확대, 탄소 배출 규제, 환경오염 방지 등이 주요 의제이며, 경제 성장과 환경 보호 사이의 균형이 핵심 쟁점입니다.",
    issues: [
      "2050 탄소중립 이행을 위한 산업별 감축 목표 설정",
      "태양광·풍력 등 재생에너지 보급 확대와 전력 시장 개편",
      "미세먼지·수질오염 등 생활환경 개선",
      "탄소국경세 대응과 친환경 산업 전환 지원",
    ],
    significance:
      "환경·에너지 관련 법안은 현세대와 미래 세대 모두의 생존 환경에 영향을 미칩니다. 기후변화 대응은 더 이상 선택이 아닌 필수이며, 에너지 정책의 방향은 산업 구조와 국민 생활을 근본적으로 변화시킵니다.",
  },
  {
    emoji: "\u2696\uFE0F",
    name: "법\u00B7사법",
    summary: "법치주의 강화와 국민 기본권 보호를 위한 입법 활동",
    background:
      "사법 제도는 민주주의의 근간입니다. 형사 절차의 공정성 확보, 피해자 권리 보호, 사법 접근성 향상 등이 주요 과제이며, 디지털 시대에 맞는 새로운 법적 기준 마련도 중요한 의제입니다.",
    issues: [
      "형사사법 절차의 공정성 강화와 피의자 인권 보호",
      "범죄 피해자 보호·지원 체계 확충",
      "디지털 증거 수집 절차와 개인정보 보호 간 균형",
      "사법부 독립성 보장과 재판 지연 해소",
    ],
    significance:
      "법·사법 분야의 법안은 국민의 기본권과 직결됩니다. 공정한 재판을 받을 권리, 범죄로부터의 보호, 개인정보 보호 등은 모든 시민에게 영향을 미치는 핵심 가치입니다.",
  },
  {
    emoji: "\u{1F697}",
    name: "교통\u00B7물류",
    summary: "교통 안전과 물류 효율화를 위한 입법 활동",
    background:
      "교통은 국민의 일상생활과 경제 활동에 필수적인 인프라입니다. 교통사고 예방, 대중교통 확충, 자율주행 기술 도입, 물류 산업 현대화 등이 주요 과제이며, 모빌리티 혁신에 대한 법적 기반 마련도 활발히 논의되고 있습니다.",
    issues: [
      "교통사고 사망자 감소를 위한 도로교통법 강화",
      "대중교통 서비스 개선과 교통 취약지역 접근성 향상",
      "자율주행차·전동킥보드 등 신교통수단에 대한 법적 기반 마련",
      "물류 산업 경쟁력 강화와 택배 노동자 처우 개선",
    ],
    significance:
      "교통·물류 관련 법안은 국민의 이동권과 안전에 직접적인 영향을 미칩니다. 매일 출퇴근하고, 물건을 주문하는 일상 속에서 교통·물류 정책은 삶의 편의성과 안전성을 결정짓습니다.",
  },
  {
    emoji: "\u{1F91D}",
    name: "복지\u00B7돌봄",
    summary: "사회 안전망 강화와 돌봄 체계 구축을 위한 입법 활동",
    background:
      "고령화, 1인 가구 증가, 소득 양극화 심화로 사회적 돌봄의 중요성이 커지고 있습니다. 기초생활보장, 장애인 자립 지원, 노인 돌봄, 아동 보호 등 취약계층을 위한 사회 안전망 확충이 국회의 주요 과제입니다.",
    issues: [
      "기초생활보장제도 사각지대 해소와 급여 현실화",
      "장애인 자립생활 지원과 편의시설 확충",
      "노인 장기요양보험 보장 확대와 돌봄 인력 처우 개선",
      "아동학대 예방·대응 체계 강화와 위기 아동 보호",
    ],
    significance:
      "복지·돌봄 관련 법안은 사회적 약자의 인간다운 삶을 보장합니다. 누구나 질병, 장애, 노령 등으로 돌봄이 필요해질 수 있으며, 촘촘한 사회 안전망은 모든 시민의 안전판이 됩니다.",
  },
  {
    emoji: "\u{1F3DB}\uFE0F",
    name: "행정\u00B7지방자치",
    summary: "효율적 정부 운영과 지방분권을 위한 입법 활동",
    background:
      "중앙정부와 지방자치단체 간 권한 배분, 행정 효율화, 공무원 제도 개혁 등이 주요 과제입니다. 지방소멸 위기에 대응하기 위한 균형발전 정책과 자치분권 확대도 활발히 논의되고 있습니다.",
    issues: [
      "지방자치단체 재정 자립도 향상과 재정 분권 확대",
      "지방소멸 위기 지역 지원과 균형발전 정책",
      "행정 디지털 전환과 전자정부 서비스 고도화",
      "공무원 인사 제도 개혁과 정부 조직 효율화",
    ],
    significance:
      "행정·지방자치 관련 법안은 정부의 운영 방식과 지역 사회의 미래를 결정합니다. 수도권 집중 완화, 지방 균형 발전, 효율적 행정 서비스는 전국 모든 시민의 생활 환경에 영향을 미칩니다.",
  },
  {
    emoji: "\u{1F33E}",
    name: "농업\u00B7식품",
    summary: "농업 경쟁력 강화와 식품 안전을 위한 입법 활동",
    background:
      "농업은 식량 안보와 국토 보전의 핵심 산업이지만, 농촌 고령화와 인구 감소, 수입 농산물과의 경쟁 등으로 어려움을 겪고 있습니다. 스마트팜 등 농업 혁신, 농가 소득 지원, 식품 안전 관리 강화 등이 주요 과제입니다.",
    issues: [
      "농가 소득 안정화와 직불금 제도 확대",
      "스마트팜·친환경 농업 등 농업 혁신 기반 구축",
      "식품 안전 관리 강화와 원산지 표시 제도 개선",
      "농촌 정주 여건 개선과 귀농·귀촌 지원",
    ],
    significance:
      "농업·식품 관련 법안은 매일 먹는 음식의 안전성과 가격에 영향을 미칩니다. 식량 자급률 향상과 농촌 지역 활성화는 국가 전체의 지속가능성과 직결되는 중요한 과제입니다.",
  },
  {
    emoji: "\u{1F3AD}",
    name: "문화\u00B7체육",
    summary: "문화 진흥과 국민 체육 활동 활성화를 위한 입법 활동",
    background:
      "K-컬처의 세계적 성공과 함께, 문화 산업 지원과 예술인 복지가 주요 의제로 부상하고 있습니다. 생활체육 활성화, 장애인 체육 지원, 스포츠 공정성 확보 등도 국회에서 다루는 중요한 과제입니다.",
    issues: [
      "예술인 고용보험 확대와 창작 활동 지원",
      "콘텐츠 산업(게임, 웹툰, 영화 등) 진흥과 불법 유통 근절",
      "생활체육 시설 확충과 국민 체육 활동 지원",
      "문화 향유 격차 해소와 문화 다양성 보호",
    ],
    significance:
      "문화·체육 관련 법안은 국민의 삶의 질과 정서적 풍요에 영향을 미칩니다. 문화 활동과 체육 활동은 건강한 사회의 기반이며, 문화 산업은 대한민국의 새로운 성장 동력입니다.",
  },
  {
    emoji: "\u{1F4F1}",
    name: "과학기술\u00B7ICT",
    summary: "기술 혁신과 디지털 사회 규범을 위한 입법 활동",
    background:
      "AI, 반도체, 우주산업, 양자컴퓨팅 등 첨단 기술이 빠르게 발전하면서, 기술 육성과 규제 사이의 균형이 중요한 과제가 되고 있습니다. 개인정보 보호, 플랫폼 규제, 디지털 격차 해소 등 디지털 사회의 새로운 규범도 국회에서 활발히 논의되고 있습니다.",
    issues: [
      "AI 산업 육성과 AI 윤리·규제 프레임워크 마련",
      "반도체·우주·양자 등 첨단 기술 R&D 투자 확대",
      "개인정보 보호 강화와 데이터 경제 활성화 간 균형",
      "디지털 격차 해소와 정보 소외 계층 지원",
    ],
    significance:
      "과학기술·ICT 관련 법안은 미래 산업의 방향과 디지털 사회의 규칙을 정합니다. AI가 일상에 깊이 들어온 지금, 기술 발전의 혜택을 누구나 공정하게 누릴 수 있도록 하는 법적 기반이 중요합니다.",
  },
  {
    emoji: "\u{1F310}",
    name: "외교\u00B7안보",
    summary: "국가 안보 강화와 국제 협력을 위한 입법 활동",
    background:
      "한반도의 지정학적 특수성과 글로벌 질서 재편 속에서, 국방력 강화, 동맹 관계 심화, 통상 정책 등이 주요 과제입니다. 방위산업 발전, 사이버 안보, 국제 개발 협력 등도 국회의 중요한 의제입니다.",
    issues: [
      "국방비 적정 수준 확보와 방위산업 경쟁력 강화",
      "사이버 안보 체계 구축과 핵심 인프라 보호",
      "한미 동맹 심화와 인도·태평양 전략 참여",
      "국제 개발 협력(ODA) 확대와 글로벌 리더십 강화",
    ],
    significance:
      "외교·안보 관련 법안은 국가의 존립과 국제적 위상에 직결됩니다. 안보 환경의 변화에 대응하는 국방 정책과 외교 전략은 모든 국민의 안전과 번영의 기반입니다.",
  },
  {
    emoji: "\u{1F512}",
    name: "안전\u00B7치안",
    summary: "국민 안전 확보와 치안 강화를 위한 입법 활동",
    background:
      "이태원 참사, 오송 수해 등 대형 사고를 계기로 재난 대응 체계 개편에 대한 논의가 활발합니다. 강력범죄 대응, 디지털 성범죄 근절, 소방·경찰 인력 확충 등도 시민 안전을 위한 주요 과제입니다.",
    issues: [
      "대형 재난·사고 대응 체계 개편과 예방 투자 확대",
      "스토킹·디지털 성범죄 등 신종 범죄 대응 법안 강화",
      "소방·경찰 인력 확충과 처우 개선",
      "학교 주변·생활 안전 인프라 확충",
    ],
    significance:
      "안전·치안 관련 법안은 국민이 안심하고 생활할 수 있는 환경을 만듭니다. 재난 예방, 범죄 대응, 생활 안전 등은 모든 시민의 기본적인 생존권과 직결되는 핵심 분야입니다.",
  },
];

export default function TopicsGuidePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "홈", item: "https://www.lawmake.kr" },
            {
              "@type": "ListItem",
              position: 2,
              name: "입법 과정 안내",
              item: "https://www.lawmake.kr/guide",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "주제별 법안 가이드",
              item: "https://www.lawmake.kr/guide/topics",
            },
          ],
        }}
      />

      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">주제별 법안 가이드</h1>
        <p className="mt-3 text-sm leading-relaxed text-(--color-text-secondary)">
          22대 국회에서는 다양한 분야의 법안이 발의되고 심사되고 있습니다. 각 분야별로 어떤 쟁점이
          논의되고 있는지, 왜 중요한지를 이해하면 뉴스에서 접하는 법안 소식을 더 깊이 있게 해석할 수
          있습니다. 아래 15개 주제 분야별 핵심 쟁점과 입법 동향을 살펴보세요.
        </p>
      </section>

      {/* 주제 목차 */}
      <nav className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-4 sm:p-5">
        <h2 className="mb-3 text-base font-bold text-(--color-text-primary)">분야별 바로가기</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {topics.map((topic) => (
            <a
              key={topic.name}
              href={`#${topic.name}`}
              className="flex items-center gap-1.5 rounded-lg bg-(--color-bg-primary) px-3 py-2 text-sm font-medium text-(--color-text-secondary) no-underline transition-colors hover:bg-(--color-bg-hover)"
            >
              <span>{topic.emoji}</span>
              {topic.name}
            </a>
          ))}
        </div>
      </nav>

      {/* 주제별 상세 */}
      <div className="space-y-8">
        {topics.map((topic) => (
          <section
            key={topic.name}
            id={topic.name}
            className="scroll-mt-20 space-y-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{topic.emoji}</span>
              <div>
                <h2 className="text-xl font-bold text-(--color-text-primary)">{topic.name}</h2>
                <p className="mt-0.5 text-sm text-(--color-text-tertiary)">{topic.summary}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-(--color-text-primary)">배경 및 현황</h3>
              <p className="text-sm leading-relaxed text-(--color-text-secondary)">
                {topic.background}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-(--color-text-primary)">주요 쟁점</h3>
              <ul className="space-y-2">
                {topic.issues.map((issue, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm leading-relaxed text-(--color-text-secondary)"
                  >
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-primary)" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 rounded-lg bg-(--color-bg-secondary) p-4">
              <h3 className="text-sm font-bold text-(--color-text-primary)">왜 중요한가요?</h3>
              <p className="text-sm leading-relaxed text-(--color-text-secondary)">
                {topic.significance}
              </p>
            </div>

            <div className="pt-1">
              <Link
                href={`/bills?topic=${encodeURIComponent(topic.name)}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-(--color-primary) no-underline hover:underline"
              >
                {topic.name} 관련 법안 보기 →
              </Link>
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-6">
        <h2 className="text-lg font-bold text-(--color-text-primary)">더 알아보기</h2>
        <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
          각 분야의 법안 목록을 직접 검색하고, 법안의 심사 진행 상황을 추적해 보세요.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/bills"
            className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
          >
            법안 검색하기
          </Link>
          <Link
            href="/guide"
            className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            입법 과정 안내
          </Link>
          <Link
            href="/weekly"
            className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            주간 국회 뉴스
          </Link>
        </div>
      </section>
    </div>
  );
}
