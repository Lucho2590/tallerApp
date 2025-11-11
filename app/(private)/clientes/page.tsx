"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { useClientes } from "@/hooks/clientes/useClientes";
import { clienteSchema, type ClienteFormData } from "@/lib/validations/cliente";
import { Cliente } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        notas: cliente.notas || "",
      });
    } else {
      setEditingCliente(null);
      reset({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        direccion: "",
        notas: "",
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  placeholder="Calle 123, Ciudad"
                  {...register("direccion")}
                />
                {errors.direccion && (
                  <p className="text-sm text-destructive">{errors.direccion.message}</p>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientes.map((cliente) => (
            <Card key={cliente.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {cliente.nombre} {cliente.apellido}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1">
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
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {cliente.telefono && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{cliente.telefono}</span>
                  </div>
                )}
                {cliente.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{cliente.email}</span>
                  </div>
                )}
                {cliente.direccion && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{cliente.direccion}</span>
                  </div>
                )}
                {cliente.notas && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">{cliente.notas}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
