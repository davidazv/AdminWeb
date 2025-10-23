/**
 * ReportsBar - Horizontal bar chart for "Tipos de Reportes"
 * Shows report counts by category
 */

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  Label,
} from "recharts";

interface ReportsBarProps {
  data: {
    category: string;
    count: number;
  }[];
}

const COLORS = [
  "rgb(239, 68, 68)", // Red (primary)
  "rgb(251, 146, 60)", // Orange
  "rgb(34, 197, 94)", // Green
  "rgb(59, 130, 246)", // Blue
  "rgb(236, 72, 153)", // Pink
  "rgb(156, 163, 175)", // Gray
];

export function ReportsBar({ data }: ReportsBarProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 140, bottom: 25 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(230, 225, 235)" />
        <XAxis
          type="number"
          stroke="rgb(115, 115, 115)"
          fontSize={12}
          allowDecimals={false}
        >
          <Label value="Cantidad de Reportes" position="insideBottom" offset={-5} style={{ textAnchor: 'middle', fontSize: 12, fill: 'rgb(75, 85, 99)' }} />
        </XAxis>
        <YAxis
          type="category"
          dataKey="category"
          stroke="rgb(115, 115, 115)"
          fontSize={12}
          width={110}
        >
          <Label value="Categorías" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fontSize: 12, fill: 'rgb(75, 85, 99)' }} />
        </YAxis>
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid rgb(230, 225, 235)",
            borderRadius: "8px",
            fontSize: "14px",
          }}
          formatter={(value: number) => Math.floor(value)}
        />
        <Bar dataKey="count" radius={[0, 8, 8, 0]}>
          <LabelList 
            dataKey="count" 
            position="right" 
            style={{ fill: "rgb(75, 85, 99)", fontSize: "12px", fontWeight: "500" }}
          />
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
