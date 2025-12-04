"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Search,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useProductos } from "@/hooks/productos/useProductos";
import { useTenant } from "@/contexts/TenantContext";
import { productoSchema, type ProductoFormData } from "@/lib/validations/producto";
import { Producto } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const CATEGORIAS = [
  "Repuestos",
  "Aceites y Lubricantes",
  "Filtros",
  "Neumáticos",
  "Baterías",
  "Frenos",
  "Suspensión",
  "Iluminación",
  "Otros",
];

const UNIDADES = ["Unidad", "Litro", "Metro", "Kilo", "Par", "Juego"];

export default function ProductosPage() {
  const { currentTenant } = useTenant();
  const { productos, loading, error, createProducto, updateProducto, deleteProducto } = useProductos();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStockBajo, setFilterStockBajo] = useState(false);
  const [filterActivos, setFilterActivos] = useState(true);

  const form = useForm<ProductoFormData>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
      categoria: "",
      precio: 0,
      precioCompra: 0,
      stock: 0,
      stockMinimo: 0,
      unidad: "Unidad",
      marca: "",
      proveedor: "",
      ubicacion: "",
      activo: true,
    },
  });

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    let filtered = productos;

    // Filtro de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((producto) => {
        return (
          producto.nombre.toLowerCase().includes(searchLower) ||
          producto.codigo?.toLowerCase().includes(searchLower) ||
          producto.categoria?.toLowerCase().includes(searchLower) ||
          producto.marca?.toLowerCase().includes(searchLower) ||
          producto.proveedor?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filtro de activos
    if (filterActivos) {
      filtered = filtered.filter((p) => p.activo);
    }

    // Filtro de stock bajo
    if (filterStockBajo) {
      filtered = filtered.filter((p) => {
        const minimo = p.stockMinimo || 0;
        return p.stock <= minimo;
      });
    }

    return filtered;
  }, [productos, searchTerm, filterStockBajo, filterActivos]);

  const handleOpenDialog = (producto?: Producto) => {
    if (producto) {
      setEditingProducto(producto);
      form.reset({
        codigo: producto.codigo || "",
        nombre: producto.nombre,
        descripcion: producto.descripcion || "",
        categoria: producto.categoria || "",
        precio: producto.precio,
        precioCompra: producto.precioCompra || 0,
        stock: producto.stock,
        stockMinimo: producto.stockMinimo || 0,
        unidad: producto.unidad || "Unidad",
        marca: producto.marca || "",
        proveedor: producto.proveedor || "",
        ubicacion: producto.ubicacion || "",
        activo: producto.activo,
      });
    } else {
      setEditingProducto(null);
      form.reset({
        codigo: "",
        nombre: "",
        descripcion: "",
        categoria: "",
        precio: 0,
        precioCompra: 0,
        stock: 0,
        stockMinimo: 0,
        unidad: "Unidad",
        marca: "",
        proveedor: "",
        ubicacion: "",
        activo: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProducto(null);
    form.reset();
  };

  const onSubmit = async (data: ProductoFormData) => {
    if (!currentTenant) {
      console.error("No hay tenant seleccionado");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingProducto) {
        await updateProducto(editingProducto.id, data);
      } else {
        await createProducto({
          ...data,
          tenantId: currentTenant.id,
        });
      }
      handleCloseDialog();
    } catch (err) {
      console.error("Error al guardar producto:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await deleteProducto(id);
      } catch (err) {
        console.error("Error al eliminar producto:", err);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando productos...</p>
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
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
            <p className="text-muted-foreground">
              Gestiona tu inventario de repuestos y productos
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProducto ? "Editar Producto" : "Nuevo Producto"}
              </DialogTitle>
              <DialogDescription>
                {editingProducto
                  ? "Modifica los datos del producto"
                  : "Completa los datos del nuevo producto. Los campos marcados con (*) son obligatorios."}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Información básica */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="codigo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código/SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: ACEI-10W40-1L" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIAS.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
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
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Producto *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Aceite Motor 10W-40 Sintético" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción detallada del producto..."
                          rows={2}
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
                    name="marca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Castrol" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="proveedor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proveedor</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del proveedor" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Precios y Stock */}
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="precioCompra"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio de Compra</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="precio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio de Venta *</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="unidad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidad</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {UNIDADES.map((unidad) => (
                              <SelectItem key={unidad} value={unidad}>
                                {unidad}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Actual *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stockMinimo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Mínimo</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Alerta cuando el stock llegue a este nivel
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ubicacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Estante A-3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="activo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Producto Activo</FormLabel>
                        <FormDescription>
                          Los productos inactivos no aparecen en búsquedas
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
                      : editingProducto
                      ? "Actualizar"
                      : "Crear Producto"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="flex-1 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, código, marca, categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Button
          variant={filterStockBajo ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStockBajo(!filterStockBajo)}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Stock Bajo
        </Button>

        <Button
          variant={filterActivos ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterActivos(!filterActivos)}
        >
          {filterActivos ? (
            <ToggleRight className="h-4 w-4 mr-2" />
          ) : (
            <ToggleLeft className="h-4 w-4 mr-2" />
          )}
          Solo Activos
        </Button>
      </div>

      {/* Tabla de productos */}
      {productosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              {searchTerm || filterStockBajo ? (
                <Search className="h-8 w-8 text-muted-foreground" />
              ) : (
                <Package className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || filterStockBajo
                ? "No se encontraron productos"
                : "No hay productos registrados"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || filterStockBajo
                ? "Intenta con otro criterio de búsqueda"
                : "Comienza agregando tu primer producto"}
            </p>
            {!searchTerm && !filterStockBajo && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Producto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productosFiltrados.map((producto) => {
                const stockBajo =
                  producto.stock <= (producto.stockMinimo || 0);

                return (
                  <TableRow key={producto.id}>
                    <TableCell className="font-mono text-sm">
                      {producto.codigo || "-"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{producto.nombre}</p>
                        {producto.marca && (
                          <p className="text-xs text-muted-foreground">
                            {producto.marca}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {producto.categoria && (
                        <Badge variant="secondary">{producto.categoria}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={stockBajo ? "text-destructive font-semibold" : ""}
                        >
                          {producto.stock}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {producto.unidad || "uds"}
                        </span>
                        {stockBajo && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(producto.precio)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={producto.activo ? "default" : "secondary"}>
                        {producto.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(producto)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(producto.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
