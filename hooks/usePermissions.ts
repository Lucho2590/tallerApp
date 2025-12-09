"use client"

import { useTenant } from "@/contexts/TenantContext"
import { TenantRole } from "@/types/tenant"

/**
 * Permisos disponibles en el sistema
 */
export enum Permission {
  // Gestión de organización
  MANAGE_ORGANIZATION = "manage_organization",
  DELETE_ORGANIZATION = "delete_organization",
  CHANGE_PLAN = "change_plan",

  // Gestión de equipo
  MANAGE_TEAM = "manage_team",
  INVITE_USERS = "invite_users",
  REMOVE_USERS = "remove_users",
  CHANGE_USER_ROLES = "change_user_roles",

  // Gestión de clientes
  VIEW_CLIENTS = "view_clients",
  CREATE_CLIENTS = "create_clients",
  EDIT_CLIENTS = "edit_clients",
  DELETE_CLIENTS = "delete_clients",

  // Gestión de vehículos
  VIEW_VEHICLES = "view_vehicles",
  CREATE_VEHICLES = "create_vehicles",
  EDIT_VEHICLES = "edit_vehicles",
  DELETE_VEHICLES = "delete_vehicles",

  // Gestión de trabajos
  VIEW_JOBS = "view_jobs",
  CREATE_JOBS = "create_jobs",
  EDIT_JOBS = "edit_jobs",
  DELETE_JOBS = "delete_jobs",
  COMPLETE_JOBS = "complete_jobs",

  // Gestión de productos/inventario
  VIEW_PRODUCTS = "view_products",
  CREATE_PRODUCTS = "create_products",
  EDIT_PRODUCTS = "edit_products",
  DELETE_PRODUCTS = "delete_products",

  // Gestión de presupuestos
  VIEW_QUOTES = "view_quotes",
  CREATE_QUOTES = "create_quotes",
  EDIT_QUOTES = "edit_quotes",
  DELETE_QUOTES = "delete_quotes",
  APPROVE_QUOTES = "approve_quotes",

  // Gestión de agenda
  VIEW_SCHEDULE = "view_schedule",
  CREATE_APPOINTMENTS = "create_appointments",
  EDIT_APPOINTMENTS = "edit_appointments",
  DELETE_APPOINTMENTS = "delete_appointments",

  // Gestión de caja
  VIEW_CASH = "view_cash",
  CREATE_TRANSACTIONS = "create_transactions",
  EDIT_TRANSACTIONS = "edit_transactions",
  DELETE_TRANSACTIONS = "delete_transactions",

  // Reportes
  VIEW_REPORTS = "view_reports",
  EXPORT_REPORTS = "export_reports",
}

/**
 * Matriz de permisos por rol
 */
