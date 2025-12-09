import { tenantsService } from "../tenants/tenantsService";
import { usersService } from "../users/usersService";
import { TenantUser, Tenant } from "@/types/tenant";

/**
 * Admin service for Super Admin operations
 * Simplified: Just view users and tenants, no complex stats
 */

// ============================================================================
// USERS
// ============================================================================

export interface AdminUserData extends TenantUser {
  tenantName?: string; // Name of their workshop
}

/**
 * Get all users in the system with their tenant info
 */
export async function getAllUsers(): Promise<AdminUserData[]> {
  try {
    const users = await usersService.getAllUsers();
    const tenants = await tenantsService.getAllTenants();

    // Map tenants by ID for quick lookup
    const tenantMap = new Map(tenants.map(t => [t.id, t]));

    // Add tenant name to each user
    return users.map(user => ({
      ...user,
      tenantName: user.tenantId ? tenantMap.get(user.tenantId)?.name : undefined,
    }));
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw new Error("Failed to fetch users");
  }
}

// ============================================================================
// TENANTS/ORGANIZATIONS
// ============================================================================

export interface AdminTenantData extends Tenant {
  ownerName?: string; // Owner's full name
  ownerEmail?: string; // Owner's email
}

/**
 * Get all tenants in the system with owner info
 */
export async function getAllTenants(): Promise<AdminTenantData[]> {
  try {
    const tenants = await tenantsService.getAllTenants();
    const users = await usersService.getAllUsers();

    // Map users by ID for quick lookup
    const userMap = new Map(users.map(u => [u.id, u]));

    // Add owner info to each tenant
    return tenants.map(tenant => {
      const owner = userMap.get(tenant.ownerId);
      return {
        ...tenant,
        ownerName: owner ? `${owner.nombre} ${owner.apellido}` : undefined,
        ownerEmail: owner?.email,
      };
    });
  } catch (error) {
    console.error("Error fetching all tenants:", error);
    throw new Error("Failed to fetch tenants");
  }
}

// ============================================================================
// STATISTICS
// ============================================================================

export interface AdminStats {
  totalUsers: number;
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
}

/**
 * Get system-wide statistics
 */
export async function getSystemStats(): Promise<AdminStats> {
  try {
    const users = await usersService.getAllUsers();
    const tenants = await tenantsService.getAllTenants();

    const activeTenants = tenants.filter(t => t.active).length;
    const inactiveTenants = tenants.filter(t => !t.active).length;

    return {
      totalUsers: users.length,
      totalTenants: tenants.length,
      activeTenants,
      inactiveTenants,
    };
  } catch (error) {
    console.error("Error getting system stats:", error);
    throw error;
  }
}

export const adminService = {
  getAllUsers,
  getAllTenants,
  getSystemStats,
};
