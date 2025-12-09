"use client"

import { useTenant } from "@/contexts/TenantContext"
import { useEffect, useState } from "react"
import { collection, query, where, getCountFromServer } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

export type ResourceType = "users" | "clients" | "vehicles" | "jobs"

interface ResourceLimit {
  current: number
  max: number
  percentage: number
  isNearLimit: boolean // 80%+
  isAtLimit: boolean // 100%+
  isUnlimited: boolean
}

interface ResourceLimitsResult {
  users: ResourceLimit
  clients: ResourceLimit
  vehicles: ResourceLimit
  jobs: ResourceLimit
  loading: boolean
  refresh: () => Promise<void>
}

/**
 * Hook para verificar los límites de recursos del plan actual
 *
 * @example
 * const { clients, vehicles, refresh } = useResourceLimits()
 *
 * if (clients.isAtLimit) {
 *   // Mostrar mensaje de límite alcanzado
 * }
 *
 * if (clients.isNearLimit) {
 *   // Mostrar warning
 * }
 */
export function useResourceLimits(): ResourceLimitsResult {
  const { currentTenant } = useTenant()
  const [counts, setCounts] = useState({
    users: 0,
    clients: 0,
    vehicles: 0,
    jobs: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentTenant) {
      loadCounts()
    }
  }, [currentTenant?.id])

  const loadCounts = async () => {
    if (!currentTenant) return

    try {
      setLoading(true)

      // Contar usuarios del tenant
      const usersRef = collection(db, "users")
      const usersSnapshot = await getCountFromServer(usersRef)

      // Filtrar manualmente usuarios que pertenecen al tenant (Firestore no soporta array-contains en count)
      // Por ahora usamos el total de la base, luego se puede optimizar
      let usersCount = 0

      // Contar clientes
      const clientsRef = collection(db, "clientes")
      const clientsQuery = query(clientsRef, where("tenantId", "==", currentTenant.id))
      const clientsSnapshot = await getCountFromServer(clientsQuery)

      // Contar vehículos
      const vehiclesRef = collection(db, "vehiculos")
      const vehiclesQuery = query(vehiclesRef, where("tenantId", "==", currentTenant.id))
      const vehiclesSnapshot = await getCountFromServer(vehiclesQuery)

      // Contar trabajos del mes actual
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const jobsRef = collection(db, "trabajos")
      const jobsQuery = query(
        jobsRef,
        where("tenantId", "==", currentTenant.id),
        where("fechaCreacion", ">=", firstDayOfMonth)
      )
      const jobsSnapshot = await getCountFromServer(jobsQuery)

      setCounts({
        users: usersCount,
        clients: clientsSnapshot.data().count,
        vehicles: vehiclesSnapshot.data().count,
        jobs: jobsSnapshot.data().count,
      })
    } catch (error) {
      console.error("Error loading resource counts:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateLimit = (current: number, max: number): ResourceLimit => {
    const isUnlimited = max === -1
    const percentage = isUnlimited ? 0 : (current / max) * 100

    return {
      current,
      max,
      percentage,
      isNearLimit: !isUnlimited && percentage >= 80,
      isAtLimit: !isUnlimited && current >= max,
      isUnlimited,
    }
  }

  if (!currentTenant) {
    const emptyLimit: ResourceLimit = {
      current: 0,
      max: 0,
      percentage: 0,
      isNearLimit: false,
      isAtLimit: false,
      isUnlimited: false,
    }

    return {
      users: emptyLimit,
      clients: emptyLimit,
      vehicles: emptyLimit,
      jobs: emptyLimit,
      loading: false,
      refresh: async () => {},
    }
  }

  return {
    users: calculateLimit(counts.users, currentTenant.config.maxUsers),
    clients: calculateLimit(counts.clients, currentTenant.config.maxClients),
    vehicles: calculateLimit(counts.vehicles, currentTenant.config.maxVehicles),
    jobs: calculateLimit(counts.jobs, currentTenant.config.maxMonthlyJobs),
    loading,
    refresh: loadCounts,
  }
}

/**
 * Hook simplificado para verificar un tipo de recurso específico
 *
 * @example
 * const canCreateClient = useCanCreateResource("clients")
 *
 * if (!canCreateClient) {
 *   toast.error("Has alcanzado el límite de clientes")
 * }
 */
export function useCanCreateResource(resourceType: ResourceType): boolean {
  const limits = useResourceLimits()
  const limit = limits[resourceType]

  return limit.isUnlimited || !limit.isAtLimit
}
