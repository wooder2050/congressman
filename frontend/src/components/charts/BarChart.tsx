"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface BarChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  bars: { dataKey: string; color: string; label: string }[];
  height?: number;
}

export default function BarChart({ data, xKey, bars, height = 250 }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bg-tertiary)" />
        <XAxis dataKey={xKey} tick={{ fontSize: 14, fill: "var(--color-text-secondary)" }} />
        <YAxis tick={{ fontSize: 14, fill: "var(--color-text-tertiary)" }} />
        <Tooltip
          contentStyle={{
            fontSize: 14,
            borderRadius: 8,
            border: "1px solid var(--color-bg-tertiary)",
          }}
        />
        {bars.map((bar) => (
          <Bar key={bar.dataKey} dataKey={bar.dataKey} name={bar.label} radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={bar.color} />
            ))}
          </Bar>
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
