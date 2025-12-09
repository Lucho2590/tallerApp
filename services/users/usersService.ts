import {
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { TenantUser } from "@/types/tenant";

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
   * Get all users (for admin panel)
   */
  async getAllUsers(): Promise<TenantUser[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TenantUser[];
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      throw error;
    }
  },

  /**
   * Initialize user document
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
        // User exists (created by Rowy extension), update with basic fields
        const data = docSnap.data();
        const updateData: any = {
          nombre,
          apellido,
          updatedAt: Timestamp.now(),
        };

        // Only initialize tenantId if it doesn't exist
        if (!data.tenantId) {
          updateData.tenantId = null;
        }

        await updateDoc(docRef, updateData);
      } else {
        // User doesn't exist, create it
        await setDoc(docRef, {
          email,
          nombre,
          apellido,
          tenantId: null,
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
   * Set user's tenant ID (their workshop)
   */
  async setUserTenant(userId: string, tenantId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);

      await updateDoc(docRef, {
        tenantId,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error al asignar tenant al usuario:", error);
      throw error;
    }
  },

  /**
   * Update user data
   */
  async updateUser(userId: string, userData: Partial<TenantUser>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);

      await updateDoc(docRef, {
        ...userData,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      throw error;
    }
  },

  /**
   * Check if user needs onboarding (has no tenant)
   */
  async needsOnboarding(userId: string): Promise<boolean> {
    try {
      const user = await this.getById(userId);
      if (!user) return true;

      // User needs onboarding if they don't have a tenant (unless they're a superadmin)
      return !user.tenantId && !user.isSuperAdmin;
    } catch (error) {
      console.error("Error al verificar onboarding:", error);
      return true;
    }
  },
};
