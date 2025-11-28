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
} from "lucide-react";
import { useTrabajos } from "@/hooks/trabajos/useTrabajos";
import { useClientes } from "@/hooks/clientes/useClientes";
import { useVehiculos } from "@/hooks/vehiculos/useVehiculos";
import { trabajoSchema, type TrabajoFormData } from "@/lib/validations/trabajo";
import { TrabajoItem, PrioridadTrabajo, EstadoTrabajo } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export default function NuevoTrabajoPage() {
  const router = useRouter();
  const { createTrabajo, generarNumeroOrden } = useTrabajos();
  const { clientes } = useClientes();
  const { vehiculos } = useVehiculos();

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
  const watchedClienteId = form.watch("clienteId");

  // Filtrar vehículos por cliente seleccionado
  const vehiculosFiltrados = vehiculos.filter(
    (v) => !watchedClienteId || v.clienteId === watchedClienteId
  );

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

  // Guardar trabajo
  const onSubmit = async (data: TrabajoFormData) => {
    setIsSubmitting(true);
    try {
      const numeroOrden = generarNumeroOrden();

      const trabajoData: any = {
        numero: numeroOrden,
        clienteId: data.clienteId,
        vehiculoId: data.vehiculoId,
        estado: EstadoTrabajo.PENDIENTE,
        items: data.items,
        subtotal: totalesCalculados.subtotal,
        impuestos: totalesCalculados.montoImpuestos,
        total: totalesCalculados.total,
        aplicarIVA: data.aplicarIVA,
        prioridad: data.prioridad,
      };

      // Solo agregar campos opcionales si tienen valor
      if (data.descripcionGeneral && data.descripcionGeneral.trim()) {
        trabajoData.descripcionGeneral = data.descripcionGeneral;
      }
      if (data.descuento && data.descuento > 0) {
        trabajoData.descuento = data.descuento;
      }
      if (data.manoDeObra && data.manoDeObra > 0) {
        trabajoData.manoDeObra = data.manoDeObra;
      }
      if (data.tecnicoAsignado && data.tecnicoAsignado.trim()) {
        trabajoData.tecnicoAsignado = data.tecnicoAsignado;
      }
      if (data.observacionesTrabajo && data.observacionesTrabajo.trim()) {
        trabajoData.observacionesTrabajo = data.observacionesTrabajo;
      }

      await createTrabajo(trabajoData);
      router.push("/trabajos");
    } catch (error) {
      console.error("Error al crear trabajo:", error);
      alert("Error al crear el trabajo. Por favor intenta nuevamente.");
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Wrench className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Nueva Orden de Trabajo
            </h1>
            <p className="text-muted-foreground">
              Completa los datos para crear una nueva orden
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-card rounded-lg border p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Información Básica</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                  name="vehiculoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehículo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar vehículo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehiculosFiltrados.map((vehiculo) => (
                            <SelectItem key={vehiculo.id} value={vehiculo.id}>
                              {vehiculo.patente} - {vehiculo.modeloMarca}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="descripcionGeneral"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción General</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción del trabajo a realizar..."
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
                      <FormLabel>Prioridad *</FormLabel>
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
                  <label className="text-sm font-medium">Agregar Producto/Servicio:</label>
                  <Input
                    placeholder="Descripción del producto/servicio..."
                    value={descripcionProducto}
                    onChange={(e) => setDescripcionProducto(e.target.value)}
                  />

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-xs text-muted-foreground w-8">Cant:</label>
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
                      <label className="text-xs text-muted-foreground w-8">$:</label>
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

                  <div className="border rounded p-4 min-h-40 max-h-60 overflow-y-auto bg-muted/30">
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
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Orden de Trabajo"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
