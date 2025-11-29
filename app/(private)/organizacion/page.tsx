"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Loader2, Save } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { tenantsService } from "@/services/tenants/tenantsService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Schema de validación
const organizacionSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre del taller debe tener al menos 2 caracteres")
    .max(100, "El nombre es muy largo"),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

type OrganizacionFormData = z.infer<typeof organizacionSchema>;

export default function OrganizacionPage() {
  const { currentTenant, loading: tenantLoading } = useTenant();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const form = useForm<OrganizacionFormData>({
    resolver: zodResolver(organizacionSchema),
    defaultValues: {
      name: "",
      legalName: "",
      taxId: "",
      phone: "",
      website: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  // Load tenant data when available
  useEffect(() => {
    if (currentTenant) {
      form.reset({
        name: currentTenant.name || "",
        legalName: currentTenant.legalName || "",
        taxId: currentTenant.taxId || "",
        phone: currentTenant.phone || "",
        website: currentTenant.website || "",
        street: currentTenant.address?.street || "",
        city: currentTenant.address?.city || "",
        state: currentTenant.address?.state || "",
        zipCode: currentTenant.address?.zipCode || "",
        country: currentTenant.address?.country || "",
      });
    }
  }, [currentTenant, form]);

  const onSubmit = async (data: OrganizacionFormData) => {
    if (!currentTenant) return;

    try {
      setIsSubmitting(true);
      setSuccessMessage("");

      await tenantsService.updateTenant(currentTenant.id, {
        name: data.name,
        legalName: data.legalName,
        taxId: data.taxId,
        phone: data.phone,
        website: data.website,
        address: data.street ? {
          street: data.street,
          city: data.city || "",
          state: data.state || "",
          zipCode: data.zipCode || "",
          country: data.country || "Argentina",
        } : undefined,
      });

      setSuccessMessage("Información actualizada correctamente");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating tenant:", error);
      alert("Error al actualizar la información. Por favor intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!currentTenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No hay taller seleccionado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Mi Organización
            </h1>
            <p className="text-muted-foreground">
              Gestiona la información de tu taller
            </p>
          </div>
        </div>
      </div>

      {/* Plan Badge */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plan Actual</CardTitle>
              <CardDescription>Tu suscripción y límites</CardDescription>
            </div>
            <Badge variant={currentTenant.plan === "trial" ? "secondary" : "default"} className="text-lg py-1 px-3">
              {currentTenant.plan === "trial" && "Prueba Gratuita"}
              {currentTenant.plan === "basic" && "Básico"}
              {currentTenant.plan === "premium" && "Premium"}
              {currentTenant.plan === "enterprise" && "Enterprise"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Usuarios</p>
              <p className="text-2xl font-bold">
                {currentTenant.config.maxUsers === -1 ? "∞" : currentTenant.config.maxUsers}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clientes</p>
              <p className="text-2xl font-bold">
                {currentTenant.config.maxClients === -1 ? "∞" : currentTenant.config.maxClients}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vehículos</p>
              <p className="text-2xl font-bold">
                {currentTenant.config.maxVehicles === -1 ? "∞" : currentTenant.config.maxVehicles}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trabajos/mes</p>
              <p className="text-2xl font-bold">
                {currentTenant.config.maxMonthlyJobs === -1 ? "∞" : currentTenant.config.maxMonthlyJobs}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Taller</CardTitle>
          <CardDescription>
            Actualiza los datos de tu negocio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {successMessage && (
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-md border border-green-300 dark:border-green-800">
                  {successMessage}
                </div>
              )}

              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Básica</h3>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Taller *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="legalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razón Social</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CUIT</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sitio Web</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dirección</h3>

                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calle</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provincia</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código Postal</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Submit button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
