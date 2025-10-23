/**
 * Dashboard Page - /dashboard
 * Implementa: Card grande "Reporte de Fraudes" con dos gráficos
 * Izquierda: Bar chart horizontal "Tipos de Reportes"
 * Derecha: Pie chart "Estado de Reportes"
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ReportsBar } from "@/components/charts/reports-bar";
import { ReportsPie } from "@/components/charts/reports-pie";
import { ReportsMonthly } from "@/components/charts/reports-monthly";
import { ResponseTime } from "@/components/charts/response-time";
import { ReportsByAdmin } from "@/components/charts/reports-by-admin";
import { AcceptanceTrend } from "@/components/charts/acceptance-trend";
import { reportsApi } from "@/lib/services";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: reportsApi.getStats,
    // Mock data fallback for demo
    placeholderData: {
      totalReports: 0,
      reportsByType: [
        { category: "Sitio Web Bancario Falso", count: 45 },
        { category: "Aplicación Bancaria Falsa", count: 28 },
        { category: "Phishing por Email", count: 62 },
        { category: "Phishing por SMS", count: 34 },
        { category: "Estafa Electrónica", count: 19 },
        { category: "Otro", count: 12 },
      ],
      reportsByStatus: [
        { status: "Aceptado", count: 89 },
        { status: "Pendiente", count: 67 },
        { status: "Rechazado", count: 44 },
      ],
      reportsByMonth: [
        { month: "Ene 24", count: 85 },
        { month: "Feb 24", count: 92 },
        { month: "Mar 24", count: 78 },
        { month: "Abr 24", count: 104 },
        { month: "May 24", count: 95 },
        { month: "Jun 24", count: 88 },
        { month: "Jul 24", count: 112 },
        { month: "Ago 24", count: 89 },
        { month: "Sep 24", count: 76 },
        { month: "Oct 24", count: 98 },
        { month: "Nov 24", count: 107 },
        { month: "Dic 24", count: 93 },
      ],
      responseTime: [
        { status: "Aceptado", avgDays: 3, count: 89 },
        { status: "Rechazado", avgDays: 5, count: 44 },
      ],
      reportsByAdmin: [
        { adminName: "Admin 1", count: 45, resolved: 38, pending: 7 },
        { adminName: "Admin 2", count: 38, resolved: 32, pending: 6 },
        { adminName: "Admin 3", count: 29, resolved: 25, pending: 4 },
        { adminName: "Sin asignar", count: 88, resolved: 0, pending: 88 },
      ],
      acceptanceTrend: [
        { period: "Jul 24", accepted: 65, rejected: 25, acceptanceRate: 72, rejectionRate: 28 },
        { period: "Ago 24", accepted: 58, rejected: 31, acceptanceRate: 65, rejectionRate: 35 },
        { period: "Sep 24", accepted: 48, rejected: 28, acceptanceRate: 63, rejectionRate: 37 },
        { period: "Oct 24", accepted: 62, rejected: 36, acceptanceRate: 63, rejectionRate: 37 },
        { period: "Nov 24", accepted: 71, rejected: 36, acceptanceRate: 66, rejectionRate: 34 },
        { period: "Dic 24", accepted: 62, rejected: 31, acceptanceRate: 67, rejectionRate: 33 },
      ],
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Dashboard" />

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Reporte de Fraudes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Bar Chart - Tipos de Reportes */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">
                Tipos de Reportes
              </h3>
              <ReportsBar data={stats?.reportsByType || []} />
            </div>

            {/* Pie Chart - Estado de Reportes */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">
                Estado de Reportes
              </h3>
              <ReportsPie data={stats?.reportsByStatus || []} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Analytics Cards */}
      <div className="grid gap-8 lg:grid-cols-2 mt-8">
        {/* Monthly Reports Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Reportes por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportsMonthly data={stats?.reportsByMonth || []} />
          </CardContent>
        </Card>

        {/* Response Time Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Tiempo de Respuesta Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponseTime data={stats?.responseTime || []} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 mt-8">
        {/* Reports by Admin Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Reportes por Administrador</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportsByAdmin data={stats?.reportsByAdmin || []} />
          </CardContent>
        </Card>

        {/* Acceptance Trend Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Tendencia de Aceptación vs Rechazo</CardTitle>
          </CardHeader>
          <CardContent>
            <AcceptanceTrend data={stats?.acceptanceTrend || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
