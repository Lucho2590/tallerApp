"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Wrench,
  ArrowLeft,
  Plus,
  Calculator,
  Loader2,
  UserPlus,
  Car,
  ChevronDown,
} from "lucide-react";
import { useTrabajos } from "@/hooks/trabajos/useTrabajos";
import { useClientes } from "@/hooks/clientes/useClientes";
import { useVehiculos } from "@/hooks/vehiculos/useVehiculos";
import { useProductos } from "@/hooks/productos/useProductos";
import { useTenant } from "@/contexts/TenantContext";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function NuevoTrabajoPage() {
  const router = useRouter();
  const { currentTenant } = useTenant();
  const { createTrabajo, generarNumeroOrden } = useTrabajos();
  const { clientes } = useClientes();
  const { vehiculos } = useVehiculos();
  const { productos } = useProductos();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [descripcionProducto, setDescripcionProducto] = useState("");
  const [cantidadProducto, setCantidadProducto] = useState<number>(1);
  const [precioUnitarioProducto, setPrecioUnitarioProducto] = useState<number>(0);
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<string | null>(null);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Estados para cliente/vehículo nuevo
  const [clienteMode, setClienteMode] = useState<"existente" | "nuevo">("existente");
  const [vehiculoMode, setVehiculoMode] = useState<"existente" | "nuevo">("existente");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [pendingData, setPendingData] = useState<TrabajoFormData | null>(null);

  const [totalesCalculados, setTotalesCalculados] = useState({
    subtotal: 0,
    montoDescuento: 0,
    montoImpuestos: 0,
    total: 0,
  });

  const form = useForm<TrabajoFormData>({
    resolver: zodResolver(trabajoSchema),
    defaultValues: {
      clienteId: undefined,
      clienteTemp: undefined,
      vehiculoId: undefined,
      vehiculoTemp: undefined,
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

  // Filtrar productos según búsqueda
  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(descripcionProducto.toLowerCase()) ||
    (p.descripcion && p.descripcion.toLowerCase().includes(descripcionProducto.toLowerCase())) ||
    (p.codigo && p.codigo.toLowerCase().includes(descripcionProducto.toLowerCase()))
  );

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMostrarSugerencias(false);
      }
    };

    if (mostrarSugerencias) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mostrarSugerencias]);

  // Seleccionar un producto de las sugerencias
  const seleccionarProducto = (productoId: string) => {
    const producto = productos.find(p => p.id === productoId);
    if (producto) {
      setDescripcionProducto(producto.nombre);
      setPrecioUnitarioProducto(producto.precio);
      setProductoSeleccionadoId(producto.id);
      setMostrarSugerencias(false);
    }
  };

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
      const nuevoItem: any = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        descripcion: descripcionProducto,
        cantidad: cantidadProducto,
        precioUnitario: precioUnitarioProducto,
        subtotal: cantidadProducto * precioUnitarioProducto,
      };

      // Si se seleccionó un producto del inventario, guardar su ID
      if (productoSeleccionadoId) {
        nuevoItem.productoId = productoSeleccionadoId;
      }

      append(nuevoItem);

      // Limpiar campos
      setDescripcionProducto("");
      setCantidadProducto(1);
      setPrecioUnitarioProducto(0);
      setProductoSeleccionadoId(null);
      setMostrarSugerencias(false);
    }
  };

  // Mostrar modal de confirmación si hay datos temporales
  const handleSubmitClick = async (data: TrabajoFormData) => {
    // Si hay datos temporales, mostrar modal de confirmación
    if (data.clienteTemp || data.vehiculoTemp) {
      setPendingData(data);
      setShowSaveModal(true);
    } else {
      // Si no hay datos temporales, crear directamente
      await createTrabajoDirectly(data);
    }
  };

  // Crear trabajo directamente (sin guardar cliente/vehículo)
  const createTrabajoDirectly = async (data: TrabajoFormData) => {
    // 🏢 VALIDAR QUE HAYA TENANT
    if (!currentTenant) {
      alert("Error: No hay un taller seleccionado");
      return;
    }

    setIsSubmitting(true);
    try {
      const numeroOrden = generarNumeroOrden();

      const trabajoData: any = {
        tenantId: currentTenant.id,
        numero: numeroOrden,
        clienteId: data.clienteId,
        vehiculoId: data.vehiculoId,
        clienteTemp: data.clienteTemp,
        vehiculoTemp: data.vehiculoTemp,
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
      setShowSaveModal(false);
      setPendingData(null);
    }
  };

  // Crear trabajo y guardar cliente/vehículo si el usuario lo solicita
  const createTrabajoAndSave = async (saveCliente: boolean, saveVehiculo: boolean) => {
    if (!pendingData || !currentTenant) return;

    setIsSubmitting(true);
    try {
      const numeroOrden = generarNumeroOrden();
      let finalClienteId = pendingData.clienteId;
      let finalVehiculoId = pendingData.vehiculoId;

      //Guardar cliente si se solicita
      if (saveCliente && pendingData.clienteTemp) {
        const { clientesService } = await import("@/services/clientes/clientesService");
        const clienteData: any = {
          tenantId: currentTenant.id,
          nombre: pendingData.clienteTemp.nombre,
          apellido: pendingData.clienteTemp.apellido,
          telefono: pendingData.clienteTemp.telefono || "",
          email: pendingData.clienteTemp.email || "",
        };
        finalClienteId = await clientesService.create(clienteData);
      }

      // Guardar vehículo si se solicita
      if (saveVehiculo && pendingData.vehiculoTemp) {
        const { vehiculosService } = await import("@/services/vehiculos/vehiculosService");
        const vehiculoData: any = {
          tenantId: currentTenant.id,
          clienteId: finalClienteId || "",
          patente: pendingData.vehiculoTemp.patente,
          modeloMarca: pendingData.vehiculoTemp.modeloMarca,
        };
        finalVehiculoId = await vehiculosService.create(vehiculoData);
      }

      // Crear trabajo
      const trabajoData: any = {
        tenantId: currentTenant.id,
        numero: numeroOrden,
        clienteId: finalClienteId,
        vehiculoId: finalVehiculoId,
        estado: EstadoTrabajo.PENDIENTE,
        items: pendingData.items,
        subtotal: totalesCalculados.subtotal,
        impuestos: totalesCalculados.montoImpuestos,
        total: totalesCalculados.total,
        aplicarIVA: pendingData.aplicarIVA,
        prioridad: pendingData.prioridad,
      };

      // Guardar datos temporales solo si NO se guardaron
      if (!saveCliente && pendingData.clienteTemp) {
        trabajoData.clienteTemp = pendingData.clienteTemp;
      }
      if (!saveVehiculo && pendingData.vehiculoTemp) {
        trabajoData.vehiculoTemp = pendingData.vehiculoTemp;
      }

      // Agregar campos opcionales
      if (pendingData.descripcionGeneral && pendingData.descripcionGeneral.trim()) {
        trabajoData.descripcionGeneral = pendingData.descripcionGeneral;
      }
      if (pendingData.descuento && pendingData.descuento > 0) {
        trabajoData.descuento = pendingData.descuento;
      }
      if (pendingData.manoDeObra && pendingData.manoDeObra > 0) {
        trabajoData.manoDeObra = pendingData.manoDeObra;
      }
      if (pendingData.tecnicoAsignado && pendingData.tecnicoAsignado.trim()) {
        trabajoData.tecnicoAsignado = pendingData.tecnicoAsignado;
      }
      if (pendingData.observacionesTrabajo && pendingData.observacionesTrabajo.trim()) {
        trabajoData.observacionesTrabajo = pendingData.observacionesTrabajo;
      }

      await createTrabajo(trabajoData);
      router.push("/trabajos");
    } catch (error) {
      console.error("Error al crear trabajo:", error);
      alert("Error al crear el trabajo. Por favor intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
      setShowSaveModal(false);
      setPendingData(null);
    }
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  // Validar tenant antes de renderizar
  if (!currentTenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Wrench className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">No hay organización seleccionada</h3>
            <p className="text-muted-foreground">
              Por favor, completa el proceso de onboarding o selecciona una organización.
            </p>
          </div>
          <Button onClick={() => window.location.href = "/onboarding"}>
            Ir a Onboarding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* MVP: Banner de advertencia de límite deshabilitado */}
      {/* {jobsLimit.isNearLimit && !jobsLimit.isAtLimit && (
        <ResourceLimitBanner
          resourceName="trabajos mensuales"
          current={jobsLimit.current}
          max={jobsLimit.max}
          percentage={jobsLimit.percentage}
        />
      )} */}

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
          <form onSubmit={form.handleSubmit(handleSubmitClick)} className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Información Básica</h4>

              {/* CLIENTE */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Cliente *</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={clienteMode === "existente" ? "default" : "outline"}
                      onClick={() => {
                        setClienteMode("existente");
                        form.setValue("clienteTemp", undefined);
                      }}
                    >
                      Existente
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={clienteMode === "nuevo" ? "default" : "outline"}
                      onClick={() => {
                        setClienteMode("nuevo");
                        form.setValue("clienteId", undefined);
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Nuevo
                    </Button>
                  </div>
                </div>

                {clienteMode === "existente" ? (
                  <FormField
                    control={form.control}
                    name="clienteId"
                    render={({ field }) => (
                      <FormItem>
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
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="clienteTemp.nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Nombre *" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clienteTemp.apellido"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Apellido *" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clienteTemp.telefono"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Teléfono" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clienteTemp.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* VEHÍCULO */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Vehículo *</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={vehiculoMode === "existente" ? "default" : "outline"}
                      onClick={() => {
                        setVehiculoMode("existente");
                        form.setValue("vehiculoTemp", undefined);
                      }}
                    >
                      Existente
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={vehiculoMode === "nuevo" ? "default" : "outline"}
                      onClick={() => {
                        setVehiculoMode("nuevo");
                        form.setValue("vehiculoId", undefined);
                      }}
                    >
                      <Car className="h-4 w-4 mr-1" />
                      Nuevo
                    </Button>
                  </div>
                </div>

                {vehiculoMode === "existente" ? (
                  <FormField
                    control={form.control}
                    name="vehiculoId"
                    render={({ field }) => (
                      <FormItem>
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
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="vehiculoTemp.patente"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Patente *" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vehiculoTemp.modeloMarca"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Modelo/Marca *" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
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
                {/* <FormField
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
                /> */}

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
                  <div className="relative" ref={dropdownRef}>
                    <Input
                      placeholder="Buscar producto o escribir descripción..."
                      value={descripcionProducto}
                      onChange={(e) => {
                        setDescripcionProducto(e.target.value);
                        setMostrarSugerencias(e.target.value.length > 0);
                        setProductoSeleccionadoId(null); // Reset al escribir
                      }}
                      onFocus={() => setMostrarSugerencias(descripcionProducto.length > 0)}
                    />

                    {/* Dropdown de sugerencias */}
                    {mostrarSugerencias && productosFiltrados.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {productosFiltrados.slice(0, 10).map((producto) => (
                          <button
                            key={producto.id}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-accent transition-colors border-b last:border-b-0"
                            onClick={() => seleccionarProducto(producto.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{producto.nombre}</p>
                                {producto.descripcion && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {producto.descripcion}
                                  </p>
                                )}
                                {producto.codigo && (
                                  <p className="text-xs text-muted-foreground">
                                    Código: {producto.codigo}
                                  </p>
                                )}
                              </div>
                              <div className="ml-2 text-right">
                                <p className="text-sm font-medium text-primary">
                                  ${producto.precio.toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Stock: {producto.stock}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

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

      {/* Modal de confirmación para guardar cliente/vehículo */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Guardar Cliente y Vehículo</DialogTitle>
            <DialogDescription>
              Has ingresado datos de un cliente y/o vehículo nuevo. ¿Querés guardarlos en tu base de datos para futuros trabajos?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {pendingData?.clienteTemp && (
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-2">Cliente Nuevo:</p>
                <p className="text-sm text-muted-foreground">
                  {pendingData.clienteTemp.nombre} {pendingData.clienteTemp.apellido}
                  {pendingData.clienteTemp.telefono && ` - ${pendingData.clienteTemp.telefono}`}
                </p>
              </div>
            )}

            {pendingData?.vehiculoTemp && (
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-2">Vehículo Nuevo:</p>
                <p className="text-sm text-muted-foreground">
                  {pendingData.vehiculoTemp.patente} - {pendingData.vehiculoTemp.modeloMarca}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => createTrabajoDirectly(pendingData!)}
              disabled={isSubmitting}
            >
              Solo esta vez
            </Button>
            <Button
              type="button"
              onClick={() => createTrabajoAndSave(
                !!pendingData?.clienteTemp,
                !!pendingData?.vehiculoTemp
              )}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar y Crear Orden"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
