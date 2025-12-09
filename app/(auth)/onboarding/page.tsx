"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wrench, Loader2, User, Building2, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { tenantsService } from "@/services/tenants/tenantsService";
import { usersService } from "@/services/users/usersService";
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

// Schema de validación para Paso 1: Datos Personales
const step1Schema = z.object({
  firstName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre es muy largo"),
  lastName: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido es muy largo"),
  userPhone: z.string().optional(),
});

// Schema de validación para Paso 2: Datos del Taller
const step2Schema = z.object({
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

// Schema completo
const onboardingSchema = step1Schema.merge(step2Schema);

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, authState, needsOnboarding, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      userPhone: "",
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

  // Navegar al siguiente paso
  const handleNextStep = async () => {
    // Validar solo los campos del paso actual
    const fieldsToValidate: (keyof OnboardingFormData)[] =
      currentStep === 1
        ? ['firstName', 'lastName', 'userPhone']
        : ['name'];

    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep(2);
    }
  };

  // Volver al paso anterior
  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) return;

    try {
      setIsSubmitting(true);

      // Helper para limpiar valores vacíos
      const cleanValue = (value: string | undefined) => {
        return value && value.trim() !== "" ? value : undefined;
      };

      // Actualizar datos personales del usuario
      console.log("🔧 [Onboarding] Updating user personal data...");
      const userData: any = {
        nombre: data.firstName,
        apellido: data.lastName,
      };
      if (cleanValue(data.userPhone)) {
        userData.telefono = data.userPhone;
      }
      await usersService.updateUser(user.id, userData);
      console.log("✅ [Onboarding] User personal data updated");

      // Create tenant - simple and clean
      const tenantData: any = {
        name: data.name,
        email: user.email,
        active: true,
        timezone: "America/Argentina/Buenos_Aires",
        locale: "es-AR",
        currency: "ARS",
        ownerId: user.id, // Set the owner
      };

      // Solo agregar campos opcionales si tienen valor
      if (cleanValue(data.legalName)) tenantData.legalName = data.legalName;
      if (cleanValue(data.taxId)) tenantData.taxId = data.taxId;
      if (cleanValue(data.phone)) tenantData.phone = data.phone;

      // Address solo si tiene al menos street
      if (data.address?.street && cleanValue(data.address.street)) {
        tenantData.address = {
          street: data.address.street,
          city: data.address.city || "",
          state: data.address.state || "",
          zipCode: data.address.zipCode || "",
          country: data.address.country || "Argentina",
        };
      }

      console.log("🔧 [Onboarding] Creating tenant with data:", tenantData);
      const tenantId = await tenantsService.createTenant(tenantData);
      console.log("✅ [Onboarding] Tenant created with ID:", tenantId);

      // Set tenant ID on user
      console.log("🔧 [Onboarding] Setting tenant on user:", user.id);
      await usersService.setUserTenant(user.id, tenantId);
      console.log("✅ [Onboarding] Tenant set on user");

      // Refresh user data to reload tenant information
      console.log("🔧 [Onboarding] Refreshing user data...");
      await refreshUser();
      console.log("✅ [Onboarding] User data refreshed");

      // Wait for context to fully update
      console.log("⏳ [Onboarding] Waiting 500ms for context update...");
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect to dashboard
      console.log("🔄 [Onboarding] Redirecting to dashboard...");
      window.location.href = "/dashboard";
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
            {currentStep === 1
              ? "Primero, contanos un poco sobre vos"
              : "Ahora, configurá tu taller"}
          </CardDescription>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                  currentStep === 1
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary bg-primary text-primary-foreground"
                }`}
              >
                {currentStep > 1 ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <span className="text-sm font-medium">Datos Personales</span>
            </div>

            <div className="w-12 h-0.5 bg-border mx-2" />

            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                  currentStep === 2
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Datos del Taller
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {/* PASO 1: Datos Personales */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Tus Datos Personales</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre *</FormLabel>
                            <FormControl>
                              <Input placeholder="Tu nombre" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apellido *</FormLabel>
                            <FormControl>
                              <Input placeholder="Tu apellido" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="userPhone"
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

                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full"
                    size="lg"
                  >
                    Siguiente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* PASO 2: Datos del Taller */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Información del Taller</h3>

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
                              <Input placeholder="Nombre legal" {...field} />
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
                          <FormLabel>Teléfono del Taller (opcional)</FormLabel>
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

                  {/* Info message */}
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>¡Empieza gratis!</strong> Tendrás acceso completo a todas las funciones sin límites.
                    </p>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                      className="flex-1"
                      size="lg"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Atrás
                    </Button>
                    <Button
                      type="button"
                      onClick={form.handleSubmit(onSubmit)}
                      className="flex-1"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        "Crear mi Taller"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
