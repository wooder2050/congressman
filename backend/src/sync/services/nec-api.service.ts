/**
 * 중앙선거관리위원회 공공데이터 API 클라이언트
 * Base: https://apis.data.go.kr/9760000/
 */
export class NecApiService {
  private readonly serviceKey: string;

  constructor() {
    const key = process.env.NEC_API_KEY;
    if (!key) throw new Error('NEC_API_KEY is not set');
    this.serviceKey = key;
  }

  /**
   * NEC API에서 전체 페이지를 자동 순회하며 모든 row를 반환
   */
  async fetchAll<T>(
    serviceName: string,
    operationName: string,
    params: Record<string, string> = {},
    pageSize = 100,
  ): Promise<T[]> {
    const allItems: T[] = [];
    let pageNo = 1;
    let totalCount = Infinity;

    while (allItems.length < totalCount) {
      const url = new URL(
        `https://apis.data.go.kr/9760000/${serviceName}/${operationName}`,
      );
      url.searchParams.set('ServiceKey', this.serviceKey);
      url.searchParams.set('resultType', 'json');
      url.searchParams.set('pageNo', String(pageNo));
      url.searchParams.set('numOfRows', String(pageSize));
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
      }

      console.log(
        `[NEC-API] Fetching ${serviceName}/${operationName} page ${pageNo} ...`,
      );

      const res = await fetch(url.toString(), {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      if (!res.ok) {
        console.warn(
          `[NEC-API] HTTP ${res.status} for ${serviceName}/${operationName} page ${pageNo}`,
        );
        break;
      }

      const json = await res.json();
      const body = json?.response?.body;

      if (!body) {
        const resultCode = json?.response?.header?.resultCode;
        if (resultCode === '00') {
          // 정상이지만 데이터 없음
          break;
        }
        console.warn(
          `[NEC-API] Unexpected response for ${serviceName}/${operationName} page ${pageNo}:`,
          json?.response?.header,
        );
        break;
      }

      totalCount = body.totalCount ?? 0;
      const items = body.items?.item;

      if (!items) break;

      // 단건이면 배열로 감싸기
      const rows: T[] = Array.isArray(items) ? items : [items];
      allItems.push(...rows);

      console.log(
        `[NEC-API]   Got ${rows.length} rows (total: ${allItems.length}/${totalCount})`,
      );

      if (allItems.length >= totalCount) break;
      pageNo++;

      // rate limiting (300ms)
      await new Promise((r) => setTimeout(r, 300));
    }

    return allItems;
  }
}
