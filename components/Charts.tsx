"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export type ChartPoint = { date: string; value: number | null };

type CommonProps = {
  data: ChartPoint[];
  color: string;
  height?: number;
  unit?: string;
  /** Nilai referensi (mis. target) digambar sebagai garis putus-putus */
  reference?: number | null;
};

function formatX(dateStr: string) {
  const [, m, d] = dateStr.split("-");
  return `${Number(d)}/${Number(m)}`;
}

function ChartTooltip({ active, payload, label, unit }: { active?: boolean; payload?: Array<{ value: number | null }>; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  return (
    <div className="rounded-xl px-3 py-2 text-[13px] bg-surface border border-separator" style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
      <p className="text-secondary">{label}</p>
      <p className="font-semibold num">
        {v == null ? "—" : `${v.toLocaleString("id-ID")}${unit ? ` ${unit}` : ""}`}
      </p>
    </div>
  );
}

export function TrendLineChart({ data, color, height = 180, unit, reference = null }: CommonProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="var(--separator)" vertical={false} strokeDasharray="2 6" />
        <XAxis
          dataKey="date"
          tickFormatter={formatX}
          stroke="var(--label-tertiary)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis stroke="var(--label-tertiary)" fontSize={11} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: "var(--separator)" }} />
        {reference != null ? (
          <ReferenceLine
            y={reference}
            stroke="var(--label-tertiary)"
            strokeDasharray="4 6"
            strokeWidth={1.2}
          />
        ) : null}
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TrendBarChart({ data, color, height = 180, unit, reference = null }: CommonProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barCategoryGap="25%">
        <CartesianGrid stroke="var(--separator)" vertical={false} strokeDasharray="2 6" />
        <XAxis
          dataKey="date"
          tickFormatter={formatX}
          stroke="var(--label-tertiary)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis stroke="var(--label-tertiary)" fontSize={11} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ fill: "var(--fill)" }} />
        <Bar dataKey="value" fill={color} radius={[6, 6, 6, 6]} />
        {reference != null ? (
          <ReferenceLine
            y={reference}
            stroke="var(--label-tertiary)"
            strokeDasharray="4 6"
            strokeWidth={1.2}
          />
        ) : null}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
