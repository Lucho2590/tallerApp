"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wrench, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { tenantsService } from "@/services/tenants/tenantsService";
import { usersService } from "@/services/users/usersService";
import { TenantRole, SubscriptionPlan } from "@/types/tenant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

// Schema de validación
const onboardingSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre del taller debe tener al menos 2 caracteres")
    .max(100, "El nombre es muy largo"),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, authState, needsOnboarding, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      legalName: "",
      taxId: "",
      phone: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Argentina",
      },
    },
  });

  // Redirect if user is not authenticated or doesn't need onboarding
  useEffect(() => {
    if (authState === "loading") return;

    if (authState === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (!needsOnboarding) {
      router.push("/dashboard");
    }
  }, [authState, needsOnboarding, router]);

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) return;

    try {
      setIsSubmitting(true);

      // Create tenant
      const tenantId = await tenantsService.createTenant({
        name: data.name,
        legalName: data.legalName,
        taxId: data.taxId,
        email: user.email,
        phone: data.phone,
        address: data.address?.street ? {
          street: data.address.street,
          city: data.address.city || "",
          state: data.address.state || "",
          zipCode: data.address.zipCode || "",
          country: data.address.country || "Argentina",
        } : undefined,
        plan: SubscriptionPlan.TRIAL,
        active: true,
        timezone: "America/Argentina/Buenos_Aires",
        locale: "es-AR",
        currency: "ARS",
      });

      // Add tenant to user as OWNER
      await usersService.addTenantToUser(user.id, tenantId, TenantRole.OWNER);

      // Refresh user data
      await refreshUser();

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating tenant:", error);
      alert("Error al crear el taller. Por favor intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth state
  if (authState === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Wrench className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            ¡Bienvenido a TallerApp!
          </CardTitle>
          <CardDescription className="text-base">
            Para comenzar, necesitamos algunos datos sobre tu taller.
            <br />
            Podrás editar esta información más tarde.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <Input
                          placeholder="Ej: Taller Mecánico González"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        El nombre comercial de tu taller
                      </FormDescription>
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
                        <FormLabel>Razón Social (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre legal de la empresa" {...field} />
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
                        <FormLabel>CUIT (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="XX-XXXXXXXX-X" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: +54 11 1234-5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dirección */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dirección (opcional)</h3>

                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calle</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Av. Corrientes 1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Buenos Aires" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provincia</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Buenos Aires" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address.zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Postal</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: C1043" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Trial info */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Plan de Prueba:</strong> Comenzarás con una prueba gratuita
                  que incluye acceso a todas las funciones básicas.
                </p>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando tu taller...
                  </>
                ) : (
                  "Crear mi Taller"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
