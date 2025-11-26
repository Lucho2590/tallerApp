"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Car,
  Plus,
  Pencil,
  Trash2,
  Search,
  Fuel,
  Calendar,
  Gauge,
  ChevronDown,
  ChevronRight,
  Users,
  UserPlus,
  Wrench,
  FileText,
} from "lucide-react";
import { useVehiculos } from "@/hooks/vehiculos/useVehiculos";
import { useClientes } from "@/hooks/clientes/useClientes";
import { useTrabajos } from "@/hooks/trabajos/useTrabajos";
import { vehiculoSchema, type VehiculoFormData } from "@/lib/validations/vehiculo";
import { clienteSchema, type ClienteFormData } from "@/lib/validations/cliente";
import { Vehiculo, EstadoTrabajo } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COMBUSTIBLES = [
  "Nafta",
  "Diesel",
  "GNC",
  "Eléctrico",
  "Híbrido",
  "Nafta/GNC",
];

// Componente para mostrar una fila de vehículo
function VehiculoRow({
  vehiculo,
  isExpanded,
  onToggleExpansion,
  onEditVehiculo,
  onDeleteVehiculo,
  onCambiarDueno,
  clientes,
  trabajosVehiculo,
}: {
  vehiculo: Vehiculo;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onEditVehiculo: () => void;
  onDeleteVehiculo: () => void;
  onCambiarDueno: () => void;
  clientes: any[];
  trabajosVehiculo: any[];
}) {
  const getDuenoInfo = () => {
    if (vehiculo.clienteId) {
      const cliente = clientes.find((c) => c.id === vehiculo.clienteId);
      return cliente
        ? {
            tipo: "cliente",
            nombre: `${cliente.nombre} ${cliente.apellido}`,
          }
        : { tipo: "cliente", nombre: "Cliente no encontrado" };
    } else if (vehiculo.nombreDueno) {
      return { tipo: "nombre", nombre: vehiculo.nombreDueno };
    }
    return { tipo: "sin_dueno", nombre: "-" };
  };

  const duenoInfo = getDuenoInfo();

  const formatearKilometraje = (km?: number) => {
    if (!km) return "-";
    return `${km.toLocaleString()} km`;
  };

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpansion}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell className="font-medium font-mono">
          {vehiculo.patente}
        </TableCell>
        <TableCell>{vehiculo.modeloMarca || `${vehiculo.marca} ${vehiculo.modelo}`}</TableCell>
        <TableCell>
          {duenoInfo.tipo === "cliente" ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-green-600" />
                <span className="text-sm font-medium">{duenoInfo.nombre}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Cliente
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCambiarDueno}
                className="h-6 text-xs"
                title="Cambiar dueño"
              >
                <UserPlus className="h-3 w-3" />
              </Button>
            </div>
          ) : duenoInfo.tipo === "nombre" ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">{duenoInfo.nombre}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onCambiarDueno}
                className="h-6 text-xs"
              >
                Crear Cliente
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">-</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onCambiarDueno}
                className="h-6 text-xs"
              >
                Asignar Dueño
              </Button>
            </div>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Fuel className="h-3 w-3" />
            {vehiculo.combustible}
          </div>
        </TableCell>
        <TableCell>{vehiculo.color || "-"}</TableCell>
        <TableCell>
          {vehiculo.año ? (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {vehiculo.año}
            </div>
          ) : (
            "-"
          )}
        </TableCell>
        <TableCell>
          {vehiculo.kilometraje ? (
            <div className="flex items-center gap-1">
              <Gauge className="h-3 w-3" />
              {formatearKilometraje(vehiculo.kilometraje)}
            </div>
          ) : (
            "-"
          )}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={onEditVehiculo}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDeleteVehiculo}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Fila expandible con detalles */}
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={9} className="p-0">
            <div className="bg-muted/20 p-4 border-t">
              <div className="space-y-3">
                {/* Información adicional */}
                {(vehiculo.datosAdicionales || vehiculo.nChasis) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehiculo.nChasis && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">
                          Número de Chasis
                        </h4>
                        <p className="text-sm text-muted-foreground font-mono">
                          {vehiculo.nChasis}
                        </p>
                      </div>
                    )}
                    {vehiculo.datosAdicionales && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">
                          Datos Adicionales
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {vehiculo.datosAdicionales}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Historial de reparaciones */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Historial de Servicios
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        // TODO: Implementar navegación a historial completo
                        alert("Función disponible próximamente");
                      }}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Ver Historial Completo
                    </Button>
                  </div>

                  {trabajosVehiculo.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      No hay servicios registrados para este vehículo
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {trabajosVehiculo.slice(0, 3).map((trabajo) => (
                        <div
                          key={trabajo.id}
                          className="flex items-center justify-between p-2 border rounded bg-white"
                        >
                          <div className="flex items-center gap-2">
                            <Wrench className="h-3 w-3 text-muted-foreground" />
                            <div>
                              <p className="text-xs font-medium font-mono">
                                {trabajo.numero}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {trabajo.descripcionGeneral || "Sin descripción"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">
                              ${trabajo.total.toFixed(2)}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                trabajo.estado === EstadoTrabajo.COMPLETADO
                                  ? "bg-green-100 text-green-800"
                                  : trabajo.estado === EstadoTrabajo.EN_PROGRESO
                                  ? "bg-blue-100 text-blue-800"
                                  : trabajo.estado === EstadoTrabajo.CANCELADO
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {trabajo.estado === EstadoTrabajo.COMPLETADO
                                ? "Completado"
                                : trabajo.estado === EstadoTrabajo.EN_PROGRESO
                                ? "En Progreso"
                                : trabajo.estado === EstadoTrabajo.CANCELADO
                                ? "Cancelado"
                                : "Pendiente"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {trabajosVehiculo.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center pt-1">
                          Y {trabajosVehiculo.length - 3} servicio(s) más...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}

export default function VehiculosPage() {
  const { vehiculos, loading, error, createVehiculo, updateVehiculo, deleteVehiculo } =
    useVehiculos();
  const { clientes, createCliente } = useClientes();
  const { trabajos } = useTrabajos();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDuenoDialogOpen, setIsDuenoDialogOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);
  const [vehiculoParaDueno, setVehiculoParaDueno] = useState<Vehiculo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [tabDueno, setTabDueno] = useState<"asignar" | "crear">("asignar");
  const [filtroClientes, setFiltroClientes] = useState("");

  const form = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      patente: "",
      nChasis: "",
      modeloMarca: "",
      combustible: "",
      color: "",
      año: "",
      kilometraje: "",
      datosAdicionales: "",
      clienteId: "",
      nombreDueno: "",
    },
  });

  const clienteForm = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      telefono: "",
      email: "",
      direccion: "",
      cuit: "",
      profesion: "",
      ciudad: "",
      notas: "",
      observaciones: "",
    },
  });

  // Filtrar vehículos por búsqueda combinada
  const vehiculosFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return vehiculos;

    const terminos = searchTerm
      .toLowerCase()
      .split(/[,\s]+/)
      .filter((term) => term.trim().length > 0);

    return vehiculos.filter((vehiculo) => {
      const textoCompleto = [
        vehiculo.patente,
        vehiculo.nChasis,
        vehiculo.modeloMarca,
        vehiculo.marca,
        vehiculo.modelo,
        vehiculo.combustible,
        vehiculo.color,
        vehiculo.año?.toString(),
        vehiculo.kilometraje?.toString(),
        vehiculo.datosAdicionales,
        vehiculo.nombreDueno,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return terminos.every((termino) => textoCompleto.includes(termino));
    });
  }, [vehiculos, searchTerm]);

  // Filtrar clientes para el modal
  const clientesFiltrados = useMemo(() => {
    if (!filtroClientes.trim()) return clientes;

    const searchLower = filtroClientes.toLowerCase();
    return clientes.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(searchLower) ||
        cliente.apellido.toLowerCase().includes(searchLower) ||
        cliente.telefono.includes(filtroClientes) ||
        cliente.email?.toLowerCase().includes(searchLower) ||
        cliente.cuit?.toLowerCase().includes(searchLower) ||
        cliente.ciudad?.toLowerCase().includes(searchLower)
    );
  }, [clientes, filtroClientes]);

  const abrirNuevoVehiculo = () => {
    setEditingVehiculo(null);
    form.reset({
      patente: "",
      nChasis: "",
      modeloMarca: "",
      combustible: "",
      color: "",
      año: "",
      kilometraje: "",
      datosAdicionales: "",
      clienteId: "",
      nombreDueno: "",
    });
    setIsDialogOpen(true);
  };

  const abrirEditarVehiculo = (vehiculo: Vehiculo) => {
    setEditingVehiculo(vehiculo);
    form.reset({
      patente: vehiculo.patente,
      nChasis: vehiculo.nChasis || "",
      modeloMarca: vehiculo.modeloMarca || `${vehiculo.marca || ""} ${vehiculo.modelo || ""}`.trim(),
      combustible: vehiculo.combustible || "",
      color: vehiculo.color || "",
      año: vehiculo.año?.toString() || "",
      kilometraje: vehiculo.kilometraje?.toString() || "",
      datosAdicionales: vehiculo.datosAdicionales || "",
      clienteId: vehiculo.clienteId || "",
      nombreDueno: vehiculo.nombreDueno || "",
    });
    setIsDialogOpen(true);
  };

  const abrirCambiarDueno = (vehiculo: Vehiculo) => {
    setVehiculoParaDueno(vehiculo);
    setTabDueno("asignar");
    setFiltroClientes("");
    clienteForm.reset({
      nombre: "",
      apellido: vehiculo.nombreDueno || "",
      telefono: "",
      email: "",
      direccion: "",
      cuit: "",
      profesion: "",
      ciudad: "",
      notas: "",
      observaciones: "",
    });
    setIsDuenoDialogOpen(true);
  };

  const onSubmit = async (data: VehiculoFormData) => {
    setIsSubmitting(true);
    try {
      const vehiculoData = {
        ...data,
        patente: data.patente.toUpperCase(),
        año: data.año ? parseInt(data.año) : undefined,
        kilometraje: data.kilometraje ? parseInt(data.kilometraje) : undefined,
        clienteId: data.clienteId || undefined,
        nombreDueno: data.nombreDueno || undefined,
      };

      if (editingVehiculo) {
        await updateVehiculo(editingVehiculo.id, vehiculoData);
      } else {
        await createVehiculo(vehiculoData);
      }

      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error al guardar vehículo:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const asignarClienteExistente = async (clienteId: string) => {
    if (!vehiculoParaDueno?.id) return;

    setIsSubmitting(true);
    try {
      await updateVehiculo(vehiculoParaDueno.id, {
        clienteId: clienteId,
        nombreDueno: undefined,
      });

      setIsDuenoDialogOpen(false);
      setVehiculoParaDueno(null);
    } catch (error) {
      console.error("Error al asignar cliente:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitCliente = async (data: ClienteFormData) => {
    if (!vehiculoParaDueno?.id) return;

    setIsSubmitting(true);
    try {
      const clienteId = await createCliente(data);

      await updateVehiculo(vehiculoParaDueno.id, {
        clienteId: clienteId,
        nombreDueno: undefined,
      });

      setIsDuenoDialogOpen(false);
      setVehiculoParaDueno(null);
      clienteForm.reset();
    } catch (error) {
      console.error("Error al crear cliente y asignar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const asignarNombreDueno = async (nombreDueno: string) => {
    if (!vehiculoParaDueno?.id) return;

    setIsSubmitting(true);
    try {
      await updateVehiculo(vehiculoParaDueno.id, {
        nombreDueno: nombreDueno,
        clienteId: undefined,
      });

      setIsDuenoDialogOpen(false);
      setVehiculoParaDueno(null);
    } catch (error) {
      console.error("Error al asignar nombre de dueño:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEliminarVehiculo = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este vehículo?")) {
      try {
        await deleteVehiculo(id);
      } catch (error) {
        console.error("Error al eliminar vehículo:", error);
      }
    }
  };

  const toggleRowExpansion = (vehiculoId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(vehiculoId)) {
      newExpandedRows.delete(vehiculoId);
    } else {
      newExpandedRows.add(vehiculoId);
    }
    setExpandedRows(newExpandedRows);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando vehículos...</p>
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
          <Car className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vehículos</h1>
            <p className="text-muted-foreground">
              Gestiona el inventario de vehículos
            </p>
          </div>
        </div>

        <Button onClick={abrirNuevoVehiculo}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Vehículo
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por campos combinados: 'sandero azul', 'toyota 2020', etc..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Tabla de vehículos */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Patente</TableHead>
              <TableHead>Modelo/Marca</TableHead>
              <TableHead>Dueño</TableHead>
              <TableHead>Combustible</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Kilometraje</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehiculosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6">
                  {searchTerm
                    ? "No se encontraron vehículos con ese criterio de búsqueda"
                    : "No hay vehículos registrados"}
                </TableCell>
              </TableRow>
            ) : (
              vehiculosFiltrados.map((vehiculo) => {
                const isExpanded = expandedRows.has(vehiculo.id);
                const trabajosVehiculo = trabajos.filter(
                  (t) => t.vehiculoId === vehiculo.id
                ).sort((a, b) => {
                  // Ordenar por fecha de creación descendente (más recientes primero)
                  return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
                });

                return (
                  <VehiculoRow
                    key={vehiculo.id}
                    vehiculo={vehiculo}
                    isExpanded={isExpanded}
                    onToggleExpansion={() => toggleRowExpansion(vehiculo.id)}
                    onEditVehiculo={() => abrirEditarVehiculo(vehiculo)}
                    onDeleteVehiculo={() => handleEliminarVehiculo(vehiculo.id)}
                    onCambiarDueno={() => abrirCambiarDueno(vehiculo)}
                    clientes={clientes}
                    trabajosVehiculo={trabajosVehiculo}
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog para crear/editar vehículo */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingVehiculo ? "Editar Vehículo" : "Nuevo Vehículo"}
            </DialogTitle>
            <DialogDescription>
              {editingVehiculo
                ? "Modifica los datos del vehículo"
                : "Completa los datos del nuevo vehículo. Los campos marcados con (*) son obligatorios."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patente *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ABC123 o AB123CD"
                          style={{ textTransform: "uppercase" }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nChasis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>N° de Chasis</FormLabel>
                      <FormControl>
                        <Input placeholder="Número de chasis" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="modeloMarca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo y Marca *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Toyota Corolla, Ford Focus, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sección de Dueño */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Información del Dueño</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clienteId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dueño</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value === "__none__" ? "" : value)
                          }
                          value={field.value || "__none__"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar dueño" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="__none__">Ninguno</SelectItem>
                            {clientes.map((cliente) => (
                              <SelectItem key={cliente.id} value={cliente.id}>
                                {cliente.nombre} {cliente.apellido}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nombreDueno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Dueño</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Si no está en la lista de clientes..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Puedes seleccionar un dueño de la lista de clientes o escribir
                  el nombre si aún no es cliente registrado.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="combustible"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Combustible *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMBUSTIBLES.map((combustible) => (
                            <SelectItem key={combustible} value={combustible}>
                              {combustible}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="Color del vehículo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="año"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Año</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="2023"
                          type="number"
                          min="1900"
                          max={new Date().getFullYear() + 1}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="kilometraje"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilometraje</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="150000"
                        type="number"
                        min="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="datosAdicionales"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Datos Adicionales</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Información adicional sobre el vehículo..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Guardando..."
                    : editingVehiculo
                    ? "Actualizar"
                    : "Crear Vehículo"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para cambiar dueño */}
      <Dialog open={isDuenoDialogOpen} onOpenChange={setIsDuenoDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Cambiar Dueño - {vehiculoParaDueno?.patente}
            </DialogTitle>
            <DialogDescription>
              Puedes asignar un cliente existente, crear un nuevo cliente o solo
              asignar un nombre.
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex space-x-1 border-b">
            <button
              onClick={() => setTabDueno("asignar")}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                tabDueno === "asignar"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary"
              }`}
            >
              Asignar Cliente
            </button>
            <button
              onClick={() => setTabDueno("crear")}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                tabDueno === "crear"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary"
              }`}
            >
              Crear Cliente
            </button>
          </div>

          {/* Contenido según tab */}
          {tabDueno === "asignar" ? (
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">
                  Seleccionar Cliente Existente
                </h4>

                {clientes.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">
                      No hay clientes registrados.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Puedes crear un nuevo cliente en la pestaña "Crear
                      Cliente".
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por apellido, nombres, teléfono, email..."
                        value={filtroClientes}
                        onChange={(e) => setFiltroClientes(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {clientesFiltrados.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground text-sm">
                            No se encontraron clientes con ese criterio de
                            búsqueda
                          </p>
                        </div>
                      ) : (
                        clientesFiltrados.map((cliente) => (
                          <div
                            key={cliente.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <Users className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="font-medium">
                                  {cliente.nombre} {cliente.apellido}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {cliente.telefono}
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() =>
                                asignarClienteExistente(cliente.id)
                              }
                              disabled={isSubmitting}
                              size="sm"
                            >
                              {isSubmitting ? "Asignando..." : "Asignar"}
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Solo Asignar Nombre</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nombre del dueño (sin crear cliente)"
                    defaultValue={vehiculoParaDueno?.nombreDueno || ""}
                    id="nombreDueno"
                  />
                  <Button
                    onClick={() => {
                      const input = document.getElementById(
                        "nombreDueno"
                      ) as HTMLInputElement;
                      if (input.value.trim()) {
                        asignarNombreDueno(input.value.trim());
                      }
                    }}
                    disabled={isSubmitting}
                    variant="outline"
                  >
                    {isSubmitting ? "Asignando..." : "Asignar Nombre"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Útil para dueños que no serán clientes frecuentes
                </p>
              </div>
            </div>
          ) : (
            <Form {...clienteForm}>
              <form
                onSubmit={clienteForm.handleSubmit(onSubmitCliente)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={clienteForm.control}
                    name="apellido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingresa apellido" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={clienteForm.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingresa el nombre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={clienteForm.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono/Móvil *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ingresa el teléfono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={clienteForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="email@ejemplo.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={clienteForm.control}
                  name="direccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingresa la dirección" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={clienteForm.control}
                    name="ciudad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <Input placeholder="Ciudad" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={clienteForm.control}
                    name="cuit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CUIT</FormLabel>
                        <FormControl>
                          <Input placeholder="XX-XXXXXXXX-X" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDuenoDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Creando Cliente..."
                      : "Crear y Asignar Cliente"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
