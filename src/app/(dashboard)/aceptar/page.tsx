/**
 * Aceptar Page - /aceptar
 * Implementa: Wizard de revisión de reportes pendientes
 * Muestra: ID, Título, Descripción, Categoría, Evidencia
 * Botones: Aceptar reporte, Rechazar reporte, Siguiente reporte
 */

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { reportsApi } from "@/lib/services";
import { CATEGORY_MAP } from "@/lib/types";
import { toast } from "sonner";

export default function AceptarPage() {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: pendingReports, isLoading } = useQuery({
    queryKey: ["pending-reports"],
    queryFn: async () => {
      // Obtener todos los reportes pendientes directamente
      const allReports = await reportsApi.getAllReports({ status_id: 1 });
      return allReports;
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: number) => reportsApi.accept(id),
    onSuccess: () => {
      toast.success("Reporte aceptado");
      // Invalidar todas las queries de reportes
      queryClient.invalidateQueries({ queryKey: ["pending-reports"] });
      queryClient.invalidateQueries({ queryKey: ["reports-buscar"] });
      queryClient.invalidateQueries({ queryKey: ["all-reports-leer"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      handleNext();
    },
    onError: (error: any) => {
      console.error("Error al aceptar:", error);
      toast.error(error?.response?.data?.message || "Error al aceptar el reporte");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => reportsApi.reject(id),
    onSuccess: () => {
      toast.success("Reporte rechazado");
      // Invalidar todas las queries de reportes
      queryClient.invalidateQueries({ queryKey: ["pending-reports"] });
      queryClient.invalidateQueries({ queryKey: ["reports-buscar"] });
      queryClient.invalidateQueries({ queryKey: ["all-reports-leer"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      handleNext();
    },
    onError: (error: any) => {
      console.error("Error al rechazar:", error);
      toast.error(error?.response?.data?.message || "Error al rechazar el reporte");
    },
  });

  const handleNext = () => {
    if (pendingReports && currentIndex < pendingReports.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reload to get fresh reports
      queryClient.invalidateQueries({ queryKey: ["pending-reports"] });
      setCurrentIndex(0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const currentReport = pendingReports?.[currentIndex];

  if (!currentReport) {
    return (
      <div>
        <PageHeader title="Aceptar Nuevos Reportes" />
        <Card className="shadow-md">
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground">
              No hay reportes pendientes de revisión
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Aceptar Nuevos Reportes"
        subtitle={`Reporte ${currentIndex + 1} de ${pendingReports?.length || 0}`}
      />

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Reporte #{currentReport.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Details */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  ID
                </label>
                <p className="mt-1 text-base text-foreground">
                  {currentReport.id}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Título
                </label>
                <p className="mt-1 text-base text-foreground">
                  {currentReport.title}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Categoría
                </label>
                <p className="mt-1 text-base text-foreground">
                  {CATEGORY_MAP[currentReport.category_id as keyof typeof CATEGORY_MAP] || `Categoría ${currentReport.category_id}`}
                </p>
              </div>

              {currentReport.location && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ubicación
                  </label>
                  <p className="mt-1 text-base text-foreground">
                    {currentReport.location}
                  </p>
                </div>
              )}

              {currentReport.incident_date && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Fecha del incidente
                  </label>
                  <p className="mt-1 text-base text-foreground">
                    {new Date(currentReport.incident_date).toLocaleDateString("es-MX")}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Descripción
                </label>
                <p className="mt-1 text-base text-foreground whitespace-pre-wrap">
                  {currentReport.description || "Sin descripción"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Evidencia
                </label>
                {currentReport.evidence_url ? (
                  <div className="mt-2 space-y-2">
                    <img 
                      src={currentReport.evidence_url} 
                      alt="Evidencia del reporte"
                      className="max-w-full h-auto max-h-48 rounded-md border border-border object-contain cursor-pointer"
                      onClick={() => window.open(currentReport.evidence_url, '_blank')}
                    />
                    <p className="text-xs text-muted-foreground">
                      Haz clic en la imagen para verla en tamaño completo
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 text-base text-muted-foreground">
                    Sin evidencia adjunta
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Fecha de creación
                </label>
                <p className="mt-1 text-base text-foreground">
                  {new Date(currentReport.created_at).toLocaleString("es-MX")}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Anónimo
                </label>
                <p className="mt-1 text-base text-foreground">
                  {currentReport.is_anonymous ? "Sí" : "No"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 border-t border-border pt-6">
            <Button
              size="lg"
              onClick={() => acceptMutation.mutate(currentReport.id)}
              disabled={
                acceptMutation.isPending || rejectMutation.isPending
              }
              className="min-w-[180px] bg-green-600 hover:bg-green-700 text-white shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Aceptar reporte
            </Button>

            <Button
              variant="destructive"
              size="lg"
              onClick={() => rejectMutation.mutate(currentReport.id)}
              disabled={
                acceptMutation.isPending || rejectMutation.isPending
              }
              className="min-w-[180px] bg-red-600 hover:bg-red-700 text-white shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
            >
              <XCircle className="mr-2 h-5 w-5" />
              Rechazar reporte
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleNext}
              disabled={
                acceptMutation.isPending || rejectMutation.isPending
              }
              className="min-w-[180px] shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
            >
              Siguiente reporte
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
