"use client";

import { Suspense, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getPollTimeseries } from "@/lib/api";
import type { PollTimeseriesCandidate, PollTimeseriesPoint } from "@/types";

interface Props {
  raceId: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

type ChartRow = {
  date: string;
  pollId: number;
  agency: string;
  sampleSize: number | null;
  marginOfError: number | null;
} & Record<string, number | string | null>;

function buildChartData(points: PollTimeseriesPoint[], candidateNames: string[]): ChartRow[] {
  return points.map((p) => {
    const row: ChartRow = {
      date: formatDate(p.surveyEndedAt ?? p.registeredAt),
      pollId: p.pollId,
      agency: p.agency,
      sampleSize: p.sampleSize,
      marginOfError: p.marginOfError,
    };
    for (const name of candidateNames) {
      row[name] = p.rates[name] ?? null;
    }
    return row;
  });
}

function PartyColorMap(candidates: PollTimeseriesCandidate[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const c of candidates) {
    map[c.name] = c.party?.color ?? "#9ca3af";
  }
  return map;
}

function ChartInner({ raceId, agency }: { raceId: number; agency: string }) {
  const { data } = useCongressSuspenseQuery(getPollTimeseries, {
    raceId,
    agency: agency || undefined,
  });

  const candidateNames = useMemo(() => {
    if (!data) return [];
    const all = new Set<string>();
    for (const p of data.points) {
      for (const k of Object.keys(p.rates)) all.add(k);
    }
    return Array.from(all);
  }, [data]);

  const chartData = useMemo(
    () => (data ? buildChartData(data.points, candidateNames) : []),
    [data, candidateNames],
  );

  const colors = useMemo(() => (data ? PartyColorMap(data.candidates) : {}), [data]);

  if (!data || data.points.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-(--color-text-tertiary)">
        해당 선거에 대한 후보별 지지율 데이터가 아직 없습니다.
        <br />
        (PDF 파싱이 완료되면 자동으로 노출됩니다)
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-(--color-text-tertiary)">
        총 <span className="font-medium text-(--color-text-secondary)">{data.points.length}</span>건
        의 조사 (조사기관 {data.agencies.length}곳)
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `${v}%`}
              domain={[0, "auto"]}
            />
            <Tooltip
              formatter={(value) =>
                typeof value === "number" ? `${value.toFixed(1)}%` : String(value ?? "")
              }
              labelFormatter={(label, payload) => {
                const p = payload?.[0]?.payload as ChartRow | undefined;
                const labelStr = String(label ?? "");
                if (!p) return labelStr;
                return `${labelStr} · ${p.agency} (표본 ${p.sampleSize ?? "-"})`;
              }}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {candidateNames.map((name) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={colors[name] ?? "#9ca3af"}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-md border border-(--color-border) p-3 text-xs text-(--color-text-tertiary)">
        ※ 모든 조사 결과는 중앙선거여론조사심의위원회(NESDC) 등록 자료에서 자동 수집했습니다.
        조사기관 · 표본 · 응답률 · 표본오차는 개별 조사 페이지에서 확인할 수 있습니다.
      </div>
    </div>
  );
}

function AgencyFilter({
  agencies,
  value,
  onChange,
}: {
  agencies: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border border-(--color-border) bg-(--color-bg-primary) px-2 py-1 text-sm"
    >
      <option value="">모든 조사기관</option>
      {agencies.map((a) => (
        <option key={a} value={a}>
          {a}
        </option>
      ))}
    </select>
  );
}

function FilterAndChart({ raceId }: Props) {
  // 1차 fetch (필터 없이) → 가용 조사기관 목록 확보
  const { data: baseline } = useCongressSuspenseQuery(getPollTimeseries, {
    raceId,
    agency: undefined,
  });
  const [agency, setAgency] = useState<string>("");

  if (!baseline) {
    return (
      <p className="py-8 text-center text-sm text-(--color-text-tertiary)">
        선거 정보를 찾을 수 없습니다.
      </p>
    );
  }

  if (baseline.points.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-(--color-text-tertiary)">
        해당 선거에 대한 후보별 지지율 데이터가 아직 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <AgencyFilter agencies={baseline.agencies} value={agency} onChange={setAgency} />
      </div>
      <Suspense fallback={<p className="text-sm text-(--color-text-tertiary)">불러오는 중...</p>}>
        <ChartInner raceId={raceId} agency={agency} />
      </Suspense>
    </div>
  );
}

export default function RacePollTimeseries({ raceId }: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-(--color-text-primary)">여론조사 추이</h2>
      </div>
      <Suspense fallback={<p className="text-sm text-(--color-text-tertiary)">불러오는 중...</p>}>
        <FilterAndChart raceId={raceId} />
      </Suspense>
    </section>
  );
}
