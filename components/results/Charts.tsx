'use client';

import { useReducedMotion } from 'framer-motion';
import { Cell, Line, LineChart, CartesianGrid, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/** Recharts wrappers. Loaded lazily (next/dynamic) so the planner bundle stays small. */

export const SERIES = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)', 'var(--series-5)'];

const tooltipStyle = {
  background: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  color: 'var(--color-fg)',
  fontSize: 12,
};

export type DonutSlice = { label: string; value: number; color: string };

export function SplitDonut({ data, format, label }: { data: DonutSlice[]; format: (v: number) => string; label: string }) {
  const reduce = useReducedMotion();
  return (
    <div role="img" aria-label={label} className="h-56 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="62%"
            outerRadius="92%"
            stroke="var(--color-surface)"
            strokeWidth={2}
            isAnimationActive={!reduce}
            animationDuration={900}
          >
            {data.map((d) => (
              <Cell key={d.label} fill={d.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--color-fg)' }} formatter={(v) => format(Number(v))} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

type ScalingPoint = { budget: number; cpa: number };

/** One measure on one axis: cost per result vs budget, with the break-even line and the profitable limit. */
export function ScalingChart({
  data,
  maxCost,
  limit,
  rtl,
  money,
  label,
  costLabel,
  breakEvenLabel,
}: {
  data: ScalingPoint[];
  maxCost: number;
  limit: number | null;
  rtl: boolean;
  money: (v: number) => string;
  label: string;
  costLabel: string;
  breakEvenLabel: string;
}) {
  const reduce = useReducedMotion();
  const axis = { stroke: 'var(--color-border-strong)', tick: { fill: 'var(--color-fg-muted)', fontSize: 12 } };
  return (
    <div role="img" aria-label={label} className="h-64 w-full" dir="ltr">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="budget" type="number" domain={['dataMin', 'dataMax']} tickFormatter={money} reversed={rtl} {...axis} />
          <YAxis orientation={rtl ? 'right' : 'left'} tickFormatter={money} width={72} domain={[0, 'auto']} {...axis} />
          <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => money(Number(v))} formatter={(v) => [money(Number(v)), costLabel]} />
          <ReferenceLine y={maxCost} stroke="var(--color-danger)" strokeDasharray="4 4" label={{ value: breakEvenLabel, fill: 'var(--color-danger)', fontSize: 11, position: 'insideTopRight' }} />
          {limit !== null && limit > 0 && <ReferenceLine x={limit} stroke="var(--color-success)" strokeDasharray="4 4" />}
          <Line type="monotone" dataKey="cpa" stroke="var(--series-1)" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, stroke: 'var(--color-surface)' }} isAnimationActive={!reduce} animationDuration={900} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
