"use client";

import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Calendar as CalendarIcon, Clock, User, Car as CarIcon, X } from "lucide-react";
import { useTurnos } from "@/hooks/agenda/useTurnos";
import { useClientes } from "@/hooks/clientes/useClientes";
import { useVehiculos } from "@/hooks/vehiculos/useVehiculos";
import { useTenant } from "@/contexts/TenantContext";
import { turnoSchema, type TurnoFormData } from "@/lib/validations/turno";
import { Turno, EstadoTurno } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
  const { currentTenant } = useTenant();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { turnos, loading, error, createTurno, updateTurno, deleteTurno } = useTurnos(selectedDate);
  const { clientes, refetch: refetchClientes } = useClientes();
  const { vehiculos, refetch: refetchVehiculos } = useVehiculos();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTurno, setEditingTurno] = useState<Turno | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para autocomplete de cliente
  const [clienteSearchText, setClienteSearchText] = useState("");
  const [showClienteSuggestions, setShowClienteSuggestions] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<{ id: string; nombre: string; apellido: string } | null>(null);

  // Estados para autocomplete de vehículo
  const [vehiculoSearchText, setVehiculoSearchText] = useState("");
  const [showVehiculoSuggestions, setShowVehiculoSuggestions] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<{ id: string; patente: string; modeloMarca: string } | null>(null);

  // Modal de confirmación para guardar datos temporales
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [pendingData, setPendingData] = useState<TurnoFormData | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<TurnoFormData>({
    // No usar resolver para poder controlar la validación manualmente
    defaultValues: {
      estado: EstadoTurno.PENDIENTE,
    },
  });

  // Filtrar clientes según búsqueda
  const clientesFiltrados = useMemo(() => {
    if (!clienteSearchText) return [];
    return clientes
      .filter((c) =>
        `${c.nombre} ${c.apellido}`.toLowerCase().includes(clienteSearchText.toLowerCase())
      )
      .slice(0, 5);
  }, [clientes, clienteSearchText]);

  // Filtrar vehículos según búsqueda
  const vehiculosFiltrados = useMemo(() => {
    if (!vehiculoSearchText) return [];
    return vehiculos
      .filter((v) =>
        v.patente.toLowerCase().includes(vehiculoSearchText.toLowerCase()) ||
        v.modeloMarca.toLowerCase().includes(vehiculoSearchText.toLowerCase())
      )
      .slice(0, 5);
  }, [vehiculos, vehiculoSearchText]);

  const handleOpenDialog = (turno?: Turno) => {
    if (turno) {
      setEditingTurno(turno);
      // Configurar cliente
      if (turno.clienteId) {
        const cliente = clientes.find((c) => c.id === turno.clienteId);
        if (cliente) {
          setSelectedCliente({ id: cliente.id, nombre: cliente.nombre, apellido: cliente.apellido });
          setClienteSearchText(`${cliente.nombre} ${cliente.apellido}`);
        }
      } else if (turno.clienteTemp) {
        setClienteSearchText(`${turno.clienteTemp.nombre} ${turno.clienteTemp.apellido}`);
      }

      // Configurar vehículo
      if (turno.vehiculoId) {
        const vehiculo = vehiculos.find((v) => v.id === turno.vehiculoId);
        if (vehiculo) {
          setSelectedVehiculo({ id: vehiculo.id, patente: vehiculo.patente, modeloMarca: vehiculo.modeloMarca });
          setVehiculoSearchText(vehiculo.patente);
        }
      } else if (turno.vehiculoTemp) {
        setVehiculoSearchText(turno.vehiculoTemp.patente);
      }

      reset({
        fecha: turno.fecha,
        horaInicio: turno.horaInicio,
        horaFin: turno.horaFin,
        descripcion: turno.descripcion,
        estado: turno.estado,
        notas: turno.notas || "",
      });
    } else {
      setEditingTurno(null);
      setSelectedCliente(null);
      setSelectedVehiculo(null);
      setClienteSearchText("");
      setVehiculoSearchText("");
      reset({
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
    setSelectedCliente(null);
    setSelectedVehiculo(null);
    setClienteSearchText("");
    setVehiculoSearchText("");
    reset();
  };

  const handleSelectCliente = (cliente: { id: string; nombre: string; apellido: string }) => {
    setSelectedCliente(cliente);
    setClienteSearchText(`${cliente.nombre} ${cliente.apellido}`);
    setShowClienteSuggestions(false);
    setValue("clienteId", cliente.id);
    setValue("clienteTemp", undefined);
  };

  const handleSelectVehiculo = (vehiculo: { id: string; patente: string; modeloMarca: string }) => {
    setSelectedVehiculo(vehiculo);
    setVehiculoSearchText(vehiculo.patente);
    setShowVehiculoSuggestions(false);
    setValue("vehiculoId", vehiculo.id);
    setValue("vehiculoTemp", undefined);
  };

  const handleSubmitClick = async (data: TurnoFormData) => {
    if (!currentTenant) {
      alert("Error: No hay un taller seleccionado");
      return;
    }

    // Limpiar errores previos
    clearErrors();

    // Determinar si hay datos temporales
    const isClienteTemp = !selectedCliente && clienteSearchText.trim();
    const isVehiculoTemp = !selectedVehiculo && vehiculoSearchText.trim();

    // Preparar datos completos
    const turnoData: TurnoFormData = { ...data };

    if (isClienteTemp) {
      const [nombre, ...apellidoParts] = clienteSearchText.trim().split(" ");
      turnoData.clienteTemp = {
        nombre: nombre || "",
        apellido: apellidoParts.join(" ") || "", // Si no hay apellido, dejar vacío
      };
      turnoData.clienteId = undefined;
    } else {
      turnoData.clienteId = selectedCliente?.id;
      turnoData.clienteTemp = undefined;
    }

    if (isVehiculoTemp) {
      turnoData.vehiculoTemp = {
        patente: "Sin especificar", // La patente se completa después
        modeloMarca: vehiculoSearchText.trim(), // Lo que escribe va al modelo/marca
      };
      turnoData.vehiculoId = undefined;
    } else {
      turnoData.vehiculoId = selectedVehiculo?.id;
      turnoData.vehiculoTemp = undefined;
    }

    // Validar con Zod
    const validation = turnoSchema.safeParse(turnoData);

    if (!validation.success) {
      // Mostrar errores de validación
      if (validation.error?.errors) {
        validation.error.errors.forEach((err) => {
          const field = err.path[0] as keyof TurnoFormData;
          setError(field, { message: err.message });
        });
      } else {
        alert("Error de validación del formulario. Revisá los campos.");
      }
      return;
    }

    // Si hay datos temporales, mostrar modal
    if (isClienteTemp || isVehiculoTemp) {
      setPendingData(turnoData);
      setShowSaveModal(true);
    } else {
      // Todo es existente, crear directamente
      await createTurnoDirectly(turnoData);
    }
  };

  const createTurnoDirectly = async (data: TurnoFormData) => {
    if (!currentTenant) return;

    try {
      setIsSubmitting(true);
      if (editingTurno) {
        await updateTurno(editingTurno.id, data);
      } else {
        await createTurno({ ...data, tenantId: currentTenant.id });
      }
      handleCloseDialog();
    } catch (err) {
      console.error("Error al guardar turno:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const createTurnoAndSave = async (saveCliente: boolean, saveVehiculo: boolean) => {
    if (!currentTenant || !pendingData) return;

    try {
      setIsSubmitting(true);
      let finalClienteId = pendingData.clienteId;
      let finalVehiculoId = pendingData.vehiculoId;

      // Guardar cliente si se solicitó
      if (saveCliente && pendingData.clienteTemp) {
        const { clientesService } = await import("@/services/clientes/clientesService");
        finalClienteId = await clientesService.create({
          tenantId: currentTenant.id,
          ...pendingData.clienteTemp,
          telefono: pendingData.clienteTemp.telefono || "",
          email: "",
        });
        // Recargar lista de clientes
        await refetchClientes();
      }

      // Guardar vehículo si se solicitó
      if (saveVehiculo && pendingData.vehiculoTemp) {
        const { vehiculosService } = await import("@/services/vehiculos/vehiculosService");
        finalVehiculoId = await vehiculosService.create({
          tenantId: currentTenant.id,
          clienteId: finalClienteId || "",
          ...pendingData.vehiculoTemp,
          combustible: "Sin especificar",
        });
        // Recargar lista de vehículos
        await refetchVehiculos();
      }

      const turnoData: TurnoFormData = {
        ...pendingData,
        clienteId: finalClienteId,
        vehiculoId: finalVehiculoId,
        clienteTemp: saveCliente ? undefined : pendingData.clienteTemp,
        vehiculoTemp: saveVehiculo ? undefined : pendingData.vehiculoTemp,
      };

      await createTurno({ ...turnoData, tenantId: currentTenant.id });
      setShowSaveModal(false);
      handleCloseDialog();

      // Mostrar mensaje de recomendación si se guardaron datos
      if (saveCliente || saveVehiculo) {
        setTimeout(() => {
          alert("✅ Turno creado exitosamente.\n\n💡 Recordá completar los datos del cliente y su vehículo en las secciones correspondientes.");
        }, 300);
      }
    } catch (err) {
      console.error("Error al guardar turno:", err);
      alert("❌ Error al crear el turno. Intentá nuevamente.");
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

  const getClienteNombre = (turno: Turno) => {
    if (turno.clienteId) {
      const cliente = clientes.find((c) => c.id === turno.clienteId);
      return cliente ? `${cliente.nombre} ${cliente.apellido}` : "Cliente no encontrado";
    } else if (turno.clienteTemp) {
      return `${turno.clienteTemp.nombre} ${turno.clienteTemp.apellido}`;
    }
    return "Sin cliente";
  };

  const getVehiculoInfo = (turno: Turno) => {
    if (turno.vehiculoId) {
      const vehiculo = vehiculos.find((v) => v.id === turno.vehiculoId);
      return vehiculo ? `${vehiculo.patente} - ${vehiculo.modeloMarca} - ${vehiculo.combustible}` : "Vehículo no encontrado";
    } else if (turno.vehiculoTemp) {
      return `${turno.vehiculoTemp.patente} - ${turno.vehiculoTemp.modeloMarca}`;
    }
    return "Sin vehículo";
  };

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
            <form onSubmit={handleSubmit(handleSubmitClick)} className="space-y-4">
              {/* Cliente Autocomplete */}
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <div className="relative">
                  <Input
                    id="cliente"
                    value={clienteSearchText}
                    onChange={(e) => {
                      setClienteSearchText(e.target.value);
                      setShowClienteSuggestions(true);
                      setSelectedCliente(null);
                      setValue("clienteId", undefined);
                    }}
                    onFocus={() => setShowClienteSuggestions(true)}
                    placeholder="Buscar cliente por nombre..."
                  />
                  {selectedCliente && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => {
                        setSelectedCliente(null);
                        setClienteSearchText("");
                        setValue("clienteId", undefined);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {showClienteSuggestions && clientesFiltrados.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {clientesFiltrados.map((cliente) => (
                        <button
                          key={cliente.id}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors"
                          onClick={() => handleSelectCliente({
                            id: cliente.id,
                            nombre: cliente.nombre,
                            apellido: cliente.apellido
                          })}
                        >
                          <div className="font-medium">{cliente.nombre} {cliente.apellido}</div>
                          {cliente.telefono && (
                            <div className="text-sm text-muted-foreground">{cliente.telefono}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {!selectedCliente && clienteSearchText && (
                  <p className="text-xs text-muted-foreground">
                    Cliente temporal: se creará como "{clienteSearchText}"
                  </p>
                )}
                {errors.clienteId && (
                  <p className="text-sm text-destructive">{errors.clienteId.message}</p>
                )}
              </div>

              {/* Vehículo Autocomplete */}
              <div className="space-y-2">
                <Label htmlFor="vehiculo">Vehículo *</Label>
                <div className="relative">
                  <Input
                    id="vehiculo"
                    value={vehiculoSearchText}
                    onChange={(e) => {
                      setVehiculoSearchText(e.target.value);
                      setShowVehiculoSuggestions(true);
                      setSelectedVehiculo(null);
                      setValue("vehiculoId", undefined);
                    }}
                    onFocus={() => setShowVehiculoSuggestions(true)}
                    placeholder="Buscar vehículo por patente..."
                  />
                  {selectedVehiculo && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => {
                        setSelectedVehiculo(null);
                        setVehiculoSearchText("");
                        setValue("vehiculoId", undefined);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {showVehiculoSuggestions && vehiculosFiltrados.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {vehiculosFiltrados.map((vehiculo) => (
                        <button
                          key={vehiculo.id}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors"
                          onClick={() => handleSelectVehiculo({
                            id: vehiculo.id,
                            patente: vehiculo.patente,
                            modeloMarca: vehiculo.modeloMarca
                          })}
                        >
                          <div className="font-medium">{vehiculo.patente}</div>
                          <div className="text-sm text-muted-foreground">{vehiculo.modeloMarca}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {!selectedVehiculo && vehiculoSearchText && (
                  <p className="text-xs text-muted-foreground">
                    Vehículo temporal: se creará con patente "{vehiculoSearchText}"
                  </p>
                )}
                {errors.vehiculoId && (
                  <p className="text-sm text-destructive">{errors.vehiculoId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  type="date"
                  {...register("fecha", {
                    valueAsDate: false,
                    setValueAs: (value) => {
                      if (!value) return undefined;
                      // Si ya es un Date, devolverlo directamente
                      if (value instanceof Date) return value;
                      // Si es un string, procesarlo
                      if (typeof value === 'string') {
                        const [year, month, day] = value.split("-").map(Number);
                        return new Date(year, month - 1, day);
                      }
                      return undefined;
                    }
                  })}
                  defaultValue={selectedDate.toISOString().split("T")[0]}
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
                <Select
                  onValueChange={(value) => setValue("estado", value as EstadoTurno)}
                  defaultValue={EstadoTurno.PENDIENTE}
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

      {/* Modal de confirmación para guardar datos temporales */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guardar Información</DialogTitle>
            <DialogDescription>
              Has ingresado datos temporales. ¿Deseas guardarlos en la base de datos?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {pendingData?.clienteTemp && (
              <div className="p-3 border rounded-md">
                <p className="font-medium mb-1">Cliente temporal:</p>
                <p className="text-sm text-muted-foreground">
                  {pendingData.clienteTemp.nombre} {pendingData.clienteTemp.apellido}
                </p>
              </div>
            )}
            {pendingData?.vehiculoTemp && (
              <div className="p-3 border rounded-md">
                <p className="font-medium mb-1">Vehículo temporal:</p>
                <p className="text-sm text-muted-foreground">
                  {pendingData.vehiculoTemp.patente}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => createTurnoAndSave(false, false)}
              disabled={isSubmitting}
            >
              Usar solo esta vez
            </Button>
            <Button
              type="button"
              onClick={() => createTurnoAndSave(true, true)}
              disabled={isSubmitting}
            >
              Guardar en la base de datos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                        <span className="truncate">{getClienteNombre(turno)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CarIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{getVehiculoInfo(turno)}</span>
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
