/**
 * Actualizar Page - /actualizar/[id]
 * Implementa: Form en dos columnas
 * Izquierda: ID, Título, Descripción, Ubicación, Fecha del incidente, Adjuntar evidencia
 * Derecha: Estado, Categoría
 * Botones: Guardar cambios (negro), Cancelar (gris), Eliminar reporte (rojo)
 * Historial de cambios (timeline) abajo
 */

"use client";

import { useState, use, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { FormField } from "@/components/forms/form-field";
import { FileUpload } from "@/components/forms/file-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { reportsApi } from "@/lib/services";
import { CATEGORY_MAP, STATUS_MAP } from "@/lib/types";
import { ReportComments } from "@/components/Reports/ReportComments";
import { toast } from "sonner";

const updateSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  location: z.string().optional(),
  incident_date: z.string().optional(),
  status_id: z.number().min(1).max(3),
  category_id: z.number().min(1).max(10),
  assigned_admin_id: z.number().optional(),
});

type UpdateFormData = z.infer<typeof updateSchema>;

export default function ActualizarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const reportId = parseInt(resolvedParams.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: report, isLoading } = useQuery({
    queryKey: ["report", reportId],
    queryFn: () => reportsApi.getById(reportId),
    enabled: !isNaN(reportId),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    values: report
      ? {
          title: report.title,
          description: report.description,
          location: report.location || "",
          incident_date: report.incident_date || "",
          status_id: report.status_id,
          category_id: report.category_id,
          assigned_admin_id: report.assigned_admin_id || undefined,
        }
      : undefined,
  });

  // Asegurar que los valores de status y category se establezcan correctamente
  useEffect(() => {
    if (report) {
      setValue("status_id", report.status_id);
      setValue("category_id", report.category_id);
      setValue("assigned_admin_id", report.assigned_admin_id || undefined);
    }
  }, [report, setValue]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateFormData) => reportsApi.updateAsAdmin(reportId, data),
    onSuccess: () => {
      // Invalidar este reporte específico
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      // Invalidar lista de reportes en buscar/leer
      queryClient.invalidateQueries({ queryKey: ["reports-buscar"] });
      queryClient.invalidateQueries({ queryKey: ["all-reports-leer"] });
      // Invalidar reportes pendientes en aceptar
      queryClient.invalidateQueries({ queryKey: ["pending-reports"] });
      // Invalidar estadísticas del dashboard
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

      toast.success("Reporte actualizado correctamente");
    },
    onError: (error: any) => {
      console.error("Error al actualizar:", error);
      toast.error(error?.response?.data?.message || "Error al actualizar el reporte");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => reportsApi.delete(reportId),
    onSuccess: () => {
      // Invalidar todas las queries de reportes
      queryClient.invalidateQueries({ queryKey: ["reports-buscar"] });
      queryClient.invalidateQueries({ queryKey: ["all-reports-leer"] });
      queryClient.invalidateQueries({ queryKey: ["pending-reports"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

      toast.success("Reporte eliminado");
      router.push("/buscar");
    },
    onError: (error: any) => {
      console.error("Error al eliminar:", error);
      toast.error(error?.response?.data?.message || "Error al eliminar el reporte");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => reportsApi.uploadAttachment(reportId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      queryClient.invalidateQueries({ queryKey: ["reports-buscar"] });
      queryClient.invalidateQueries({ queryKey: ["all-reports-leer"] });

      toast.success("Evidencia adjuntada correctamente");
      setFile(null);
    },
    onError: (error: any) => {
      console.error("Error al subir archivo:", error);
      toast.error(error?.response?.data?.message || "Error al subir el archivo");
    },
  });

  const onSubmit = async (data: UpdateFormData) => {
    // Validar que category_id sea válido antes de enviar
    if (!data.category_id || data.category_id < 1 || data.category_id > 10) {
      toast.error("Categoría inválida. Por favor selecciona una categoría válida.");
      return;
    }

    // Validar que status_id sea válido
    if (!data.status_id || data.status_id < 1 || data.status_id > 3) {
      toast.error("Estado inválido. Por favor selecciona un estado válido.");
      return;
    }

    // Limpiar campos opcionales vacíos
    const cleanData: any = {
      title: data.title,
      description: data.description,
      status_id: data.status_id,
      category_id: data.category_id,
    };

    // Solo agregar campos opcionales si tienen valor
    if (data.location) {
      cleanData.location = data.location;
    }
    if (data.incident_date) {
      cleanData.incident_date = data.incident_date;
    }
    // No agregamos assigned_admin_id aquí, lo manejamos por separado

    console.log("📤 Enviando datos al backend:", cleanData);

    try {
      // Separar la asignación de admin de otros campos para evitar problemas de validación
      const adminId = data.assigned_admin_id;
      const updateData = { ...cleanData };
      delete updateData.assigned_admin_id;

      // Primero actualizar campos básicos
      await updateMutation.mutateAsync(updateData);
      
      // Luego asignar admin si hay uno seleccionado
      if (adminId && adminId !== 0) {
        await reportsApi.assignToAdmin(reportId, adminId);
      }
      
      if (file) {
        await uploadMutation.mutateAsync(file);
      }
    } catch (error) {
      console.error("❌ Error completo:", error);
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate();
    setShowDeleteDialog(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Reporte no encontrado</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Actualizar reportes" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Two Column Layout */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
            <FormField label="ID" htmlFor="id">
              <Input id="id" value={report.id} disabled />
            </FormField>

            <FormField
              label="Título"
              htmlFor="title"
              error={errors.title?.message}
              required
            >
              <Input
                id="title"
                placeholder="Título del reporte"
                {...register("title")}
              />
            </FormField>

            <FormField
              label="Descripción"
              htmlFor="description"
              error={errors.description?.message}
              required
            >
              <Textarea
                id="description"
                rows={6}
                placeholder="Descripción detallada del reporte..."
                {...register("description")}
              />
            </FormField>

            <FormField label="Ubicación" htmlFor="location">
              <Input
                id="location"
                placeholder="Ubicación del incidente (opcional)"
                {...register("location")}
              />
            </FormField>

            <FormField label="Fecha del incidente" htmlFor="incident_date">
              <Input
                id="incident_date"
                type="date"
                {...register("incident_date")}
              />
            </FormField>

            <FormField label="Adjuntar evidencia" htmlFor="file">
              <FileUpload
                value={file}
                onChange={setFile}
                accept="image/*,.pdf,.doc,.docx"
              />
              {report.evidence_url && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Evidencia actual:
                  </p>
                  <img 
                    src={report.evidence_url} 
                    alt="Evidencia actual del reporte"
                    className="max-w-full h-auto max-h-32 rounded-md border border-border object-contain cursor-pointer"
                    onClick={() => window.open(report.evidence_url, '_blank')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Haz clic en la imagen para verla en tamaño completo
                  </p>
                </div>
              )}
            </FormField>
          </div>

          {/* Right Column */}
          <div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
            <FormField
              label="Estado"
              htmlFor="status"
              error={errors.status_id?.message}
              required
            >
              <Select
                key={`status-${watch("status_id")}`}
                value={watch("status_id")?.toString() || ""}
                onValueChange={(value) =>
                  setValue("status_id", Number(value), { shouldValidate: true })
                }
              >
                <SelectTrigger id="status" className="bg-white border-border">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-border shadow-lg">
                  {Object.entries(STATUS_MAP).map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Categoría"
              htmlFor="category"
              error={errors.category_id?.message}
              required
            >
              <Select
                key={`category-${watch("category_id")}`}
                value={watch("category_id")?.toString() || ""}
                onValueChange={(value) =>
                  setValue("category_id", Number(value), { shouldValidate: true })
                }
              >
                <SelectTrigger id="category" className="bg-white border-border">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-border shadow-lg">
                  {Object.entries(CATEGORY_MAP).map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Administrador Asignado"
              htmlFor="admin"
              error={errors.assigned_admin_id?.message}
            >
              <Select
                key={`admin-${watch("assigned_admin_id")}`}
                value={watch("assigned_admin_id")?.toString() || "0"}
                onValueChange={(value) =>
                  setValue("assigned_admin_id", value === "0" ? undefined : Number(value), { shouldValidate: true })
                }
              >
                <SelectTrigger id="admin" className="bg-white border-border">
                  <SelectValue placeholder="Selecciona un administrador" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-border shadow-lg">
                  <SelectItem value="0">Sin asignar</SelectItem>
                  <SelectItem value="1">Admin 1</SelectItem>
                  <SelectItem value="2">Admin 2</SelectItem>
                  <SelectItem value="3">Admin 3</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <div className="space-y-4 rounded-lg border border-border bg-muted/50 p-4">
              <h4 className="font-medium">Información del reporte</h4>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Usuario
                </label>
                <p className="mt-1 text-sm text-foreground">
                  {report.is_anonymous ? "Anónimo" : (report.user_name || `Usuario ID: ${report.user_id}`)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Fecha de creación
                </label>
                <p className="mt-1 text-sm text-foreground">
                  {new Date(report.created_at).toLocaleString("es-MX")}
                </p>
              </div>

              {report.updated_at !== report.created_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Última actualización
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {new Date(report.updated_at).toLocaleString("es-MX")}
                  </p>
                </div>
              )}

              {report.assigned_admin_id && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Asignado a admin
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    ID: {report.assigned_admin_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button
            type="submit"
            size="lg"
            disabled={updateMutation.isPending || uploadMutation.isPending}
            className="bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
          >
            {updateMutation.isPending || uploadMutation.isPending
              ? "Guardando..."
              : "Guardar cambios"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="border-border hover:bg-accent shadow-sm"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteMutation.isPending}
            className="border-red-300 text-red-600 hover:bg-red-50 shadow-sm"
          >
            Eliminar reporte
          </Button>
        </div>
      </form>

      {/* Report Comments Section */}
      <div className="mt-8">
        <ReportComments reportId={reportId} />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar reporte</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este reporte? Esta acción no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
