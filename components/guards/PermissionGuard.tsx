"use client"

import { usePermissions, Permission } from "@/hooks/usePermissions"
import { Shield } from "lucide-react"

interface PermissionGuardProps {
  permission: Permission
  children: React.ReactNode
  fallback?: React.ReactNode
  hideIfNoAccess?: boolean
}

/**
 * Componente guard que verifica si el usuario tiene un permiso específico
 * Si no tiene acceso, puede mostrar un fallback o simplemente ocultar el contenido
 *
 * @example
 * // Mostrar mensaje si no tiene permiso
 * <PermissionGuard permission={Permission.DELETE_CLIENTS}>
 *   <DeleteButton />
 * </PermissionGuard>
 *
 * @example
 * // Ocultar completamente si no tiene permiso
 * <PermissionGuard permission={Permission.MANAGE_TEAM} hideIfNoAccess>
 *   <ManageTeamButton />
 * </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  children,
  fallback,
  hideIfNoAccess = false,
}: PermissionGuardProps) {
  const { can } = usePermissions()

  // Si tiene el permiso, renderiza el contenido
  if (can(permission)) {
    return <>{children}</>
  }

  // Si no tiene permiso y debe ocultar, no renderiza nada
  if (hideIfNoAccess) {
    return null
  }

  // Si tiene un fallback personalizado, lo muestra
  if (fallback) {
    return <>{fallback}</>
  }

  // Fallback por defecto: mensaje de permiso denegado
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
      <Shield className="h-4 w-4 text-slate-500" />
      <p className="text-sm text-slate-500">
        No tienes permisos para realizar esta acción
      </p>
    </div>
  )
}

interface AnyPermissionGuardProps {
  permissions: Permission[]
  children: React.ReactNode
  fallback?: React.ReactNode
  hideIfNoAccess?: boolean
}

/**
 * Guard que verifica si el usuario tiene AL MENOS UNO de los permisos
 *
 * @example
 * <AnyPermissionGuard permissions={[Permission.EDIT_CLIENTS, Permission.DELETE_CLIENTS]}>
 *   <ClientActions />
 * </AnyPermissionGuard>
 */
export function AnyPermissionGuard({
  permissions,
  children,
  fallback,
  hideIfNoAccess = false,
}: AnyPermissionGuardProps) {
  const { canAny } = usePermissions()

  if (canAny(permissions)) {
    return <>{children}</>
  }

  if (hideIfNoAccess) {
    return null
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
      <Shield className="h-4 w-4 text-slate-500" />
      <p className="text-sm text-slate-500">
        No tienes permisos para realizar esta acción
      </p>
    </div>
  )
}

interface AllPermissionsGuardProps {
  permissions: Permission[]
  children: React.ReactNode
  fallback?: React.ReactNode
  hideIfNoAccess?: boolean
}

/**
 * Guard que verifica si el usuario tiene TODOS los permisos
 *
 * @example
 * <AllPermissionsGuard permissions={[Permission.VIEW_CASH, Permission.CREATE_TRANSACTIONS]}>
 *   <CashRegister />
 * </AllPermissionsGuard>
 */
export function AllPermissionsGuard({
  permissions,
  children,
  fallback,
  hideIfNoAccess = false,
}: AllPermissionsGuardProps) {
  const { canAll } = usePermissions()

  if (canAll(permissions)) {
    return <>{children}</>
  }

  if (hideIfNoAccess) {
    return null
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
      <Shield className="h-4 w-4 text-slate-500" />
      <p className="text-sm text-slate-500">
        No tienes permisos para realizar esta acción
      </p>
    </div>
  )
}
