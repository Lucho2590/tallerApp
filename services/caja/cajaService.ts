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
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { MovimientoCaja } from "@/types";

const COLLECTION_NAME = "movimientos_caja";

export const cajaService = {
  // Obtener todos los movimientos (FILTRADO POR TENANT)
  async getAll(tenantId: string): Promise<MovimientoCaja[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("tenantId", "==", tenantId), // 🏢 FILTRO MULTITENANT
        orderBy("fecha", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          fecha: data.fecha?.toDate() || new Date(),
          fechaCreacion: data.fechaCreacion?.toDate() || new Date(),
          fechaActualizacion: data.fechaActualizacion?.toDate() || new Date(),
        } as MovimientoCaja;
      });
    } catch (error) {
      console.error("Error al obtener movimientos:", error);
      throw error;
    }
  },

  // Obtener movimientos por rango de fechas (FILTRADO POR TENANT)
  async getByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MovimientoCaja[]> {
    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, COLLECTION_NAME),
        where("tenantId", "==", tenantId),
        where("fecha", ">=", Timestamp.fromDate(start)),
        where("fecha", "<=", Timestamp.fromDate(end)),
        orderBy("fecha", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          fecha: data.fecha?.toDate() || new Date(),
          fechaCreacion: data.fechaCreacion?.toDate() || new Date(),
          fechaActualizacion: data.fechaActualizacion?.toDate() || new Date(),
        } as MovimientoCaja;
      });
    } catch (error) {
      console.error("Error al obtener movimientos por rango:", error);
      throw error;
    }
  },

  // Obtener un movimiento por ID (VERIFICAR TENANT)
  async getById(id: string, tenantId: string): Promise<MovimientoCaja | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // 🏢 VERIFICAR QUE PERTENECE AL TENANT
        if (data.tenantId !== tenantId) {
          console.warn(`Movimiento ${id} no pertenece al tenant ${tenantId}`);
          return null;
        }

        return {
          id: docSnap.id,
          ...data,
          fecha: data.fecha?.toDate() || new Date(),
          fechaCreacion: data.fechaCreacion?.toDate() || new Date(),
          fechaActualizacion: data.fechaActualizacion?.toDate() || new Date(),
        } as MovimientoCaja;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener movimiento:", error);
      throw error;
    }
  },

  // Crear un nuevo movimiento (INCLUIR TENANT ID)
  async create(
    movimientoData: Omit<MovimientoCaja, "id" | "fechaCreacion" | "fechaActualizacion">
  ): Promise<string> {
    try {
      // 🏢 Verificar que tenantId está presente
      if (!movimientoData.tenantId) {
        throw new Error("tenantId es requerido para crear un movimiento");
      }

      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...movimientoData,
        fecha: Timestamp.fromDate(movimientoData.fecha),
        fechaCreacion: now,
        fechaActualizacion: now,
      });
      return docRef.id;
    } catch (error) {
      console.error("Error al crear movimiento:", error);
      throw error;
    }
  },

  // Actualizar un movimiento (VERIFICAR TENANT)
  async update(
    id: string,
    movimientoData: Partial<Omit<MovimientoCaja, "id" | "fechaCreacion" | "fechaActualizacion">>,
    tenantId: string
  ): Promise<void> {
    try {
      // 🏢 Primero verificar que el movimiento pertenece al tenant
      const existing = await this.getById(id, tenantId);
      if (!existing) {
        throw new Error("Movimiento no encontrado o no pertenece a este tenant");
      }

      const updateData: any = {
        ...movimientoData,
        fechaActualizacion: Timestamp.now(),
      };

      // Convertir fecha a Timestamp si existe
      if (movimientoData.fecha) {
        updateData.fecha = Timestamp.fromDate(movimientoData.fecha);
      }

      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error("Error al actualizar movimiento:", error);
      throw error;
    }
  },

  // Eliminar un movimiento (VERIFICAR TENANT)
  async delete(id: string, tenantId: string): Promise<void> {
    try {
      // 🏢 Primero verificar que el movimiento pertenece al tenant
      const existing = await this.getById(id, tenantId);
      if (!existing) {
        throw new Error("Movimiento no encontrado o no pertenece a este tenant");
      }

      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error al eliminar movimiento:", error);
      throw error;
    }
  },

  // Calcular balance (ingresos - egresos) para un rango de fechas
  async getBalance(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ ingresos: number; egresos: number; balance: number }> {
    try {
      const movimientos = await this.getByDateRange(tenantId, startDate, endDate);

      const ingresos = movimientos
        .filter((m) => m.tipo === "ingreso")
        .reduce((sum, m) => sum + m.monto, 0);

      const egresos = movimientos
        .filter((m) => m.tipo === "egreso")
        .reduce((sum, m) => sum + m.monto, 0);

      return {
        ingresos,
        egresos,
        balance: ingresos - egresos,
      };
    } catch (error) {
      console.error("Error al calcular balance:", error);
      throw error;
    }
  },
};
