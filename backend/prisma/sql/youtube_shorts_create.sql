-- YouTubeShort 테이블 생성 + RLS (2026-10-06)
--
-- prisma db push로 만들면 RLS가 꺼진 채 생성돼 공개 anon 키(PostgREST)로 읽기·삭제가 열린다
-- (2026-08-25 BillDiscussion 사고). 생성과 RLS·권한 회수를 한 트랜잭션으로 적용해 노출 구간을 없앤다.
-- 공개 읽기 정책은 만들지 않는다 — 공개 데이터는 NestJS API(활성 영상 필터·편집 메모 제외)로만 나간다.
--
-- DDL은 `prisma migrate diff --from-schema-datasource --to-schema-datamodel`로 schema.prisma에서 생성했다.
-- 적용: npx prisma db execute --file prisma/sql/youtube_shorts_create.sql --schema prisma/schema.prisma
-- 주의: schema.prisma에 모델이 없는 코드가 main으로 배포되면 Railway db push가 이 테이블을 지우려다 실패한다.

BEGIN;

CREATE TABLE "YouTubeShort" (
    "videoId" VARCHAR(11) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "publishedAt" TIMESTAMPTZ(3) NOT NULL,
    "durationSeconds" INTEGER,
    "issueSlug" TEXT NOT NULL DEFAULT 'audit-2026',
    "committee" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "showOnHome" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "sourceUrl" TEXT,
    "editorialNote" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "YouTubeShort_pkey" PRIMARY KEY ("videoId")
);

CREATE INDEX "YouTubeShort_issueSlug_active_publishedAt_idx" ON "YouTubeShort"("issueSlug", "active", "publishedAt" DESC);

ALTER TABLE public."YouTubeShort" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."YouTubeShort" FROM PUBLIC, anon, authenticated;

COMMIT;
