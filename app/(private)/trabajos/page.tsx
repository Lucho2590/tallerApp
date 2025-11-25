"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Calendar,
  User,
  Car,
} from "lucide-react";
import { useTrabajos } from "@/hooks/trabajos/useTrabajos";
import { useClientes } from "@/hooks/clientes/useClientes";
import { useVehiculos } from "@/hooks/vehiculos/useVehiculos";
import { Trabajo, EstadoTrabajo, PrioridadTrabajo } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Componente para mostrar el estado
function EstadoBadge({ estado }: { estado: EstadoTrabajo }) {
  const getEstadoConfig = (estado: EstadoTrabajo) => {
    switch (estado) {
      case EstadoTrabajo.PENDIENTE:
        return {
          icon: Clock,
          text: "Pendiente",
          className: "bg-gray-100 text-gray-800 border-gray-300",
        };
      case EstadoTrabajo.EN_PROGRESO:
        return {
          icon: Play,
          text: "En Progreso",
          className: "bg-blue-100 text-blue-800 border-blue-300",
        };
      case EstadoTrabajo.COMPLETADO:
        return {
          icon: CheckCircle,
          text: "Completado",
          className: "bg-green-100 text-green-800 border-green-300",
        };
      case EstadoTrabajo.CANCELADO:
        return {
          icon: XCircle,
          text: "Cancelado",
          className: "bg-red-100 text-red-800 border-red-300",
        };
      default:
        return {
          icon: Clock,
          text: "Desconocido",
          className: "bg-gray-100 text-gray-800 border-gray-300",
        };
    }
  };

  const { icon: Icon, text, className } = getEstadoConfig(estado);

  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${className}`}>
      <Icon className="h-3 w-3" />
      {text}
    </Badge>
  );
}

// Componente para mostrar prioridad
function PrioridadBadge({ prioridad }: { prioridad: PrioridadTrabajo }) {
  const getPrioridadConfig = (prioridad: PrioridadTrabajo) => {
    switch (prioridad) {
      case PrioridadTrabajo.BAJA:
        return {
          text: "Baja",
          className: "bg-gray-100 text-gray-800",
        };
      case PrioridadTrabajo.MEDIA:
        return {
          text: "Media",
          className: "bg-blue-100 text-blue-800",
        };
      case PrioridadTrabajo.ALTA:
        return {
          text: "Alta",
          className: "bg-orange-100 text-orange-800",
        };
      case PrioridadTrabajo.URGENTE:
        return {
          text: "Urgente",
          className: "bg-red-100 text-red-800",
        };
    }
  };

  const { text, className } = getPrioridadConfig(prioridad);

  return (
    <Badge variant="outline" className={className}>
      {text}
    </Badge>
  );
}

export default function TrabajosPage() {
  const router = useRouter();
  const { trabajos, loading, error, deleteTrabajo, cambiarEstado } =
    useTrabajos();
  const { clientes } = useClientes();
  const { vehiculos } = useVehiculos();

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("__all__");

  // Filtrar trabajos
  const trabajosFiltrados = useMemo(() => {
    return trabajos.filter((trabajo) => {
      const cliente = clientes.find((c) => c.id === trabajo.clienteId);
      const vehiculo = vehiculos.find((v) => v.id === trabajo.vehiculoId);

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        trabajo.numero.toLowerCase().includes(searchLower) ||
        (trabajo.descripcionGeneral &&
          trabajo.descripcionGeneral.toLowerCase().includes(searchLower)) ||
        (cliente &&
          `${cliente.nombre} ${cliente.apellido}`
            .toLowerCase()
            .includes(searchLower)) ||
        (vehiculo && vehiculo.patente.toLowerCase().includes(searchLower));

      const matchesEstado =
        estadoFiltro === "__all__" || trabajo.estado === estadoFiltro;

      return matchesSearch && matchesEstado;
    });
  }, [trabajos, searchTerm, estadoFiltro, clientes, vehiculos]);

  // Eliminar trabajo
  const handleEliminar = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este trabajo?")) {
      try {
        await deleteTrabajo(id);
      } catch (error) {
        console.error("Error al eliminar trabajo:", error);
      }
    }
  };

  // Obtener nombre del cliente
  const getNombreCliente = (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente) return "Cliente no encontrado";
    return `${cliente.nombre} ${cliente.apellido}`;
  };

  // Obtener datos del vehículo
  const getVehiculo = (vehiculoId: string) => {
    return vehiculos.find((v) => v.id === vehiculoId);
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando trabajos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Órdenes de Trabajo
            </h1>
            <p className="text-muted-foreground">
              Gestiona las órdenes de trabajo y su progreso
            </p>
          </div>
        </div>

        <Button onClick={() => router.push("/trabajos/nuevo")}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Orden
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, cliente, vehículo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
        </div>

        <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos los estados</SelectItem>
            <SelectItem value={EstadoTrabajo.PENDIENTE}>Pendiente</SelectItem>
            <SelectItem value={EstadoTrabajo.EN_PROGRESO}>
              En Progreso
            </SelectItem>
            <SelectItem value={EstadoTrabajo.COMPLETADO}>
              Completado
            </SelectItem>
            <SelectItem value={EstadoTrabajo.CANCELADO}>Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla de trabajos */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trabajosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6">
                  {searchTerm || estadoFiltro !== "__all__"
                    ? "No se encontraron trabajos con esos criterios"
                    : "No hay órdenes de trabajo registradas"}
                </TableCell>
              </TableRow>
            ) : (
              trabajosFiltrados.map((trabajo) => {
                const vehiculo = getVehiculo(trabajo.vehiculoId);
                return (
                  <TableRow
                    key={trabajo.id}
                    className={
                      trabajo.estado === EstadoTrabajo.COMPLETADO
                        ? "bg-green-50 hover:bg-green-100"
                        : ""
                    }
                  >
                    <TableCell className="font-mono font-medium">
                      {trabajo.numero}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {getNombreCliente(trabajo.clienteId)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {vehiculo ? (
                        <div className="flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          <span className="font-mono">{vehiculo.patente}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {trabajo.tecnicoAsignado || (
                        <span className="text-muted-foreground">
                          Sin asignar
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <PrioridadBadge prioridad={trabajo.prioridad} />
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(trabajo.total)}
                    </TableCell>
                    <TableCell>
                      <EstadoBadge estado={trabajo.estado} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {trabajo.fechaCreacion.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`/trabajos/${trabajo.id}`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEliminar(trabajo.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
