/**
 * ReportsPie - Pie chart for "Estado de Reportes"
 * Shows report counts by status (Aceptado, Pendiente, Rechazado)
 */

"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ReportsPieProps {
  data: {
    status: string;
    count: number;
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  Aceptado: "rgb(34, 197, 94)", // Green
  Pendiente: "rgb(251, 146, 60)", // Orange
  Rechazado: "rgb(239, 68, 68)", // Red
};

export function ReportsPie({ data }: ReportsPieProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
    color: STATUS_COLORS[item.status] || "rgb(239, 68, 68)",
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry: any) =>
            `${entry.name}: ${Math.floor(entry.value)} (${entry.percentage}%)`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid rgb(230, 225, 235)",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          wrapperStyle={{ fontSize: "14px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
