/**
 * Buscar Page - /buscar
 * Búsqueda por ID o Categoría
 * Tabla con columnas: ID, Título, Fecha, Categoría, Estado, Acciones (Ver)
 */

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, Column } from "@/components/table/data-table";
import { reportsApi } from "@/lib/services";
import { Report, STATUS_MAP, CATEGORY_MAP } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function BuscarPage() {
  const router = useRouter();
  const [searchId, setSearchId] = useState("");
  const [categoryId, setCategoryId] = useState<number | "all">("all");
  const [statusId, setStatusId] = useState<number | "all">("all");
  const [appliedFilters, setAppliedFilters] = useState({ id: "", category: "all" as number | "all", status: "all" as number | "all" });

  // Obtener todos los reportes
  const { data: allReports, isLoading } = useQuery({
    queryKey: ["reports-buscar"],
    queryFn: () => reportsApi.getAllReports(),
  });

  const handleSearch = () => {
    setAppliedFilters({ id: searchId, category: categoryId, status: statusId });
  };

  const handleClearSearch = () => {
    setSearchId("");
    setCategoryId("all");
    setStatusId("all");
    setAppliedFilters({ id: "", category: "all", status: "all" });
  };

  // Filtrar reportes según los criterios
  const filteredReports = (allReports || []).filter((report) => {
    if (appliedFilters.id && report.id.toString() !== appliedFilters.id) {
      return false;
    }
    if (appliedFilters.category !== "all" && report.category_id !== appliedFilters.category) {
      return false;
    }
    if (appliedFilters.status !== "all" && report.status_id !== appliedFilters.status) {
      return false;
    }
    return true;
  });

  const columns: Column<Report>[] = [
    {
      key: "id",
      label: "ID",
      className: "w-20",
    },
    {
      key: "title",
      label: "Título",
      className: "max-w-xs truncate",
    },
    {
      key: "description",
      label: "Descripción",
      className: "max-w-md",
      render: (report) => (
        <span className="line-clamp-2">
          {report.description || "Sin descripción"}
        </span>
      ),
    },
    {
      key: "category_id",
      label: "Categoría",
      render: (report) => (
        <span className="truncate">
          {CATEGORY_MAP[report.category_id as keyof typeof CATEGORY_MAP] || `Cat. ${report.category_id}`}
        </span>
      ),
      className: "max-w-xs",
    },
    {
      key: "status_id",
      label: "Estado",
      render: (report) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            report.status_id === 2
              ? "bg-green-100 text-green-800"
              : report.status_id === 1
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {STATUS_MAP[report.status_id as keyof typeof STATUS_MAP] || `Estado ${report.status_id}`}
        </span>
      ),
      className: "w-32",
    },
    {
      key: "created_at",
      label: "Fecha",
      render: (report) => new Date(report.created_at).toLocaleDateString("es-MX"),
      className: "w-32",
    },
    {
      key: "actions",
      label: "",
      render: (report) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/actualizar/${report.id}`);
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </Button>
      ),
      className: "w-32",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Buscar reportes"
        subtitle={`Total: ${allReports?.length || 0} reportes`}
      />

      {/* Búsqueda por ID, Categoría y Estado */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Buscar por ID" htmlFor="filter-id">
            <Input
              id="filter-id"
              placeholder="Ingresa el ID del reporte"
              type="number"
              min="1"
              value={searchId}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || parseInt(value) > 0) {
                  setSearchId(value);
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </FormField>

          <FormField label="Buscar por Categoría" htmlFor="filter-category">
            <Select
              value={categoryId === "all" ? "all" : categoryId.toString()}
              onValueChange={(value) => {
                const newCategoryId = value === "all" ? "all" : Number(value);
                setCategoryId(newCategoryId);
                setAppliedFilters(prev => ({ ...prev, category: newCategoryId }));
              }}
            >
              <SelectTrigger id="filter-category" className="bg-white border-border">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-border shadow-lg">
                <SelectItem value="all">Todas las categorías</SelectItem>
                {Object.entries(CATEGORY_MAP).map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Buscar por Estado" htmlFor="filter-status">
            <Select
              value={statusId === "all" ? "all" : statusId.toString()}
              onValueChange={(value) => {
                const newStatusId = value === "all" ? "all" : Number(value);
                setStatusId(newStatusId);
                setAppliedFilters(prev => ({ ...prev, status: newStatusId }));
              }}
            >
              <SelectTrigger id="filter-status" className="bg-white border-border">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-border shadow-lg">
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(STATUS_MAP).map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="mt-4 flex gap-4">
          <Button
            onClick={handleSearch}
            size="lg"
            variant="outline"
            className="border-border hover:bg-accent shadow-md"
          >
            Buscar
          </Button>
          {(appliedFilters.id || appliedFilters.category !== "all" || appliedFilters.status !== "all") && (
            <Button onClick={handleClearSearch} variant="outline" size="lg" className="border-border hover:bg-accent shadow-md">
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            Mostrando {filteredReports.length} de {allReports?.length || 0} reportes
          </p>
          <DataTable
            columns={columns}
            data={filteredReports}
            keyExtractor={(report) => report.id.toString()}
            onRowClick={(report) => router.push(`/actualizar/${report.id}`)}
            emptyMessage={
              appliedFilters.id || appliedFilters.category !== "all" || appliedFilters.status !== "all"
                ? "No se encontraron reportes con los filtros aplicados"
                : "No hay reportes disponibles"
            }
          />
        </div>
      )}
    </div>
  );
}
