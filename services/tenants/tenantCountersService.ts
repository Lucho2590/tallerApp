import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { TenantCounter } from "@/types/tenant";

const COUNTERS_COLLECTION = "tenant-counters";
const TRABAJOS_COLLECTION = "trabajos";

export const tenantCountersService = {
  /**
   * Initialize counter for a tenant from existing work orders
   * Finds the highest order number and sets counter to that + 1
   */
  async initializeTenantCounter(tenantId: string): Promise<number> {
    try {
      const counterRef = doc(db, COUNTERS_COLLECTION, tenantId);

      // Check if counter already exists
      const counterDoc = await getDoc(counterRef);
      if (counterDoc.exists()) {
        const data = counterDoc.data() as TenantCounter;
        return data.trabajosCounter || 0;
      }

      // Get all trabajos for this tenant to find highest number
      const q = query(
        collection(db, TRABAJOS_COLLECTION),
        where("tenantId", "==", tenantId)
      );

      const querySnapshot = await getDocs(q);

      let highestNumber = 0;

      // Extract number from format OT-YYYYMM-XXXX
      querySnapshot.forEach((docSnap) => {
        const numero = docSnap.data().numero as string;
        if (numero && typeof numero === "string") {
          // Extract XXXX from OT-YYYYMM-XXXX
          const parts = numero.split("-");
          if (parts.length === 3) {
            const num = parseInt(parts[2], 10);
            if (!isNaN(num) && num > highestNumber) {
              highestNumber = num;
            }
          }
        }
      });

      // Initialize counter document
      const initialCounter: TenantCounter = {
        trabajosCounter: highestNumber,
        updatedAt: Timestamp.now(),
      };

      await setDoc(counterRef, initialCounter);

      console.log(`✅ Counter initialized for tenant ${tenantId} with value ${highestNumber}`);
      return highestNumber;
    } catch (error) {
      console.error("❌ Error initializing tenant counter:", error);
      throw error;
    }
  },

  /**
   * Get next work order number using atomic transaction
   * Returns formatted number: OT-YYYYMM-XXXX
   */
  async getNextWorkOrderNumber(tenantId: string): Promise<string> {
    try {
      const counterRef = doc(db, COUNTERS_COLLECTION, tenantId);

      // First check if counter exists, if not initialize it
      const counterDoc = await getDoc(counterRef);
      if (!counterDoc.exists()) {
        await this.initializeTenantCounter(tenantId);
      }

      // Now use transaction to get next number atomically
      const newNumber = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);

        if (!counterDoc.exists()) {
          // This shouldn't happen since we initialized above, but handle it
          throw new Error(`Counter not found for tenant ${tenantId}`);
        }

        const currentData = counterDoc.data() as TenantCounter;
        const current = currentData.trabajosCounter || 0;
        const next = current + 1;

        transaction.update(counterRef, {
          trabajosCounter: next,
          updatedAt: serverTimestamp(),
        });

        return next;
      });

      // Format: OT-YYYYMM-XXXX
      const fecha = new Date();
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, "0");
      const numero = String(newNumber).padStart(4, "0");

      const formattedNumber = `OT-${año}${mes}-${numero}`;
      console.log(`📋 Generated work order number: ${formattedNumber}`);

      return formattedNumber;
    } catch (error) {
      console.error("❌ Error getting next work order number:", error);
      throw error;
    }
  },

  /**
   * Get current counter value (read-only)
   */
  async getCurrentCounter(tenantId: string): Promise<number> {
    try {
      const counterRef = doc(db, COUNTERS_COLLECTION, tenantId);
      const counterDoc = await getDoc(counterRef);

      if (!counterDoc.exists()) {
        return 0;
      }

      const data = counterDoc.data() as TenantCounter;
      return data.trabajosCounter || 0;
    } catch (error) {
      console.error("❌ Error getting current counter:", error);
      throw error;
    }
  },
};
