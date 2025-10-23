/**
 * Notificaciones Page - /notificaciones
 * Vista de administrador para gestionar solicitudes de ayuda
 * Permite ver, asignar y responder solicitudes ordenadas por prioridad
 */

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, MessageCircle, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { helpApi } from "@/lib/services/help.service";
import { HelpRequest } from "@/lib/types/help.types";
import { toast } from "sonner";

type StatusFilter = "all" | "pending" | "in_progress" | "resolved";

export default function NotificacionesPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [response, setResponse] = useState("");
  const [isRespondDialogOpen, setIsRespondDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();

  // Obtener todas las solicitudes de ayuda
  const { data: allRequests, isLoading } = useQuery({
    queryKey: ["help-requests-admin"],
    queryFn: () => helpApi.getAllRequests(),
  });

  // Filtrar solicitudes según el estado seleccionado
  const filteredRequests = (allRequests || []).filter((request) => {
    if (statusFilter === "all") return true;
    return request.status === statusFilter;
  });

  // Ordenar por prioridad: urgent > normal > low
  const sortedRequests = filteredRequests.sort((a, b) => {
    const priorityOrder = { urgent: 3, normal: 2, low: 1 };
    return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
  });

  // Mutation para responder a una solicitud
  const respondMutation = useMutation({
    mutationFn: ({ id, response }: { id: number; response: string }) =>
      helpApi.respondToRequest(id, { admin_response: response, status: "resolved" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-requests-admin"] });
      toast.success("Respuesta enviada exitosamente");
      setIsRespondDialogOpen(false);
      setResponse("");
      setSelectedRequest(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al enviar respuesta");
    },
  });

  // Mutation para asignar solicitud
  const assignMutation = useMutation({
    mutationFn: (id: number) => helpApi.assignRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-requests-admin"] });
      toast.success("Solicitud asignada exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al asignar solicitud");
    },
  });

  const handleRespond = (request: HelpRequest) => {
    setSelectedRequest(request);
    setIsRespondDialogOpen(true);
  };

  const handleSubmitResponse = () => {
    if (!selectedRequest || !response.trim()) return;
    respondMutation.mutate({ id: selectedRequest.id, response: response.trim() });
  };

  const handleAssign = (request: HelpRequest) => {
    assignMutation.mutate(request.id);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "normal":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "normal":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-orange-100 text-orange-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "in_progress":
        return "En Progreso";
      case "resolved":
        return "Resuelto";
      case "closed":
        return "Cerrado";
      default:
        return status;
    }
  };

  return (
    <div>
      <PageHeader
        title="Centro de Ayuda"
        subtitle={`Total: ${allRequests?.length || 0} solicitudes`}
        icon={<Bell className="h-6 w-6" />}
      />

      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        {[
          { key: "all", label: "Todas", count: allRequests?.length || 0 },
          { key: "pending", label: "Pendientes", count: allRequests?.filter(r => r.status === "pending").length || 0 },
          { key: "in_progress", label: "En Progreso", count: allRequests?.filter(r => r.status === "in_progress").length || 0 },
          { key: "resolved", label: "Resueltas", count: allRequests?.filter(r => r.status === "resolved").length || 0 },
        ].map((filter) => (
          <Button
            key={filter.key}
            variant={statusFilter === filter.key ? "default" : "outline"}
            onClick={() => setStatusFilter(filter.key as StatusFilter)}
          >
            {filter.label} ({filter.count})
          </Button>
        ))}
      </div>

      {/* Lista de solicitudes */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : sortedRequests.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[200px] items-center justify-center">
            <div className="text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No hay solicitudes
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter === "all" 
                  ? "No hay solicitudes de ayuda en este momento."
                  : `No hay solicitudes con estado "${getStatusText(statusFilter)}".`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getPriorityIcon(request.priority)}
                    <div>
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Por: {request.user_name || `Usuario #${request.user_id}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(request.priority)}>
                      {request.priority === "urgent" ? "Urgente" : 
                       request.priority === "normal" ? "Normal" : "Baja"}
                    </Badge>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusText(request.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                  {request.description}
                </p>
                
                {request.admin_response && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Respuesta:</p>
                    <p className="text-sm text-blue-800">{request.admin_response}</p>
                    {request.responded_at && (
                      <p className="text-xs text-blue-600 mt-1">
                        Respondido el: {new Date(request.responded_at).toLocaleDateString("es-MX")}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Creado: {new Date(request.created_at).toLocaleDateString("es-MX")}
                    {request.assigned_admin_name && (
                      <span className="ml-2">
                        • Asignado a: {request.assigned_admin_name}
                      </span>
                    )}
                  </p>
                  
                  <div className="flex gap-2">
                    {request.status === "pending" && !request.assigned_admin_id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssign(request)}
                        disabled={assignMutation.isPending}
                      >
                        Asignar a mí
                      </Button>
                    )}
                    
                    {(request.status === "pending" || request.status === "in_progress") && (
                      <Dialog open={isRespondDialogOpen && selectedRequest?.id === request.id} onOpenChange={setIsRespondDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => handleRespond(request)}
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Responder
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Responder Solicitud de Ayuda</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium">{request.title}</h4>
                              <p className="text-sm text-muted-foreground">{request.description}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Tu respuesta:</label>
                              <Textarea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder="Escribe tu respuesta aquí..."
                                rows={4}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsRespondDialogOpen(false)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={handleSubmitResponse}
                                disabled={!response.trim() || respondMutation.isPending}
                              >
                                {respondMutation.isPending ? "Enviando..." : "Enviar Respuesta"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}