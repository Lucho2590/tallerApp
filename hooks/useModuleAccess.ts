"use client"

import { useTenant } from "@/contexts/TenantContext"
import { TenantModule } from "@/types/tenant"

interface ModuleAccessResult {
  hasAccess: boolean
  isLoading: boolean
  currentPlan: string | null
  requiredPlan?: string
}

/**
 * Hook para verificar si el tenant actual tiene acceso a un módulo específico
 *
 * @param module - El módulo a verificar (ej: TenantModule.PRODUCTS)
 * @returns Objeto con información sobre el acceso al módulo
 *
 * @example
 * const { hasAccess, isLoading, currentPlan } = useModuleAccess(TenantModule.PRODUCTS)
 * if (!hasAccess) return <UpgradeMessage />
 */
export function useModuleAccess(module: TenantModule): ModuleAccessResult {
  const { currentTenant, loading } = useTenant()

  // Si está cargando, retornamos loading
  if (loading) {
    return {
      hasAccess: false,
      isLoading: true,
      currentPlan: null,
    }
  }

  // Si no hay tenant (no debería pasar en rutas privadas), no tiene acceso
  if (!currentTenant) {
    return {
      hasAccess: false,
      isLoading: false,
      currentPlan: null,
    }
  }

  // Verificar si el módulo está en la lista de módulos habilitados
  const hasAccess = currentTenant.config?.modules?.includes(module) ?? false

  // Determinar el plan mínimo requerido para este módulo
  const requiredPlan = getRequiredPlanForModule(module)

  return {
    hasAccess,
    isLoading: false,
    currentPlan: currentTenant.plan,
    requiredPlan,
  }
}

/**
 * Determina qué plan mínimo se requiere para acceder a un módulo
 */
function getRequiredPlanForModule(module: TenantModule): string {
  // Módulos disponibles en TRIAL
  const trialModules = [
    TenantModule.CLIENTS,
    TenantModule.VEHICLES,
    TenantModule.JOBS,
  ]

  // Módulos disponibles desde BASIC
  const basicModules = [
    ...trialModules,
    TenantModule.SCHEDULE,
    TenantModule.QUOTES,
  ]

  // Módulos disponibles desde PREMIUM
  const premiumModules = [
    ...basicModules,
    TenantModule.INVENTORY,
    TenantModule.INVOICING,
    TenantModule.REPORTS,
  ]

  if (trialModules.includes(module)) {
    return "TRIAL"
  } else if (basicModules.includes(module)) {
    return "BASIC"
  } else if (premiumModules.includes(module)) {
    return "PREMIUM"
  } else {
    return "ENTERPRISE"
  }
}

/**
 * Hook para verificar si el tenant tiene una característica premium específica
 *
 * @example
 * const { hasFeature } = useFeatureAccess("EMAIL_NOTIFICATIONS")
 */
export function useFeatureAccess(feature: string): { hasFeature: boolean; isLoading: boolean } {
  const { currentTenant, loading } = useTenant()

  if (loading) {
    return {
      hasFeature: false,
      isLoading: true,
    }
  }

  if (!currentTenant) {
    return {
      hasFeature: false,
      isLoading: false,
    }
  }

  // Cast to any to avoid type error since features is string[]
  const hasFeature = currentTenant.config?.features?.includes(feature as any) ?? false

  return {
    hasFeature,
    isLoading: false,
  }
}
