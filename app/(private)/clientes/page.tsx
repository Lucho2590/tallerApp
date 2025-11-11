"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Phone, Mail, MapPin, ChevronDown, ChevronUp, Car } from "lucide-react";
import { useClientes } from "@/hooks/clientes/useClientes";
import { useVehiculos } from "@/hooks/vehiculos/useVehiculos";
import { clienteSchema, type ClienteFormData } from "@/lib/validations/cliente";
import { Cliente } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ClientesPage() {
  const { clientes, loading, error, createCliente, updateCliente, deleteCliente } = useClientes();
  const { vehiculos } = useVehiculos();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
  });

  const handleOpenDialog = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente);
      reset({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        email: cliente.email || "",
        telefono: cliente.telefono,
        direccion: cliente.direccion || "",
        cuit: cliente.cuit || "",
        profesion: cliente.profesion || "",
        ciudad: cliente.ciudad || "",
        notas: cliente.notas || "",
        observaciones: cliente.observaciones || "",
      });
    } else {
      setEditingCliente(null);
      reset({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        direccion: "",
        cuit: "",
        profesion: "",
        ciudad: "",
        notas: "",
        observaciones: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCliente(null);
    reset();
  };

  const onSubmit = async (data: ClienteFormData) => {
    try {
      setIsSubmitting(true);
      if (editingCliente) {
        await updateCliente(editingCliente.id, data);
      } else {
        await createCliente(data);
      }
      handleCloseDialog();
    } catch (err) {
      console.error("Error al guardar cliente:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      try {
        await deleteCliente(id);
      } catch (err) {
        console.error("Error al eliminar cliente:", err);
      }
    }
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getClienteVehiculos = (clienteId: string) => {
    return vehiculos.filter((v) => v.clienteId === clienteId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando clientes...</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona la información de tus clientes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? "Editar Cliente" : "Nuevo Cliente"}
              </DialogTitle>
              <DialogDescription>
                {editingCliente
                  ? "Actualiza la información del cliente"
                  : "Completa el formulario para agregar un nuevo cliente"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    placeholder="Juan"
                    {...register("nombre")}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-destructive">{errors.nombre.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    placeholder="Pérez"
                    {...register("apellido")}
                  />
                  {errors.apellido && (
                    <p className="text-sm text-destructive">{errors.apellido.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    id="telefono"
                    placeholder="+54 9 223 123-4567"
                    {...register("telefono")}
                  />
                  {errors.telefono && (
                    <p className="text-sm text-destructive">{errors.telefono.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="cliente@email.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cuit">CUIT</Label>
                  <Input
                    id="cuit"
                    placeholder="20-12345678-9"
                    {...register("cuit")}
                  />
                  {errors.cuit && (
                    <p className="text-sm text-destructive">{errors.cuit.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profesion">Profesión</Label>
                  <Input
                    id="profesion"
                    placeholder="Ej: Contador"
                    {...register("profesion")}
                  />
                  {errors.profesion && (
                    <p className="text-sm text-destructive">{errors.profesion.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    placeholder="Calle 123"
                    {...register("direccion")}
                  />
                  {errors.direccion && (
                    <p className="text-sm text-destructive">{errors.direccion.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Input
                    id="ciudad"
                    placeholder="Mar del Plata"
                    {...register("ciudad")}
                  />
                  {errors.ciudad && (
                    <p className="text-sm text-destructive">{errors.ciudad.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  placeholder="Información adicional sobre el cliente"
                  rows={3}
                  {...register("notas")}
                />
                {errors.notas && (
                  <p className="text-sm text-destructive">{errors.notas.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Observaciones importantes"
                  rows={3}
                  {...register("observaciones")}
                />
                {errors.observaciones && (
                  <p className="text-sm text-destructive">{errors.observaciones.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : editingCliente ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {clientes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No hay clientes registrados</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comienza agregando tu primer cliente
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Cliente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="w-10 px-4 py-3 text-left text-sm font-medium"></th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Cliente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Contacto</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Ubicación</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Profesión</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Vehículos</th>
                    <th className="w-24 px-4 py-3 text-right text-sm font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {clientes.map((cliente) => {
                    const clienteVehiculos = getClienteVehiculos(cliente.id);
                    const isExpanded = expandedRows.has(cliente.id);

                    return (
                      <Collapsible key={cliente.id} open={isExpanded} asChild>
                        <>
                          <tr className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => toggleRow(cliente.id)}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium">
                                  {cliente.nombre} {cliente.apellido}
                                </p>
                                {cliente.cuit && (
                                  <p className="text-xs text-muted-foreground">
                                    CUIT: {cliente.cuit}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span>{cliente.telefono}</span>
                                </div>
                                {cliente.email && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                    <span className="truncate max-w-[200px]">
                                      {cliente.email}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">
                                {cliente.ciudad && (
                                  <p className="font-medium">{cliente.ciudad}</p>
                                )}
                                {cliente.direccion && (
                                  <p className="text-muted-foreground text-xs">
                                    {cliente.direccion}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {cliente.profesion && (
                                <Badge variant="secondary">{cliente.profesion}</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">
                                <Car className="h-3 w-3 mr-1" />
                                {clienteVehiculos.length}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1 justify-end">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleOpenDialog(cliente)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDelete(cliente.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                          <CollapsibleContent asChild>
                            <tr>
                              <td colSpan={7} className="px-4 py-4 bg-muted/20">
                                <div className="space-y-4">
                                  {/* Additional Info */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {cliente.notas && (
                                      <div>
                                        <h4 className="text-sm font-medium mb-1">Notas</h4>
                                        <p className="text-sm text-muted-foreground">
                                          {cliente.notas}
                                        </p>
                                      </div>
                                    )}
                                    {cliente.observaciones && (
                                      <div>
                                        <h4 className="text-sm font-medium mb-1">
                                          Observaciones
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                          {cliente.observaciones}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Vehicles List */}
                                  {clienteVehiculos.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">Vehículos</h4>
                                      <div className="grid gap-2">
                                        {clienteVehiculos.map((vehiculo) => (
                                          <div
                                            key={vehiculo.id}
                                            className="flex items-center justify-between p-3 bg-card rounded-md border"
                                          >
                                            <div className="flex items-center gap-3">
                                              <Car className="h-4 w-4 text-muted-foreground" />
                                              <div>
                                                <p className="text-sm font-medium">
                                                  {vehiculo.marca} {vehiculo.modelo}{" "}
                                                  {vehiculo.año}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  Patente: {vehiculo.patente}
                                                  {vehiculo.color && ` • ${vehiculo.color}`}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          </CollapsibleContent>
                        </>
                      </Collapsible>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Cards */}
          <div className="lg:hidden space-y-4">
            {clientes.map((cliente) => {
              const clienteVehiculos = getClienteVehiculos(cliente.id);
              const isExpanded = expandedRows.has(cliente.id);

              return (
                <Collapsible key={cliente.id} open={isExpanded}>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">
                            {cliente.nombre} {cliente.apellido}
                          </CardTitle>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {cliente.profesion && (
                              <Badge variant="secondary" className="text-xs">
                                {cliente.profesion}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              <Car className="h-3 w-3 mr-1" />
                              {clienteVehiculos.length}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenDialog(cliente)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(cliente.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{cliente.telefono}</span>
                        </div>
                        {cliente.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{cliente.email}</span>
                          </div>
                        )}
                        {(cliente.ciudad || cliente.direccion) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">
                              {cliente.ciudad}
                              {cliente.ciudad && cliente.direccion && ", "}
                              {cliente.direccion}
                            </span>
                          </div>
                        )}
                        {cliente.cuit && (
                          <p className="text-xs text-muted-foreground">
                            CUIT: {cliente.cuit}
                          </p>
                        )}
                      </div>

                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => toggleRow(cliente.id)}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-2" />
                              Ver menos
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-2" />
                              Ver más
                            </>
                          )}
                        </Button>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="space-y-3">
                        {(cliente.notas || cliente.observaciones) && (
                          <div className="pt-3 border-t space-y-2">
                            {cliente.notas && (
                              <div>
                                <h4 className="text-xs font-medium text-muted-foreground mb-1">
                                  Notas
                                </h4>
                                <p className="text-sm">{cliente.notas}</p>
                              </div>
                            )}
                            {cliente.observaciones && (
                              <div>
                                <h4 className="text-xs font-medium text-muted-foreground mb-1">
                                  Observaciones
                                </h4>
                                <p className="text-sm">{cliente.observaciones}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {clienteVehiculos.length > 0 && (
                          <div className="pt-3 border-t">
                            <h4 className="text-xs font-medium text-muted-foreground mb-2">
                              Vehículos ({clienteVehiculos.length})
                            </h4>
                            <div className="space-y-2">
                              {clienteVehiculos.map((vehiculo) => (
                                <div
                                  key={vehiculo.id}
                                  className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm"
                                >
                                  <Car className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                      {vehiculo.marca} {vehiculo.modelo} {vehiculo.año}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {vehiculo.patente}
                                      {vehiculo.color && ` • ${vehiculo.color}`}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CollapsibleContent>
                    </CardContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
