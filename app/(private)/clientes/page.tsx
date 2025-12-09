"use client";

import { useState, useMemo, Fragment } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronRight,
  Car,
  Search,
  Users,
} from "lucide-react";
import { useClientes } from "@/hooks/clientes/useClientes";
import { useVehiculos } from "@/hooks/vehiculos/useVehiculos";
import { useTenant } from "@/contexts/TenantContext";
import { clienteSchema, type ClienteFormData } from "@/lib/validations/cliente";
import { Cliente } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function ClientesPage() {
  const { currentTenant } = useTenant(); // 🏢 OBTENER TENANT ACTUAL
  const { clientes, loading, error, createCliente, updateCliente, deleteCliente } = useClientes();
  const { vehiculos } = useVehiculos();
  // MVP: Límites de recursos deshabilitados
  // const { clients: clientsLimit, loading: limitsLoading, refresh: refreshLimits } = useResourceLimits();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  // const [showLimitModal, setShowLimitModal] = useState(false);

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
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
    },
  });

  // Filtrar clientes por búsqueda global
  const clientesFiltrados = useMemo(() => {
    if (!searchTerm) return clientes;

    const searchLower = searchTerm.toLowerCase();
    return clientes.filter((cliente) => {
      return (
        cliente.nombre.toLowerCase().includes(searchLower) ||
        cliente.apellido.toLowerCase().includes(searchLower) ||
        cliente.telefono.includes(searchTerm) ||
        cliente.email?.toLowerCase().includes(searchLower) ||
        cliente.cuit?.toLowerCase().includes(searchLower) ||
        cliente.direccion?.toLowerCase().includes(searchLower) ||
        cliente.ciudad?.toLowerCase().includes(searchLower) ||
        cliente.profesion?.toLowerCase().includes(searchLower) ||
        cliente.notas?.toLowerCase().includes(searchLower) ||
        cliente.observaciones?.toLowerCase().includes(searchLower)
      );
    });
  }, [clientes, searchTerm]);

  const handleOpenDialog = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente);
      form.reset({
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
      form.reset({
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
    form.reset();
  };

  const onSubmit = async (data: ClienteFormData) => {
    if (!currentTenant) {
      console.error("No hay tenant seleccionado");
      return;
    }

    // MVP: Validación de límites deshabilitada
    // if (!editingCliente && clientsLimit.isAtLimit) {
    //   setShowLimitModal(true);
    //   return;
    // }

    try {
      setIsSubmitting(true);
      if (editingCliente) {
        await updateCliente(editingCliente.id, data);
      } else {
        // 🏢 INCLUIR TENANT ID AL CREAR
        await createCliente({
          ...data,
          tenantId: currentTenant.id,
        });
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

  // Mostrar loading mientras se carga
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

  // Validar que haya un tenant seleccionado
  if (!currentTenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Users className="h-16 w-16 text-muted-foreground mx-auto" />
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* MVP: Resource Limit Banner deshabilitado */}
      {/* {clientsLimit.isNearLimit && !clientsLimit.isAtLimit && (
        <ResourceLimitBanner
          resourceName="clientes"
          current={clientsLimit.current}
          max={clientsLimit.max}
          percentage={clientsLimit.percentage}
        />
      )} */}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Administra tu base de datos de clientes
            </p>
          </div>
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
                  ? "Modifica los datos del cliente"
                  : "Completa los datos del nuevo cliente. Los campos marcados con (*) son obligatorios."}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre *</FormLabel>
                        <FormControl>
                          <Input placeholder="Juan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apellido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido *</FormLabel>
                        <FormControl>
                          <Input placeholder="Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono/Móvil *</FormLabel>
                        <FormControl>
                          <Input placeholder="+54 9 223 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="cliente@email.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cuit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CUIT</FormLabel>
                        <FormControl>
                          <Input placeholder="20-12345678-9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profesion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profesión</FormLabel>
                        <FormControl>
                          <Input placeholder="Profesión u oficio" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="direccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input placeholder="Calle 123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ciudad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input placeholder="Mar del Plata" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Información adicional del cliente..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observaciones importantes..."
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
                    onClick={handleCloseDialog}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Guardando..."
                      : editingCliente
                      ? "Actualizar"
                      : "Crear Cliente"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, apellido, teléfono, email, CUIT, ciudad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Tabla de clientes */}
      {clientesFiltrados.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              {searchTerm ? (
                <Search className="h-8 w-8 text-muted-foreground" />
              ) : (
                <Users className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm
                ? "No se encontraron clientes"
                : "No hay clientes registrados"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm
                ? "Intenta con otro criterio de búsqueda"
                : "Comienza agregando tu primer cliente"}
            </p>
            {!searchTerm && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Cliente
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Profesión</TableHead>
                <TableHead>Vehículos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesFiltrados.map((cliente) => {
                const clienteVehiculos = getClienteVehiculos(cliente.id);
                const isExpanded = expandedRows.has(cliente.id);

                return (
                  <Fragment key={cliente.id}>
                    {/* Fila principal del cliente */}
                    <TableRow className="hover:bg-muted/30">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRow(cliente.id)}
                          className="h-8 w-8 p-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
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
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {cliente.telefono}
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
                      </TableCell>
                      <TableCell>
                        {cliente.ciudad ? (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{cliente.ciudad}</p>
                              {cliente.direccion && (
                                <p className="text-xs text-muted-foreground">
                                  {cliente.direccion}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {cliente.profesion && (
                          <Badge variant="secondary">{cliente.profesion}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Car className="h-3 w-3 mr-1" />
                          {clienteVehiculos.length}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(cliente)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cliente.id)}
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
                        <TableCell colSpan={7} className="p-0">
                          <div className="bg-muted/20 p-4 border-t">
                            <div className="space-y-4">
                              {/* Notas y Observaciones */}
                              {(cliente.notas || cliente.observaciones) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {cliente.notas && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">
                                        Notas
                                      </h4>
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
                              )}

                              {/* Lista de vehículos */}
                              {clienteVehiculos.length > 0 && (
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium flex items-center gap-2">
                                      <Car className="h-4 w-4" />
                                      Vehículos del Cliente
                                    </h4>
                                    <Badge variant="secondary">
                                      {clienteVehiculos.length} vehículo
                                      {clienteVehiculos.length !== 1 ? "s" : ""}
                                    </Badge>
                                  </div>

                                  <div className="space-y-2">
                                    {clienteVehiculos.map((vehiculo) => (
                                      <div
                                        key={vehiculo.id}
                                        className="bg-card rounded-lg border p-3"
                                      >
                                        <div className="flex items-center gap-3">
                                          <Car className="h-4 w-4 text-primary" />
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium font-mono">
                                                {vehiculo.patente}
                                              </span>
                                              <span className="text-sm text-muted-foreground">
                                                {vehiculo.marca} {vehiculo.modelo}{" "}
                                                {vehiculo.año}
                                              </span>
                                            </div>
                                            {vehiculo.color && (
                                              <p className="text-xs text-muted-foreground mt-1">
                                                Color: {vehiculo.color}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {clienteVehiculos.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                  Este cliente no tiene vehículos registrados
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

    </div>
  );
}
