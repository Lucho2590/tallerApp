import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { TenantUser, UserTenantRelation, TenantRole } from "@/types/tenant";

const COLLECTION_NAME = "users";

export const usersService = {
  /**
   * Get user document by ID
   */
  async getById(userId: string): Promise<TenantUser | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt || Timestamp.now(),
          updatedAt: data.updatedAt || Timestamp.now(),
        } as TenantUser;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      throw error;
    }
  },

  /**
   * Initialize user document with tenant structure
   * Called after Rowy extension creates the basic user document
   */
  async initializeUser(
    userId: string,
    email: string,
    displayName?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);

      // Split displayName into nombre and apellido
      const nameParts = displayName?.split(" ") || ["", ""];
      const nombre = nameParts[0] || "";
      const apellido = nameParts.slice(1).join(" ") || "";

      if (docSnap.exists()) {
        // User exists (created by Rowy extension), update with tenant fields if they don't exist
        const data = docSnap.data();
        const updateData: any = {
          nombre,
          apellido,
          updatedAt: Timestamp.now(),
        };

        // Only initialize tenant fields if they don't exist (don't overwrite)
        if (!data.tenants) {
          updateData.tenants = {};
        }
        if (!data.currentTenantId) {
          updateData.currentTenantId = "";
        }

        await updateDoc(docRef, updateData);
      } else {
        // User doesn't exist, create it
        await setDoc(docRef, {
          email,
          nombre,
          apellido,
          tenants: {},
          currentTenantId: "",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error("Error al inicializar usuario:", error);
      throw error;
    }
  },

  /**
   * Add tenant to user
   */
  async addTenantToUser(
    userId: string,
    tenantId: string,
    role: TenantRole = TenantRole.OWNER,
    invitedBy?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Usuario no encontrado");
      }

      const userData = docSnap.data();
      const tenants = userData.tenants || {};

      // Add tenant relation (only include invitedBy if it has a value)
      const relation: UserTenantRelation = {
        tenantId,
        role,
        joinedAt: Timestamp.now(),
        ...(invitedBy && { invitedBy }),
      };

      tenants[tenantId] = relation;

      // If this is the first tenant, set it as current
      const currentTenantId = userData.currentTenantId || tenantId;

      await updateDoc(docRef, {
        tenants,
        currentTenantId,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error al agregar tenant al usuario:", error);
      throw error;
    }
  },

  /**
   * Switch current tenant
   */
  async switchTenant(userId: string, tenantId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Usuario no encontrado");
      }

      const userData = docSnap.data();
      const tenants = userData.tenants || {};

      // Verify user belongs to this tenant
      if (!tenants[tenantId]) {
        throw new Error("Usuario no pertenece a este tenant");
      }

      await updateDoc(docRef, {
        currentTenantId: tenantId,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error al cambiar tenant:", error);
      throw error;
    }
  },

  /**
   * Remove tenant from user
   */
  async removeTenantFromUser(
    userId: string,
    tenantId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Usuario no encontrado");
      }

      const userData = docSnap.data();
      const tenants = userData.tenants || {};

      // Remove tenant
      delete tenants[tenantId];

      // If current tenant was removed, switch to another one or empty
      let currentTenantId = userData.currentTenantId;
      if (currentTenantId === tenantId) {
        const remainingTenants = Object.keys(tenants);
        currentTenantId = remainingTenants.length > 0 ? remainingTenants[0] : "";
      }

      await updateDoc(docRef, {
        tenants,
        currentTenantId,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error al remover tenant del usuario:", error);
      throw error;
    }
  },

  /**
   * Check if user needs onboarding (has no tenants)
   */
  async needsOnboarding(userId: string): Promise<boolean> {
    try {
      const user = await this.getById(userId);
      if (!user) return true;

      const tenants = user.tenants || {};
      return Object.keys(tenants).length === 0;
    } catch (error) {
      console.error("Error al verificar onboarding:", error);
      return true;
    }
  },
};
