/**
 * ReportsWeekly - Line chart for "Reportes por Semana"
 * Shows report counts by week for the last 8 weeks
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
  Area,
  AreaChart,
  Label,
} from "recharts";

interface ReportsWeeklyProps {
  data: {
    week: string;
    count: number;
  }[];
}

export function ReportsWeekly({ data }: ReportsWeeklyProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
      >
        <defs>
          <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgb(239, 68, 68)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="rgb(239, 68, 68)" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(230, 225, 235)" />
        <XAxis
          dataKey="week"
          stroke="rgb(115, 115, 115)"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        >
          <Label value="Semanas" position="insideBottom" offset={-20} style={{ textAnchor: 'middle', fontSize: 12, fill: 'rgb(75, 85, 99)' }} />
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
          labelFormatter={(label) => `Semana: ${label}`}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="rgb(239, 68, 68)"
          fillOpacity={1}
          fill="url(#colorReports)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}