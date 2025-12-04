import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  Tenant,
  SubscriptionPlan,
  DEFAULT_TENANT_CONFIG,
  TenantUser,
  TenantRole,
  UserTenantRelation,
} from "@/types/tenant";

const TENANTS_COLLECTION = "tenants";
const USERS_COLLECTION = "users";

/**
 * Create a new tenant
 */
export async function createTenant(
  data: Omit<Tenant, "id" | "createdAt" | "updatedAt" | "config"> & {
    config?: Partial<Tenant["config"]>;
  }
): Promise<string> {
  const defaultConfig = DEFAULT_TENANT_CONFIG[data.plan];

  const tenantData = {
    ...data,
    config: {
      ...defaultConfig,
      ...data.config,
    },
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, TENANTS_COLLECTION), tenantData);
  return docRef.id;
}

/**
 * Get tenant by ID
 */
export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  const docRef = doc(db, TENANTS_COLLECTION, tenantId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Tenant;
}

/**
 * Get all tenants for a user
 */
export async function getUserTenants(userId: string): Promise<Tenant[]> {
  // First, get user document to get their tenant IDs
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    return [];
  }

  const userData = userSnapshot.data() as TenantUser;
  const tenantIds = userData.tenants?.map((t) => t.tenantId) || [];

  if (tenantIds.length === 0) {
    return [];
  }

  // Get all tenants for this user
  // Note: Firestore has a limit of 10 items in "in" queries
  // For production with >10 tenants per user, we'd need to batch this
  const q = query(
    collection(db, TENANTS_COLLECTION),
    where("__name__", "in", tenantIds)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Tenant[];
}

/**
 * Update tenant
 */
export async function updateTenant(
  tenantId: string,
  data: Partial<Omit<Tenant, "id" | "createdAt">>
): Promise<void> {
  const docRef = doc(db, TENANTS_COLLECTION, tenantId);

  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete tenant (soft delete - mark as inactive)
 */
export async function deactivateTenant(tenantId: string): Promise<void> {
  await updateTenant(tenantId, {
    active: false,
  });
}

/**
 * Hard delete tenant (use with caution!)
 */
export async function deleteTenant(tenantId: string): Promise<void> {
  const docRef = doc(db, TENANTS_COLLECTION, tenantId);
  await deleteDoc(docRef);
}

/**
 * Add user to tenant
 */
export async function addUserToTenant(
  userId: string,
  tenantId: string,
  role: TenantRole,
  invitedBy?: string
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    throw new Error("User not found");
  }

  const userData = userSnapshot.data() as TenantUser;
  const existingTenants = userData.tenants || [];

  // Check if user is already in this tenant
  if (existingTenants.some((t) => t.tenantId === tenantId)) {
    throw new Error("User already belongs to this tenant");
  }

  const newRelation: UserTenantRelation = {
    tenantId,
    role,
    joinedAt: Timestamp.now(),
    invitedBy,
  };

  await updateDoc(userRef, {
    tenants: [...existingTenants, newRelation],
    updatedAt: serverTimestamp(),
  });
}

/**
 * Remove user from tenant
 */
export async function removeUserFromTenant(
  userId: string,
  tenantId: string
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    throw new Error("User not found");
  }

  const userData = userSnapshot.data() as TenantUser;
  const updatedTenants =
    userData.tenants?.filter((t) => t.tenantId !== tenantId) || [];

  await updateDoc(userRef, {
    tenants: updatedTenants,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update user's role in tenant
 */
export async function updateUserRole(
  userId: string,
  tenantId: string,
  newRole: TenantRole
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    throw new Error("User not found");
  }

  const userData = userSnapshot.data() as TenantUser;
  const updatedTenants =
    userData.tenants?.map((t) =>
      t.tenantId === tenantId ? { ...t, role: newRole } : t
    ) || [];

  await updateDoc(userRef, {
    tenants: updatedTenants,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get all users in a tenant
 */
export async function getTenantUsers(
  tenantId: string
): Promise<Array<TenantUser & { role: TenantRole }>> {
  const q = query(
    collection(db, USERS_COLLECTION),
    where("tenants", "array-contains", { tenantId })
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const userData = doc.data() as TenantUser;
    const relation = userData.tenants?.find((t) => t.tenantId === tenantId);

    return {
      ...userData,
      id: doc.id,
      role: relation?.role || TenantRole.USER,
    };
  });
}

export const tenantsService = {
  createTenant,
  getTenantById,
  getUserTenants,
  updateTenant,
  deactivateTenant,
  deleteTenant,
  addUserToTenant,
  removeUserFromTenant,
  updateUserRole,
  getTenantUsers,
};
