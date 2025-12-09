"use client"

import { useModuleAccess } from "@/hooks/useModuleAccess"
import { TenantModule } from "@/types/tenant"
import { Lock, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ModuleGuardProps {
  module: TenantModule
  children: React.ReactNode
  fallback?: React.ReactNode
}

const moduleNames: Record<TenantModule, string> = {
  [TenantModule.CLIENTS]: "Clientes",
  [TenantModule.VEHICLES]: "Vehículos",
  [TenantModule.JOBS]: "Trabajos",
  [TenantModule.SCHEDULE]: "Agenda",
  [TenantModule.QUOTES]: "Presupuestos",
  [TenantModule.INVENTORY]: "Inventario",
  [TenantModule.INVOICING]: "Facturación",
  [TenantModule.REPORTS]: "Reportes",
}

const planNames: Record<string, string> = {
  TRIAL: "Trial",
  BASIC: "Básico",
  PREMIUM: "Premium",
  ENTERPRISE: "Enterprise",
}

const planColors: Record<string, string> = {
  TRIAL: "bg-purple-500",
  BASIC: "bg-blue-500",
  PREMIUM: "bg-orange-500",
  ENTERPRISE: "bg-green-500",
}

/**
 * Componente guard que verifica si el tenant tiene acceso a un módulo
 * Si no tiene acceso, muestra un mensaje de upgrade
 *
 * @example
 * <ModuleGuard module={TenantModule.PRODUCTS}>
 *   <ProductsPage />
 * </ModuleGuard>
 */
export function ModuleGuard({ module, children, fallback }: ModuleGuardProps) {
  const { hasAccess, isLoading, currentPlan, requiredPlan } = useModuleAccess(module)

  // Mientras carga, mostramos un loading skeleton
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si tiene acceso, renderizamos el contenido
  if (hasAccess) {
    return <>{children}</>
  }

  // Si se pasó un fallback personalizado, lo usamos
  if (fallback) {
    return <>{fallback}</>
  }

  // Si no tiene acceso, mostramos mensaje de upgrade
  const moduleName = moduleNames[module] || module
  const planName = planNames[requiredPlan || "BASIC"] || requiredPlan

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="border-2 border-orange-500/20 bg-gradient-to-br from-slate-900 to-slate-800">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
            <Lock className="h-8 w-8 text-orange-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Módulo no disponible
          </CardTitle>
          <CardDescription className="text-base">
            El módulo <strong>{moduleName}</strong> no está disponible en tu plan actual
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Plan */}
          <div className="flex items-center justify-center gap-4 py-4 border-y border-slate-700">
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">Tu plan actual</p>
              <Badge className={`${planColors[currentPlan || "TRIAL"]} text-white px-4 py-1`}>
                {planNames[currentPlan || "TRIAL"]}
              </Badge>
            </div>
            <div className="text-slate-500">→</div>
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">Plan requerido</p>
              <Badge className={`${planColors[requiredPlan || "BASIC"]} text-white px-4 py-1`}>
                {planName}
              </Badge>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              Qué obtienes al actualizar:
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                <span>Acceso completo al módulo de <strong>{moduleName}</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                <span>Mayor límite de clientes, vehículos y trabajos</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                <span>Más usuarios en tu equipo</span>
              </li>
              {(requiredPlan === "PREMIUM" || requiredPlan === "ENTERPRISE") && (
                <>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                    <span>Reportes avanzados y analíticas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                    <span>Notificaciones por email</span>
                  </li>
                </>
              )}
              {requiredPlan === "ENTERPRISE" && (
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                  <span>Soporte prioritario y personalización</span>
                </li>
              )}
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1 bg-orange-600 hover:bg-orange-700">
              <Link href="/upgrade" className="flex items-center justify-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Actualizar plan
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 border-slate-700">
              <Link href="/dashboard">
                Volver al inicio
              </Link>
            </Button>
          </div>

          {/* Additional info */}
          <p className="text-xs text-center text-slate-500 pt-2">
            ¿Tienes preguntas? <Link href="/pricing" className="text-orange-400 hover:underline">Ver todos los planes</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
