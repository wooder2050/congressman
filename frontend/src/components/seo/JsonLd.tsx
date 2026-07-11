interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * JSON-LD를 스크립트로 삽입할 때 `<`, `>`, `&`를 유니코드 이스케이프해
 * 데이터에 `</script>` 등이 포함돼도 script 태그를 탈출하지 못하도록 방어한다.
 */
function safeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  );
}
