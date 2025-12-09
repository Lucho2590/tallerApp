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
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Tenant } from "@/types/tenant";

const TENANTS_COLLECTION = "tenants";

/**
 * Create a new tenant (workshop)
 * Simplified: No plans, no limits, just basic info
 */
export async function createTenant(
  data: Omit<Tenant, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const tenantData = {
    ...data,
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
 * Get tenant by owner ID
 */
export async function getTenantByOwnerId(ownerId: string): Promise<Tenant | null> {
  const q = query(
    collection(db, TENANTS_COLLECTION),
    where("ownerId", "==", ownerId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  // Return the first tenant (user should only have one)
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as Tenant;
}

/**
 * Get all tenants (for admin panel)
 */
export async function getAllTenants(): Promise<Tenant[]> {
  const snapshot = await getDocs(collection(db, TENANTS_COLLECTION));

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
  data: Partial<Omit<Tenant, "id" | "createdAt" | "ownerId">>
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

export const tenantsService = {
  createTenant,
  getTenantById,
  getTenantByOwnerId,
  getAllTenants,
  updateTenant,
  deactivateTenant,
  deleteTenant,
};
