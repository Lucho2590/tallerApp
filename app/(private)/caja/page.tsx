"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Pencil,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  Filter,
} from "lucide-react";
import { useCaja } from "@/hooks/caja/useCaja";
import { useTenant } from "@/contexts/TenantContext";
import { movimientoCajaSchema, type MovimientoCajaFormData } from "@/lib/validations/movimientoCaja";
import { MovimientoCaja, TipoPago, TenantModule } from "@/types";
import { ModuleGuard } from "@/components/guards/ModuleGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const METODOS_PAGO_LABELS = {
  [TipoPago.EFECTIVO]: "Efectivo",
  [TipoPago.TARJETA]: "Tarjeta",
  [TipoPago.TRANSFERENCIA]: "Transferencia",
  [TipoPago.OTRO]: "Otro",
};

export default function CajaPage() {
  const { currentTenant } = useTenant();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const { movimientos, loading, error, totales, createMovimiento, updateMovimiento, deleteMovimiento } = useCaja(
    startDate,
    endDate
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMovimiento, setEditingMovimiento] = useState<MovimientoCaja | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterTipo, setFilterTipo] = useState<"all" | "ingreso" | "egreso">("all");

  const form = useForm<MovimientoCajaFormData>({
    resolver: zodResolver(movimientoCajaSchema),
    defaultValues: {
      tipo: "ingreso",
      monto: 0,
      concepto: "",
      metodoPago: TipoPago.EFECTIVO,
      trabajoId: "",
      fecha: new Date(),
      notas: "",
    },
  });

  // Filtrar movimientos por tipo
  const movimientosFiltrados = useMemo(() => {
    if (filterTipo === "all") return movimientos;
    return movimientos.filter((m) => m.tipo === filterTipo);
  }, [movimientos, filterTipo]);

  const handleOpenDialog = (movimiento?: MovimientoCaja) => {
    if (movimiento) {
      setEditingMovimiento(movimiento);
      form.reset({
        tipo: movimiento.tipo,
        monto: movimiento.monto,
        concepto: movimiento.concepto,
        metodoPago: movimiento.metodoPago,
        trabajoId: movimiento.trabajoId || "",
        fecha: movimiento.fecha,
        notas: movimiento.notas || "",
      });
    } else {
      setEditingMovimiento(null);
      form.reset({
        tipo: "ingreso",
        monto: 0,
        concepto: "",
        metodoPago: TipoPago.EFECTIVO,
        trabajoId: "",
        fecha: new Date(),
        notas: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMovimiento(null);
    form.reset();
  };

  const onSubmit = async (data: MovimientoCajaFormData) => {
    if (!currentTenant) {
      console.error("No hay tenant seleccionado");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingMovimiento) {
        await updateMovimiento(editingMovimiento.id, data);
      } else {
        await createMovimiento({
          ...data,
          tenantId: currentTenant.id,
        });
      }
      handleCloseDialog();
    } catch (err) {
      console.error("Error al guardar movimiento:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este movimiento?")) {
      try {
        await deleteMovimiento(id);
      } catch (err) {
        console.error("Error al eliminar movimiento:", err);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy", { locale: es });
  };

  const clearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando movimientos...</p>
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
    // MVP: ModuleGuard deshabilitado - Todos los módulos disponibles
    // <ModuleGuard module={TenantModule.INVOICING}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Caja</h1>
              <p className="text-muted-foreground">
                Gestiona ingresos y egresos del taller
              </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Movimiento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMovimiento ? "Editar Movimiento" : "Nuevo Movimiento"}
              </DialogTitle>
              <DialogDescription>
                {editingMovimiento
                  ? "Modifica los datos del movimiento"
                  : "Registra un ingreso o egreso de caja"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Movimiento *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ingreso">Ingreso</SelectItem>
                            <SelectItem value="egreso">Egreso</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="concepto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concepto *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Cobro de trabajo #123"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="metodoPago"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de Pago *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(METODOS_PAGO_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
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
                    name="fecha"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  formatDate(field.value)
                                ) : (
                                  <span>Seleccionar fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notas adicionales..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Guardando..."
                      : editingMovimiento
                      ? "Actualizar"
                      : "Registrar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumen de Caja */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totales.ingresos)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egresos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totales.egresos)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                totales.balance >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {formatCurrency(totales.balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtros:</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant={filterTipo === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterTipo("all")}
          >
            Todos
          </Button>
          <Button
            variant={filterTipo === "ingreso" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterTipo("ingreso")}
          >
            Ingresos
          </Button>
          <Button
            variant={filterTipo === "egreso" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterTipo("egreso")}
          >
            Egresos
          </Button>
        </div>

        <div className="flex gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? formatDate(startDate) : "Desde"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? formatDate(endDate) : "Hasta"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {(startDate || endDate) && (
            <Button variant="ghost" size="sm" onClick={clearDateFilter}>
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Tabla de movimientos */}
      {movimientosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No hay movimientos registrados
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Comienza registrando tu primer movimiento de caja
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Movimiento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientosFiltrados.map((movimiento) => (
                <TableRow key={movimiento.id}>
                  <TableCell>{formatDate(movimiento.fecha)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={movimiento.tipo === "ingreso" ? "default" : "secondary"}
                      className={
                        movimiento.tipo === "ingreso"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {movimiento.tipo === "ingreso" ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {movimiento.tipo === "ingreso" ? "Ingreso" : "Egreso"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{movimiento.concepto}</p>
                      {movimiento.notas && (
                        <p className="text-xs text-muted-foreground">
                          {movimiento.notas}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {METODOS_PAGO_LABELS[movimiento.metodoPago]}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold",
                      movimiento.tipo === "ingreso"
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {movimiento.tipo === "ingreso" ? "+" : "-"}
                    {formatCurrency(movimiento.monto)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(movimiento)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(movimiento.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      </div>
    // </ModuleGuard>
  );
}
