/**
 * ReportsMonthly - Line chart for "Reportes por Mes"
 * Shows report counts by month for the last 12 months
 */

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

interface ReportsMonthlyProps {
  data: {
    month: string;
    count: number;
  }[];
}

export function ReportsMonthly({ data }: ReportsMonthlyProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(230, 225, 235)" />
        <XAxis
          dataKey="month"
          stroke="rgb(115, 115, 115)"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        >
          <Label value="Meses" position="insideBottom" offset={-20} style={{ textAnchor: 'middle', fontSize: 12, fill: 'rgb(75, 85, 99)' }} />
        </XAxis>
        <YAxis
          stroke="rgb(115, 115, 115)"
          fontSize={12}
          allowDecimals={false}
        >
          <Label value="Cantidad de Reportes" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fontSize: 12, fill: 'rgb(75, 85, 99)' }} />
        </YAxis>
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid rgb(230, 225, 235)",
            borderRadius: "8px",
            fontSize: "14px",
          }}
          formatter={(value: number) => [Math.floor(value), "Reportes"]}
          labelFormatter={(label) => `Mes: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="rgb(239, 68, 68)"
          strokeWidth={3}
          dot={{ fill: "rgb(239, 68, 68)", r: 4 }}
          activeDot={{ r: 6, fill: "rgb(239, 68, 68)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}