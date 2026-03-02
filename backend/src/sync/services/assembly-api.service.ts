export class AssemblyApiService {
  private readonly apiKey: string;

  constructor() {
    const key = process.env.ASSEMBLY_API_KEY;
    if (!key) throw new Error('ASSEMBLY_API_KEY is not set');
    this.apiKey = key;
  }

  /**
   * 국회 API에서 전체 페이지를 자동으로 순회하며 모든 row를 반환
   */
  async fetchAll<T>(
    endpoint: string,
    params: Record<string, string> = {},
    pageSize = 100,
  ): Promise<T[]> {
    const allRows: T[] = [];
    let pIndex = 1;
    let totalCount = Infinity;

    while (allRows.length < totalCount) {
      const url = new URL(`https://open.assembly.go.kr/portal/openapi/${endpoint}`);
      url.searchParams.set('KEY', this.apiKey);
      url.searchParams.set('Type', 'json');
      url.searchParams.set('pIndex', String(pIndex));
      url.searchParams.set('pSize', String(pageSize));
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
      }

      console.log(`[API] Fetching ${endpoint} page ${pIndex} ...`);
      const res = await fetch(url.toString(), {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const json = await res.json();

      const data = json[endpoint];
      if (!data || !data[1]?.row) {
        const resultCode = data?.[0]?.head?.[1]?.RESULT?.CODE;
        if (resultCode === 'INFO-200') break;
        console.warn(`[API] Unexpected response for ${endpoint} page ${pIndex}`);
        break;
      }

      totalCount = data[0].head[0].list_total_count;
      const rows = data[1].row as T[];
      allRows.push(...rows);
      console.log(`[API]   Got ${rows.length} rows (total: ${allRows.length}/${totalCount})`);
      pIndex++;

      // rate limiting
      await new Promise((r) => setTimeout(r, 100));
    }

    return allRows;
  }
}
