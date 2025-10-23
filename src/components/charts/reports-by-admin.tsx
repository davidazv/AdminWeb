/**
 * ReportsByAdmin - Horizontal bar chart for "Reportes por Administrador"
 * Shows report counts assigned to each admin
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

interface ReportsByAdminProps {
  data: {
    adminName: string;
    count: number;
    resolved: number;
    pending: number;
  }[];
}

const ADMIN_COLORS = [
  "rgb(239, 68, 68)", // Red
  "rgb(59, 130, 246)", // Blue
  "rgb(34, 197, 94)", // Green
  "rgb(251, 146, 60)", // Orange
  "rgb(236, 72, 153)", // Pink
  "rgb(156, 163, 175)", // Gray
];

export function ReportsByAdmin({ data }: ReportsByAdminProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 120, bottom: 25 }}
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
          dataKey="adminName"
          stroke="rgb(115, 115, 115)"
          fontSize={12}
          width={110}
        >
          <Label value="Administrador" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fontSize: 12, fill: 'rgb(75, 85, 99)' }} />
        </YAxis>
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid rgb(230, 225, 235)",
            borderRadius: "8px",
            fontSize: "14px",
          }}
          formatter={(value: number, name: string, props: any) => {
            const { resolved, pending } = props.payload;
            return [
              <div key="tooltip" className="space-y-1">
                <div>Total: {Math.floor(value)} reportes</div>
                <div className="text-green-600">Resueltos: {resolved}</div>
                <div className="text-orange-600">Pendientes: {pending}</div>
              </div>,
              ""
            ];
          }}
          labelFormatter={(label) => `Admin: ${label}`}
        />
        <Bar dataKey="count" radius={[0, 8, 8, 0]}>
          <LabelList 
            dataKey="count" 
            position="right" 
            style={{ fill: "rgb(75, 85, 99)", fontSize: "12px", fontWeight: "500" }}
          />
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={ADMIN_COLORS[index % ADMIN_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}