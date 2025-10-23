/**
 * ResponseTime - Bar chart for "Tiempo de Respuesta Promedio"
 * Shows average response time by status
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
  Label,
} from "recharts";

interface ResponseTimeProps {
  data: {
    status: string;
    avgDays: number;
    count: number;
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  "Aceptado": "rgb(34, 197, 94)", // Green
  "Rechazado": "rgb(239, 68, 68)", // Red
  "Pendiente": "rgb(251, 146, 60)", // Orange
};

export function ResponseTime({ data }: ResponseTimeProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 60, bottom: 25 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(230, 225, 235)" />
        <XAxis
          dataKey="status"
          stroke="rgb(115, 115, 115)"
          fontSize={12}
        >
          <Label value="Estado del Reporte" position="insideBottom" offset={-5} style={{ textAnchor: 'middle', fontSize: 12, fill: 'rgb(75, 85, 99)' }} />
        </XAxis>
        <YAxis
          stroke="rgb(115, 115, 115)"
          fontSize={12}
          allowDecimals={false}
          label={{ 
            value: 'Días promedio', 
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
          formatter={(value: number, name: string, props: any) => [
            `${Math.round(value)} días`,
            "Tiempo promedio"
          ]}
          labelFormatter={(label) => `Estado: ${label}`}
        />
        <Bar dataKey="avgDays" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={STATUS_COLORS[entry.status] || "rgb(156, 163, 175)"} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}