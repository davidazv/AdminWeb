"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Edit, Trash2, Plus } from "lucide-react";
import { reportsApi } from "@/lib/services";
import { ReportComment, CreateCommentRequest } from "@/lib/dto";
import { toast } from "sonner";

interface ReportCommentsProps {
  reportId: number;
}

export function ReportComments({ reportId }: ReportCommentsProps) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editComment, setEditComment] = useState("");
  const [showAddComment, setShowAddComment] = useState(false);
  const [isInternal, setIsInternal] = useState(true);

  const { data: comments, isLoading } = useQuery({
    queryKey: ["report-comments", reportId],
    queryFn: () => reportsApi.getComments(reportId),
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: CreateCommentRequest) => reportsApi.addComment(reportId, data),
    onSuccess: () => {
      toast.success("Comentario agregado");
      setNewComment("");
      setShowAddComment(false);
      queryClient.invalidateQueries({ queryKey: ["report-comments", reportId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error al agregar comentario");
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: (data: { commentId: number; comment: CreateCommentRequest }) => 
      reportsApi.updateComment(data.commentId, data.comment),
    onSuccess: () => {
      toast.success("Comentario actualizado");
      setEditingCommentId(null);
      setEditComment("");
      queryClient.invalidateQueries({ queryKey: ["report-comments", reportId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error al actualizar comentario");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => reportsApi.deleteComment(commentId),
    onSuccess: () => {
      toast.success("Comentario eliminado");
      queryClient.invalidateQueries({ queryKey: ["report-comments", reportId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error al eliminar comentario");
    },
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate({
        comment: newComment.trim(),
        is_internal: isInternal,
      });
    }
  };

  const handleEditComment = (comment: ReportComment) => {
    setEditingCommentId(comment.id);
    setEditComment(comment.comment);
  };

  const handleSaveEdit = () => {
    if (editingCommentId && editComment.trim()) {
      const originalComment = comments?.find(c => c.id === editingCommentId);
      updateCommentMutation.mutate({
        commentId: editingCommentId,
        comment: {
          comment: editComment.trim(),
          is_internal: originalComment?.is_internal || true,
        },
      });
    }
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este comentario?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comentarios de Administrador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comentarios de Administrador
          </CardTitle>
          <Button
            onClick={() => setShowAddComment(!showAddComment)}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Comentario
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment Form */}
        {showAddComment && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="space-y-3">
              <Label htmlFor="new-comment">Nuevo Comentario</Label>
              <Textarea
                id="new-comment"
                placeholder="Escribe tu comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-internal"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                />
                <Label htmlFor="is-internal" className="text-sm">
                  Comentario interno (solo visible para admins)
                </Label>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                  size="sm"
                >
                  Agregar
                </Button>
                <Button
                  onClick={() => {
                    setShowAddComment(false);
                    setNewComment("");
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Comments List */}
        {comments && comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {comment.admin_name || `Admin ${comment.admin_id}`}
                    </span>
                    <Badge variant={comment.is_internal ? "secondary" : "default"} className="text-xs">
                      {comment.is_internal ? "Interno" : "Público"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleString("es-MX")}
                    </span>
                    <Button
                      onClick={() => handleEditComment(comment)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteComment(comment.id)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {editingCommentId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveEdit}
                        disabled={!editComment.trim() || updateCommentMutation.isPending}
                        size="sm"
                      >
                        Guardar
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditComment("");
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay comentarios para este reporte</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}