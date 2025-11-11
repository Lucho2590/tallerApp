"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Car as CarIcon, User, ChevronDown, ChevronUp } from "lucide-react";
import { useVehiculos } from "@/hooks/vehiculos/useVehiculos";
import { useClientes } from "@/hooks/clientes/useClientes";
import { vehiculoSchema, type VehiculoFormData } from "@/lib/validations/vehiculo";
import { Vehiculo } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function VehiculosPage() {
  const { vehiculos, loading, error, createVehiculo, updateVehiculo, deleteVehiculo } = useVehiculos();
  const { clientes } = useClientes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
  });

  const handleOpenDialog = (vehiculo?: Vehiculo) => {
    if (vehiculo) {
      setEditingVehiculo(vehiculo);
      reset({
        clienteId: vehiculo.clienteId,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        año: vehiculo.año,
        patente: vehiculo.patente,
        color: vehiculo.color || "",
        nChasis: vehiculo.nChasis || "",
        kilometraje: vehiculo.kilometraje || null,
        datosAdicionales: vehiculo.datosAdicionales || "",
        notas: vehiculo.notas || "",
      });
    } else {
      setEditingVehiculo(null);
      reset({
        clienteId: "",
        marca: "",
        modelo: "",
        año: new Date().getFullYear(),
        patente: "",
        color: "",
        nChasis: "",
        kilometraje: null,
        datosAdicionales: "",
        notas: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingVehiculo(null);
    reset();
  };

  const onSubmit = async (data: VehiculoFormData) => {
    try {
      setIsSubmitting(true);
      // Convert null to undefined for kilometraje
      const vehiculoData = {
        ...data,
        kilometraje: data.kilometraje === null ? undefined : data.kilometraje,
      };
      if (editingVehiculo) {
        await updateVehiculo(editingVehiculo.id, vehiculoData);
      } else {
        await createVehiculo(vehiculoData);
      }
      handleCloseDialog();
    } catch (err) {
      console.error("Error al guardar vehículo:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este vehículo?")) {
      try {
        await deleteVehiculo(id);
      } catch (err) {
        console.error("Error al eliminar vehículo:", err);
      }
    }
  };

  const getClienteNombre = (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : "Sin dueño asignado";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehículos</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los vehículos de tus clientes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Vehículo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVehiculo ? "Editar Vehículo" : "Nuevo Vehículo"}
              </DialogTitle>
              <DialogDescription>
                {editingVehiculo
                  ? "Actualiza la información del vehículo"
                  : "Completa el formulario para agregar un nuevo vehículo"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clienteId">Cliente *</Label>
                <Controller
                  name="clienteId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nombre} {cliente.apellido}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.clienteId && (
                  <p className="text-sm text-destructive">{errors.clienteId.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca *</Label>
                  <Input
                    id="marca"
                    placeholder="Ford"
                    {...register("marca")}
                  />
                  {errors.marca && (
                    <p className="text-sm text-destructive">{errors.marca.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo *</Label>
                  <Input
                    id="modelo"
                    placeholder="Focus"
                    {...register("modelo")}
                  />
                  {errors.modelo && (
                    <p className="text-sm text-destructive">{errors.modelo.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="año">Año *</Label>
                  <Input
                    id="año"
                    type="number"
                    placeholder="2020"
                    {...register("año", { valueAsNumber: true })}
                  />
                  {errors.año && (
                    <p className="text-sm text-destructive">{errors.año.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patente">Patente *</Label>
                  <Input
                    id="patente"
                    placeholder="ABC123"
                    {...register("patente")}
                  />
                  {errors.patente && (
                    <p className="text-sm text-destructive">{errors.patente.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    placeholder="Azul"
                    {...register("color")}
                  />
                  {errors.color && (
                    <p className="text-sm text-destructive">{errors.color.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nChasis">Número de Chasis</Label>
                  <Input
                    id="nChasis"
                    placeholder="WBADT4316K..."
                    {...register("nChasis")}
                  />
                  {errors.nChasis && (
                    <p className="text-sm text-destructive">{errors.nChasis.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kilometraje">Kilometraje</Label>
                <Input
                  id="kilometraje"
                  type="number"
                  placeholder="50000"
                  {...register("kilometraje", {
                    valueAsNumber: true,
                    setValueAs: v => v === "" ? null : Number(v)
                  })}
                />
                {errors.kilometraje && (
                  <p className="text-sm text-destructive">{errors.kilometraje.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="datosAdicionales">Datos Adicionales</Label>
                <Textarea
                  id="datosAdicionales"
                  placeholder="Modificaciones, accesorios, etc."
                  rows={3}
                  {...register("datosAdicionales")}
                />
                {errors.datosAdicionales && (
                  <p className="text-sm text-destructive">{errors.datosAdicionales.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  placeholder="Información adicional del vehículo"
                  rows={3}
                  {...register("notas")}
                />
                {errors.notas && (
                  <p className="text-sm text-destructive">{errors.notas.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : editingVehiculo ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {vehiculos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <CarIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No hay vehículos registrados</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comienza agregando el primer vehículo
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Vehículo
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
                    <th className="px-4 py-3 text-left text-sm font-medium">Vehículo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Propietario</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Patente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Año</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Color</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Kilometraje</th>
                    <th className="w-24 px-4 py-3 text-right text-sm font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {vehiculos.map((vehiculo) => {
                    const isExpanded = expandedRows.has(vehiculo.id);

                    return (
                      <Collapsible key={vehiculo.id} open={isExpanded} asChild>
                        <>
                          <tr className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => toggleRow(vehiculo.id)}
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
                              <div className="flex items-center gap-3">
                                <div className="rounded-full bg-primary/10 p-2">
                                  <CarIcon className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {vehiculo.marca} {vehiculo.modelo}
                                  </p>
                                  {vehiculo.nChasis && (
                                    <p className="text-xs text-muted-foreground">
                                      Ch: {vehiculo.nChasis.substring(0, 10)}...
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">
                                  {getClienteNombre(vehiculo.clienteId)}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="font-mono">
                                {vehiculo.patente}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm">{vehiculo.año}</span>
                            </td>
                            <td className="px-4 py-3">
                              {vehiculo.color && (
                                <Badge variant="secondary">{vehiculo.color}</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {vehiculo.kilometraje && (
                                <span className="text-sm">
                                  {vehiculo.kilometraje.toLocaleString()} km
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1 justify-end">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleOpenDialog(vehiculo)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDelete(vehiculo.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                          <CollapsibleContent asChild>
                            <tr>
                              <td colSpan={8} className="px-4 py-4 bg-muted/20">
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    {vehiculo.notas && (
                                      <div>
                                        <h4 className="text-sm font-medium mb-1">Notas</h4>
                                        <p className="text-sm text-muted-foreground">
                                          {vehiculo.notas}
                                        </p>
                                      </div>
                                    )}
                                  </div>
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
            {vehiculos.map((vehiculo) => {
              const isExpanded = expandedRows.has(vehiculo.id);

              return (
                <Collapsible key={vehiculo.id} open={isExpanded}>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                            <CarIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">
                              {vehiculo.marca} {vehiculo.modelo}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <p className="text-sm text-muted-foreground truncate">
                                {getClienteNombre(vehiculo.clienteId)}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                {vehiculo.patente}
                              </Badge>
                              {vehiculo.color && (
                                <Badge variant="secondary" className="text-xs">
                                  {vehiculo.color}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenDialog(vehiculo)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(vehiculo.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Año</p>
                          <p className="font-medium">{vehiculo.año}</p>
                        </div>
                        {vehiculo.kilometraje && (
                          <div>
                            <p className="text-muted-foreground text-xs">Kilometraje</p>
                            <p className="font-medium">
                              {vehiculo.kilometraje.toLocaleString()} km
                            </p>
                          </div>
                        )}
                      </div>

                      {vehiculo.nChasis && (
                        <div>
                          <p className="text-muted-foreground text-xs">Número de Chasis</p>
                          <p className="text-sm font-mono">{vehiculo.nChasis}</p>
                        </div>
                      )}

                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => toggleRow(vehiculo.id)}
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
                        {(vehiculo.datosAdicionales || vehiculo.notas) && (
                          <div className="pt-3 border-t space-y-2">
                            {vehiculo.datosAdicionales && (
                              <div>
                                <h4 className="text-xs font-medium text-muted-foreground mb-1">
                                  Datos Adicionales
                                </h4>
                                <p className="text-sm">{vehiculo.datosAdicionales}</p>
                              </div>
                            )}
                            {vehiculo.notas && (
                              <div>
                                <h4 className="text-xs font-medium text-muted-foreground mb-1">
                                  Notas
                                </h4>
                                <p className="text-sm">{vehiculo.notas}</p>
                              </div>
                            )}
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
