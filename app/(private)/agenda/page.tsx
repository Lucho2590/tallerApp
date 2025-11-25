"use client";

import { useState, useMemo, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Calendar as CalendarIcon, Clock, User, Car as CarIcon } from "lucide-react";
import { useTurnos } from "@/hooks/agenda/useTurnos";
import { useClientes } from "@/hooks/clientes/useClientes";
import { useVehiculos } from "@/hooks/vehiculos/useVehiculos";
import { turnoSchema, type TurnoFormData } from "@/lib/validations/turno";
import { Turno, EstadoTurno } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const estadoColors = {
  [EstadoTurno.PENDIENTE]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [EstadoTurno.EN_PROGRESO]: "bg-blue-100 text-blue-800 border-blue-200",
  [EstadoTurno.COMPLETADO]: "bg-green-100 text-green-800 border-green-200",
  [EstadoTurno.CANCELADO]: "bg-red-100 text-red-800 border-red-200",
};

const estadoLabels = {
  [EstadoTurno.PENDIENTE]: "Pendiente",
  [EstadoTurno.EN_PROGRESO]: "En Progreso",
  [EstadoTurno.COMPLETADO]: "Completado",
  [EstadoTurno.CANCELADO]: "Cancelado",
};

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { turnos, loading, error, createTurno, updateTurno, deleteTurno } = useTurnos(selectedDate);
  const { clientes } = useClientes();
  const { vehiculos } = useVehiculos();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTurno, setEditingTurno] = useState<Turno | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TurnoFormData>({
    resolver: zodResolver(turnoSchema),
    defaultValues: {
      estado: EstadoTurno.PENDIENTE,
    },
  });

  const clienteIdValue = watch("clienteId");

  const handleOpenDialog = (turno?: Turno) => {
    if (turno) {
      setEditingTurno(turno);
      setSelectedClienteId(turno.clienteId);
      reset({
        clienteId: turno.clienteId,
        vehiculoId: turno.vehiculoId,
        fecha: turno.fecha,
        horaInicio: turno.horaInicio,
        horaFin: turno.horaFin,
        descripcion: turno.descripcion,
        estado: turno.estado,
        notas: turno.notas || "",
      });
    } else {
      setEditingTurno(null);
      setSelectedClienteId("");
      reset({
        clienteId: "",
        vehiculoId: "",
        fecha: selectedDate,
        horaInicio: "09:00",
        horaFin: "10:00",
        descripcion: "",
        estado: EstadoTurno.PENDIENTE,
        notas: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTurno(null);
    setSelectedClienteId("");
    reset();
  };

  const onSubmit = async (data: TurnoFormData) => {
    try {
      setIsSubmitting(true);
      if (editingTurno) {
        await updateTurno(editingTurno.id, data);
      } else {
        await createTurno(data);
      }
      handleCloseDialog();
    } catch (err) {
      console.error("Error al guardar turno:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este turno?")) {
      try {
        await deleteTurno(id);
      } catch (err) {
        console.error("Error al eliminar turno:", err);
      }
    }
  };

  const getClienteNombre = (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : "Cliente no encontrado";
  };

  const getVehiculoInfo = (vehiculoId: string) => {
    const vehiculo = vehiculos.find((v) => v.id === vehiculoId);
    return vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.patente}` : "Vehículo no encontrado";
  };

  const vehiculosDelCliente = useMemo(
    () => vehiculos.filter((v) => v.clienteId === (clienteIdValue || selectedClienteId)),
    [vehiculos, clienteIdValue, selectedClienteId]
  );

  const changeDate = useCallback((days: number) => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month, day] = e.target.value.split("-").map(Number);
    const newDate = new Date(year, month - 1, day);
    setSelectedDate(newDate);
  }, []);

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const formattedDateString = useMemo(
    () => formatDate(selectedDate),
    [selectedDate, formatDate]
  );

  const dateInputValue = useMemo(
    () => selectedDate.toISOString().split("T")[0],
    [selectedDate]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los turnos y citas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Turno
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTurno ? "Editar Turno" : "Nuevo Turno"}
              </DialogTitle>
              <DialogDescription>
                {editingTurno
                  ? "Actualiza la información del turno"
                  : "Completa el formulario para crear un nuevo turno"}
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
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedClienteId(value);
                        setValue("vehiculoId", "");
                      }}
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
              <div className="space-y-2">
                <Label htmlFor="vehiculoId">Vehículo *</Label>
                <Controller
                  name="vehiculoId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!clienteIdValue && !selectedClienteId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un vehículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehiculosDelCliente.map((vehiculo) => (
                          <SelectItem key={vehiculo.id} value={vehiculo.id}>
                            {vehiculo.marca} {vehiculo.modelo} - {vehiculo.patente}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.vehiculoId && (
                  <p className="text-sm text-destructive">{errors.vehiculoId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Controller
                  name="fecha"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="date"
                      value={field.value?.toISOString().split("T")[0] || ""}
                      onChange={(e) => {
                        // Crear fecha en zona horaria local para evitar problemas con UTC
                        const [year, month, day] = e.target.value.split("-").map(Number);
                        const localDate = new Date(year, month - 1, day);
                        field.onChange(localDate);
                      }}
                    />
                  )}
                />
                {errors.fecha && (
                  <p className="text-sm text-destructive">{errors.fecha.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horaInicio">Hora Inicio *</Label>
                  <Input
                    id="horaInicio"
                    type="time"
                    {...register("horaInicio")}
                  />
                  {errors.horaInicio && (
                    <p className="text-sm text-destructive">{errors.horaInicio.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaFin">Hora Fin *</Label>
                  <Input
                    id="horaFin"
                    type="time"
                    {...register("horaFin")}
                  />
                  {errors.horaFin && (
                    <p className="text-sm text-destructive">{errors.horaFin.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Input
                  id="descripcion"
                  placeholder="Ej: Service de 10.000 km"
                  {...register("descripcion")}
                />
                {errors.descripcion && (
                  <p className="text-sm text-destructive">{errors.descripcion.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Controller
                  name="estado"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(EstadoTurno).map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estadoLabels[estado]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.estado && (
                  <p className="text-sm text-destructive">{errors.estado.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notas">Notas</Label>
                <Input
                  id="notas"
                  placeholder="Información adicional"
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
                  {isSubmitting ? "Guardando..." : editingTurno ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Selector de fecha */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => changeDate(-1)}
              className="w-full sm:w-auto"
            >
              ← Día Anterior
            </Button>
            <div className="text-center flex-1">
              <div className="flex flex-col items-center gap-2">
                <p className="text-base sm:text-lg font-semibold capitalize">
                  {formattedDateString}
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={dateInputValue}
                    onChange={handleDateChange}
                    className="w-auto text-sm"
                  />
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Hoy
                  </Button>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => changeDate(1)}
              className="w-full sm:w-auto"
            >
              Día Siguiente →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de turnos */}
      {error && (
        <div className="text-center py-8 text-destructive">{error}</div>
      )}

      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando turnos...</p>
          </CardContent>
        </Card>
      ) : turnos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No hay turnos para esta fecha</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comienza agregando un turno
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Turno
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {turnos.map((turno) => (
            <Card key={turno.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex-1 w-full min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${estadoColors[turno.estado]}`}>
                        {estadoLabels[turno.estado]}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          {turno.horaInicio} - {turno.horaFin}
                        </span>
                      </span>
                    </div>
                    <h3 className="font-semibold text-base sm:text-lg mb-2 break-words">
                      {turno.descripcion}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{getClienteNombre(turno.clienteId)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{getVehiculoInfo(turno.vehiculoId)}</span>
                      </div>
                    </div>
                    {turno.notas && (
                      <p className="text-sm text-muted-foreground mt-3 pt-3 border-t break-words">
                        {turno.notas}
                      </p>
                    )}
                  </div>
                  <div className="flex sm:flex-col gap-1 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-1 sm:flex-none"
                      onClick={() => handleOpenDialog(turno)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-1 sm:flex-none"
                      onClick={() => handleDelete(turno.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
