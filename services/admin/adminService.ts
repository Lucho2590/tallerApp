import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { Tenant, TenantUser } from "@/types/tenant";

// Estadísticas del dashboard
export interface AdminStats {
  totalUsers: number;
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
}

// Datos de usuario para admin
export interface AdminUserData {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  tenantId?: string;
  tenantName?: string;
  isSuperAdmin?: boolean;
  createdAt: Date;
}

// Datos de tenant para admin
export interface AdminTenantData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  active: boolean;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  createdAt: Date;
  address?: {
    city: string;
    state: string;
  };
}

/**
 * Obtener estadísticas generales
 */
export async function getAdminStats(): Promise<AdminStats> {
  try {
    const [usersSnapshot, tenantsSnapshot] = await Promise.all([
      getDocs(collection(db, "users")),
      getDocs(collection(db, "tenants")),
    ]);

    const tenants = tenantsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Tenant[];

    return {
      totalUsers: usersSnapshot.size,
      totalTenants: tenantsSnapshot.size,
      activeTenants: tenants.filter(t => t.active).length,
      inactiveTenants: tenants.filter(t => !t.active).length,
    };
  } catch (error) {
    console.error("Error getting admin stats:", error);
    throw error;
  }
}

/**
 * Obtener todos los usuarios con información de sus talleres
 */
export async function getAllUsers(): Promise<AdminUserData[]> {
  try {
    const [usersSnapshot, tenantsSnapshot] = await Promise.all([
      getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"))),
      getDocs(collection(db, "tenants")),
    ]);

    const tenants = new Map(
      tenantsSnapshot.docs.map(doc => [
        doc.id,
        { id: doc.id, ...doc.data() } as Tenant
      ])
    );

    const users: AdminUserData[] = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      const tenant = data.tenantId ? tenants.get(data.tenantId) : undefined;

      return {
        id: doc.id,
        email: data.email || "",
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        tenantId: data.tenantId,
        tenantName: tenant?.name,
        isSuperAdmin: data.isSuperAdmin || false,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      };
    });

    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
}

/**
 * Obtener todos los talleres con información de sus dueños
 */
export async function getAllTenants(): Promise<AdminTenantData[]> {
  try {
    const [tenantsSnapshot, usersSnapshot] = await Promise.all([
      getDocs(query(collection(db, "tenants"), orderBy("createdAt", "desc"))),
      getDocs(collection(db, "users")),
    ]);

    const users = new Map(
      usersSnapshot.docs.map(doc => [
        doc.id,
        { id: doc.id, ...doc.data() } as TenantUser
      ])
    );

    const tenants: AdminTenantData[] = tenantsSnapshot.docs.map(doc => {
      const data = doc.data();
      const owner = data.ownerId ? users.get(data.ownerId) : undefined;

      return {
        id: doc.id,
        name: data.name || "",
        email: data.email || "",
        phone: data.phone,
        active: data.active !== false,
        ownerId: data.ownerId || "",
        ownerName: owner ? `${owner.nombre} ${owner.apellido}` : undefined,
        ownerEmail: owner?.email,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        address: data.address,
      };
    });

    return tenants;
  } catch (error) {
    console.error("Error getting all tenants:", error);
    throw error;
  }
}
