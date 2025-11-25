"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Wrench,
  ArrowLeft,
  Plus,
  Calculator,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Play,
} from "lucide-react";
import { useTrabajos } from "@/hooks/trabajos/useTrabajos";
import { useClientes } from "@/hooks/clientes/useClientes";
import { useVehiculos } from "@/hooks/vehiculos/useVehiculos";
import { trabajoSchema, type TrabajoFormData } from "@/lib/validations/trabajo";
import { Trabajo, EstadoTrabajo, PrioridadTrabajo } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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

export default function EditarTrabajoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const trabajoId = params.id;

  const { getById, updateTrabajo, cambiarEstado } = useTrabajos();
  const { clientes } = useClientes();
  const { vehiculos } = useVehiculos();

  const [trabajo, setTrabajo] = useState<Trabajo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [descripcionProducto, setDescripcionProducto] = useState("");
  const [cantidadProducto, setCantidadProducto] = useState<number>(1);
  const [precioUnitarioProducto, setPrecioUnitarioProducto] = useState<number>(0);

  const [totalesCalculados, setTotalesCalculados] = useState({
    subtotal: 0,
    montoDescuento: 0,
    montoImpuestos: 0,
    total: 0,
  });

  const form = useForm<TrabajoFormData>({
    resolver: zodResolver(trabajoSchema),
    defaultValues: {
      clienteId: "",
      vehiculoId: "",
      descripcionGeneral: "",
      descuento: 0,
      manoDeObra: 0,
      aplicarIVA: false,
      items: [],
      tecnicoAsignado: "",
      prioridad: PrioridadTrabajo.MEDIA,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const watchedDescuento = form.watch("descuento");
  const watchedManoDeObra = form.watch("manoDeObra");
  const watchedAplicarIVA = form.watch("aplicarIVA");

  // Cargar trabajo
  useEffect(() => {
    const cargarTrabajo = async () => {
      if (!trabajoId) {
        setError("ID de trabajo no válido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const trabajoData = await getById(trabajoId);

        if (!trabajoData) {
          setError("Trabajo no encontrado");
          setLoading(false);
          return;
        }

        setTrabajo(trabajoData);

        // Cargar datos en el formulario
        form.reset({
          clienteId: trabajoData.clienteId,
          vehiculoId: trabajoData.vehiculoId,
          descripcionGeneral: trabajoData.descripcionGeneral || "",
          descuento: trabajoData.descuento || 0,
          manoDeObra: trabajoData.manoDeObra || 0,
          aplicarIVA: trabajoData.aplicarIVA || false,
          items: trabajoData.items.map((item) => ({
            id: item.id,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.subtotal,
          })),
          tecnicoAsignado: trabajoData.tecnicoAsignado || "",
          prioridad: trabajoData.prioridad || PrioridadTrabajo.MEDIA,
          observacionesTrabajo: trabajoData.observacionesTrabajo || "",
        });

        setLoading(false);
      } catch (err) {
        console.error("Error al cargar trabajo:", err);
        setError("Error al cargar el trabajo");
        setLoading(false);
      }
    };

    cargarTrabajo();
  }, [trabajoId, getById, form]);

  // Calcular totales
  useEffect(() => {
    const items = watchedItems || [];
    const subtotalProductos = items.reduce(
      (sum, item) =>
        sum + (Number(item.cantidad) || 0) * (Number(item.precioUnitario) || 0),
      0
    );
    const manoDeObra = Number(watchedManoDeObra) || 0;
    const subtotal = subtotalProductos + manoDeObra;
    const descuentoPorcentaje = Number(watchedDescuento) || 0;
    const impuestosPorcentaje = watchedAplicarIVA ? 21 : 0;

    const montoDescuento = subtotal * (descuentoPorcentaje / 100);
    const baseImponible = subtotal - montoDescuento;
    const montoImpuestos = baseImponible * (impuestosPorcentaje / 100);
    const total = baseImponible + montoImpuestos;

    setTotalesCalculados({
      subtotal,
      montoDescuento,
      montoImpuestos,
      total,
    });
  }, [watchedItems, watchedDescuento, watchedManoDeObra, watchedAplicarIVA]);

  // Agregar producto
  const agregarProducto = () => {
    if (descripcionProducto.trim() && precioUnitarioProducto > 0 && cantidadProducto > 0) {
      const nuevoItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        descripcion: descripcionProducto,
        cantidad: cantidadProducto,
        precioUnitario: precioUnitarioProducto,
        subtotal: cantidadProducto * precioUnitarioProducto,
      };

      append(nuevoItem);

      // Limpiar campos
      setDescripcionProducto("");
      setCantidadProducto(1);
      setPrecioUnitarioProducto(0);
    }
  };

  // Cambiar estado del trabajo
  const handleCambiarEstado = async (nuevoEstado: EstadoTrabajo) => {
    if (!trabajo) return;

    if (
      confirm(
        `¿Estás seguro de que deseas cambiar el estado a "${nuevoEstado}"?`
      )
    ) {
      try {
        await cambiarEstado(trabajo.id, nuevoEstado);
        // Recargar trabajo
        const trabajoActualizado = await getById(trabajoId);
        if (trabajoActualizado) {
          setTrabajo(trabajoActualizado);
        }
      } catch (err) {
        console.error("Error al cambiar estado:", err);
        alert("Error al cambiar el estado del trabajo");
      }
    }
  };

  // Guardar cambios
  const onSubmit = async (data: TrabajoFormData) => {
    if (!trabajo) return;

    setIsSubmitting(true);
    try {
      const trabajoData = {
        clienteId: data.clienteId,
        vehiculoId: data.vehiculoId,
        descripcionGeneral: data.descripcionGeneral || undefined,
        items: data.items,
        subtotal: totalesCalculados.subtotal,
        descuento: data.descuento || undefined,
        impuestos: totalesCalculados.montoImpuestos,
        total: totalesCalculados.total,
        manoDeObra: data.manoDeObra || undefined,
        aplicarIVA: data.aplicarIVA,
        prioridad: data.prioridad as PrioridadTrabajo,
        tecnicoAsignado: data.tecnicoAsignado || undefined,
        observacionesTrabajo: data.observacionesTrabajo || undefined,
      };

      await updateTrabajo(trabajo.id, trabajoData);
      router.push("/trabajos");
    } catch (error) {
      console.error("Error al actualizar trabajo:", error);
      alert("Error al actualizar el trabajo. Por favor intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  // Obtener nombre del cliente
  const getNombreCliente = (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente) return "Cliente no encontrado";
    return `${cliente.nombre} ${cliente.apellido}`;
  };

  // Obtener vehículo
  const getVehiculo = (vehiculoId: string) => {
    return vehiculos.find((v) => v.id === vehiculoId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando trabajo...</p>
        </div>
      </div>
    );
  }

  if (error || !trabajo) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push("/trabajos")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Trabajos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Wrench className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Editar Orden {trabajo.numero}
            </h1>
            <p className="text-muted-foreground">
              Modifica los datos de la orden de trabajo
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg border p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información de la orden (readonly) */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Información de la Orden</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <label className="text-sm font-medium text-gray-600">
                    Cliente:
                  </label>
                  <p className="text-sm">{getNombreCliente(trabajo.clienteId)}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <label className="text-sm font-medium text-gray-600">
                    Vehículo:
                  </label>
                  <p className="text-sm">
                    {trabajo.vehiculoId
                      ? getVehiculo(trabajo.vehiculoId)?.patente || "No encontrado"
                      : "Sin vehículo"}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <label className="text-sm font-medium text-gray-600">
                    Estado:
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <EstadoBadge estado={trabajo.estado} />
                  </div>
                </div>
              </div>

              {/* Cambiar estado */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Cambiar Estado:</label>
                <Select
                  value={trabajo.estado}
                  onValueChange={(value) =>
                    handleCambiarEstado(value as EstadoTrabajo)
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EstadoTrabajo.PENDIENTE}>
                      Pendiente
                    </SelectItem>
                    <SelectItem value={EstadoTrabajo.EN_PROGRESO}>
                      En Progreso
                    </SelectItem>
                    <SelectItem value={EstadoTrabajo.COMPLETADO}>
                      Completado
                    </SelectItem>
                    <SelectItem value={EstadoTrabajo.CANCELADO}>
                      Cancelado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <FormField
                control={form.control}
                name="descripcionGeneral"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción General</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción del trabajo..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tecnicoAsignado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Técnico Asignado</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del técnico..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prioridad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={PrioridadTrabajo.BAJA}>
                            Baja
                          </SelectItem>
                          <SelectItem value={PrioridadTrabajo.MEDIA}>
                            Media
                          </SelectItem>
                          <SelectItem value={PrioridadTrabajo.ALTA}>
                            Alta
                          </SelectItem>
                          <SelectItem value={PrioridadTrabajo.URGENTE}>
                            Urgente
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Productos/Servicios */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Productos/Servicios</h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel izquierdo: Agregar producto */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Agregar Producto/Servicio:
                  </label>
                  <Input
                    placeholder="Descripción del producto/servicio..."
                    value={descripcionProducto}
                    onChange={(e) => setDescripcionProducto(e.target.value)}
                  />

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-xs text-gray-600 w-8">Cant:</label>
                      <Input
                        type="number"
                        placeholder="1"
                        min="1"
                        step="1"
                        value={cantidadProducto === 0 ? "" : cantidadProducto}
                        onChange={(e) =>
                          setCantidadProducto(Number(e.target.value) || 0)
                        }
                        className="w-16"
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-xs text-gray-600 w-8">$:</label>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        step="0.01"
                        value={
                          precioUnitarioProducto === 0
                            ? ""
                            : precioUnitarioProducto
                        }
                        onChange={(e) =>
                          setPrecioUnitarioProducto(Number(e.target.value) || 0)
                        }
                        className="w-24"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Total: $
                        {(cantidadProducto * precioUnitarioProducto).toFixed(2)}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={agregarProducto}
                        disabled={
                          !descripcionProducto.trim() ||
                          precioUnitarioProducto <= 0
                        }
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Panel derecho: Lista de productos */}
                <div className="space-y-4">
                  <h5 className="text-sm font-medium">
                    Productos/Servicios Agregados:
                  </h5>

                  <div className="border border-green-400 bg-green-50 rounded p-4 min-h-40 max-h-60 overflow-y-auto">
                    {fields.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No hay productos agregados</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {fields.map((field, index) => {
                          const cantidad = form.watch(`items.${index}.cantidad`) || 0;
                          const descripcion =
                            form.watch(`items.${index}.descripcion`) || "";
                          const precioUnitario =
                            form.watch(`items.${index}.precioUnitario`) || 0;
                          const subtotal = cantidad * precioUnitario;

                          return (
                            <div
                              key={field.id}
                              className="flex items-start justify-between text-sm gap-2"
                            >
                              <span className="flex-1">
                                ({cantidad.toFixed(2)}) {descripcion} - St{" "}
                                {formatCurrency(subtotal)}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                                className="text-red-600 hover:text-red-700 h-6 w-6 p-0 flex-shrink-0"
                              >
                                ×
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        while (fields.length > 0) {
                          remove(0);
                        }
                      }}
                      disabled={fields.length === 0}
                    >
                      Borrar Todo
                    </Button>

                    <div className="font-medium">
                      SubTotal:{" "}
                      {formatCurrency(
                        fields.reduce((total, _, index) => {
                          const cantidad =
                            form.watch(`items.${index}.cantidad`) || 0;
                          const precio =
                            form.watch(`items.${index}.precioUnitario`) || 0;
                          return total + cantidad * precio;
                        }, 0)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Totales y configuración */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Configuración</h4>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="descuento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descuento (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="manoDeObra"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mano de Obra</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? 0
                                  : parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="aplicarIVA"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormLabel>Aplicar IVA (21%)</FormLabel>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="h-4 w-4 text-primary focus:ring-primary"
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="observacionesTrabajo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observaciones del trabajo..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Resumen de Totales
                </h4>

                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Subtotal Productos:</span>
                    <span className="font-mono">
                      {formatCurrency(
                        (watchedItems || []).reduce((total, _, index) => {
                          const cantidad =
                            form.watch(`items.${index}.cantidad`) || 0;
                          const precio =
                            form.watch(`items.${index}.precioUnitario`) || 0;
                          return total + cantidad * precio;
                        }, 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mano de Obra:</span>
                    <span className="font-mono">
                      {formatCurrency(Number(watchedManoDeObra) || 0)}
                    </span>
                  </div>

                  {totalesCalculados.montoDescuento > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="text-sm">Descuento:</span>
                      <span className="font-mono">
                        -{formatCurrency(totalesCalculados.montoDescuento)}
                      </span>
                    </div>
                  )}

                  {totalesCalculados.montoImpuestos > 0 && (
                    <div className="flex justify-between">
                      <span>Impuestos (IVA 21%):</span>
                      <span className="font-mono">
                        {formatCurrency(totalesCalculados.montoImpuestos)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="font-mono">
                      {formatCurrency(totalesCalculados.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/trabajos")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
