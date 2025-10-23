/**
 * AcceptanceTrend - Line chart for "Tendencia de Aceptación vs Rechazo"
 * Shows acceptance and rejection rates over time
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
  Legend,
  Label,
} from "recharts";

interface AcceptanceTrendProps {
  data: {
    period: string;
    accepted: number;
    rejected: number;
    acceptanceRate: number;
    rejectionRate: number;
  }[];
}

export function AcceptanceTrend({ data }: AcceptanceTrendProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 60, bottom: 50 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(230, 225, 235)" />
        <XAxis
          dataKey="period"
          stroke="rgb(115, 115, 115)"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        >
          <Label value="Período" position="insideBottom" offset={-20} style={{ textAnchor: 'middle', fontSize: 12, fill: 'rgb(75, 85, 99)' }} />
        </XAxis>
        <YAxis
          stroke="rgb(115, 115, 115)"
          fontSize={12}
          allowDecimals={false}
          label={{ 
            value: 'Porcentaje (%)', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle', fontSize: 12, fill: 'rgb(75, 85, 99)' }
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid rgb(230, 225, 235)",
            borderRadius: "8px",
            fontSize: "14px",
          }}
          formatter={(value: number, name: string) => {
            const label = name === "acceptanceRate" ? "Aceptación" : "Rechazo";
            return [`${Math.round(value)}%`, label];
          }}
          labelFormatter={(label) => `Período: ${label}`}
        />
        <Legend 
          verticalAlign="top" 
          height={36}
          iconType="line"
          wrapperStyle={{ fontSize: "14px" }}
        />
        <Line
          type="monotone"
          dataKey="acceptanceRate"
          stroke="rgb(34, 197, 94)"
          strokeWidth={3}
          dot={{ fill: "rgb(34, 197, 94)", r: 4 }}
          activeDot={{ r: 6, fill: "rgb(34, 197, 94)" }}
          name="Aceptación"
        />
        <Line
          type="monotone"
          dataKey="rejectionRate"
          stroke="rgb(239, 68, 68)"
          strokeWidth={3}
          dot={{ fill: "rgb(239, 68, 68)", r: 4 }}
          activeDot={{ r: 6, fill: "rgb(239, 68, 68)" }}
          name="Rechazo"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}