const ROLE_PERMISSIONS: Record<TenantRole, Permission[]> = {
  [TenantRole.OWNER]: [
    // Owners tienen TODOS los permisos
    ...Object.values(Permission),
  ],

  [TenantRole.ADMIN]: [
    // Admins tienen casi todos los permisos excepto eliminar organización y cambiar plan
    Permission.MANAGE_ORGANIZATION,
    // NO: DELETE_ORGANIZATION, CHANGE_PLAN

    Permission.MANAGE_TEAM,
    Permission.INVITE_USERS,
    Permission.REMOVE_USERS,
    Permission.CHANGE_USER_ROLES,

    Permission.VIEW_CLIENTS,
    Permission.CREATE_CLIENTS,
    Permission.EDIT_CLIENTS,
    Permission.DELETE_CLIENTS,

    Permission.VIEW_VEHICLES,
    Permission.CREATE_VEHICLES,
    Permission.EDIT_VEHICLES,
    Permission.DELETE_VEHICLES,

    Permission.VIEW_JOBS,
    Permission.CREATE_JOBS,
    Permission.EDIT_JOBS,
    Permission.DELETE_JOBS,
    Permission.COMPLETE_JOBS,

    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCTS,
    Permission.EDIT_PRODUCTS,
    Permission.DELETE_PRODUCTS,

    Permission.VIEW_QUOTES,
    Permission.CREATE_QUOTES,
    Permission.EDIT_QUOTES,
    Permission.DELETE_QUOTES,
    Permission.APPROVE_QUOTES,

    Permission.VIEW_SCHEDULE,
    Permission.CREATE_APPOINTMENTS,
    Permission.EDIT_APPOINTMENTS,
    Permission.DELETE_APPOINTMENTS,

    Permission.VIEW_CASH,
    Permission.CREATE_TRANSACTIONS,
    Permission.EDIT_TRANSACTIONS,
    Permission.DELETE_TRANSACTIONS,

    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
  ],

  [TenantRole.MANAGER]: [
    // Managers pueden gestionar operaciones diarias pero no el equipo
    Permission.VIEW_CLIENTS,
    Permission.CREATE_CLIENTS,
    Permission.EDIT_CLIENTS,
    Permission.DELETE_CLIENTS,

    Permission.VIEW_VEHICLES,
    Permission.CREATE_VEHICLES,
    Permission.EDIT_VEHICLES,
    Permission.DELETE_VEHICLES,

    Permission.VIEW_JOBS,
    Permission.CREATE_JOBS,
    Permission.EDIT_JOBS,
    Permission.DELETE_JOBS,
    Permission.COMPLETE_JOBS,

    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCTS,
    Permission.EDIT_PRODUCTS,
    // NO: DELETE_PRODUCTS

    Permission.VIEW_QUOTES,
    Permission.CREATE_QUOTES,
    Permission.EDIT_QUOTES,
    Permission.APPROVE_QUOTES,
    // NO: DELETE_QUOTES

    Permission.VIEW_SCHEDULE,
    Permission.CREATE_APPOINTMENTS,
    Permission.EDIT_APPOINTMENTS,
    Permission.DELETE_APPOINTMENTS,

    Permission.VIEW_CASH,
    Permission.CREATE_TRANSACTIONS,
    // NO: EDIT_TRANSACTIONS, DELETE_TRANSACTIONS

    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
  ],

  [TenantRole.USER]: [
    // Users tienen acceso estándar a funcionalidades básicas
    Permission.VIEW_CLIENTS,
    Permission.CREATE_CLIENTS,
    Permission.EDIT_CLIENTS,
    // NO: DELETE_CLIENTS

    Permission.VIEW_VEHICLES,
    Permission.CREATE_VEHICLES,
    Permission.EDIT_VEHICLES,
    // NO: DELETE_VEHICLES

    Permission.VIEW_JOBS,
    Permission.CREATE_JOBS,
    Permission.EDIT_JOBS,
    Permission.COMPLETE_JOBS,
    // NO: DELETE_JOBS

    Permission.VIEW_PRODUCTS,
    // NO: CREATE/EDIT/DELETE PRODUCTS

    Permission.VIEW_QUOTES,
    Permission.CREATE_QUOTES,
    // NO: EDIT/DELETE/APPROVE QUOTES

    Permission.VIEW_SCHEDULE,
    Permission.CREATE_APPOINTMENTS,
    Permission.EDIT_APPOINTMENTS,
    // NO: DELETE_APPOINTMENTS

    Permission.VIEW_CASH,
    // NO: CREATE/EDIT/DELETE TRANSACTIONS

    Permission.VIEW_REPORTS,
    // NO: EXPORT_REPORTS
  ],

  [TenantRole.VIEWER]: [
    // Viewers solo pueden VER, no editar nada
    Permission.VIEW_CLIENTS,
    Permission.VIEW_VEHICLES,
    Permission.VIEW_JOBS,
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_QUOTES,
    Permission.VIEW_SCHEDULE,
    Permission.VIEW_CASH,
    Permission.VIEW_REPORTS,
  ],
}

interface PermissionsResult {
  can: (permission: Permission) => boolean
  canAny: (permissions: Permission[]) => boolean
  canAll: (permissions: Permission[]) => boolean
  role: TenantRole | null
  isOwner: boolean
  isAdmin: boolean
  isManager: boolean
}

/**
 * Hook para verificar permisos del usuario actual en el tenant
 *
 * @example
 * const { can, isOwner } = usePermissions()
 *
 * if (can(Permission.DELETE_CLIENTS)) {
 *   // Mostrar botón de eliminar
 * }
 *
 * if (isOwner) {
 *   // Mostrar configuración de organización
 * }
 */
export function usePermissions(): PermissionsResult {
  const { currentRole } = useTenant()

  const can = (permission: Permission): boolean => {
    if (!currentRole) return false
    return ROLE_PERMISSIONS[currentRole]?.includes(permission) ?? false
  }

  const canAny = (permissions: Permission[]): boolean => {
    return permissions.some(permission => can(permission))
  }

  const canAll = (permissions: Permission[]): boolean => {
    return permissions.every(permission => can(permission))
  }

  return {
    can,
    canAny,
    canAll,
    role: currentRole,
    isOwner: currentRole === TenantRole.OWNER,
    isAdmin: currentRole === TenantRole.ADMIN,
    isManager: currentRole === TenantRole.MANAGER,
  }
}
