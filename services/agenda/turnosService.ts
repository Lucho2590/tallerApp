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
import { Turno } from "@/types";

const COLLECTION_NAME = "turnos";

export const turnosService = {
  // Obtener todos los turnos (FILTRADO POR TENANT)
  async getAll(tenantId: string): Promise<Turno[]> {
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
        } as Turno;
      });
    } catch (error) {
      console.error("Error al obtener turnos:", error);
      throw error;
    }
  },

  // Obtener turnos por fecha (FILTRADO POR TENANT)
  async getByDate(fecha: Date, tenantId: string): Promise<Turno[]> {
    try {
      const startOfDay = new Date(fecha);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(fecha);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, COLLECTION_NAME),
        where("tenantId", "==", tenantId), // 🏢 FILTRO MULTITENANT
        where("fecha", ">=", Timestamp.fromDate(startOfDay)),
        where("fecha", "<=", Timestamp.fromDate(endOfDay)),
        orderBy("fecha", "asc"),
        orderBy("horaInicio", "asc")
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
        } as Turno;
      });
    } catch (error) {
      console.error("Error al obtener turnos por fecha:", error);
      throw error;
    }
  },

  // Obtener un turno por ID (VERIFICAR TENANT)
  async getById(id: string, tenantId: string): Promise<Turno | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // 🏢 VERIFICAR QUE PERTENECE AL TENANT
        if (data.tenantId !== tenantId) {
          console.warn(`Turno ${id} no pertenece al tenant ${tenantId}`);
          return null;
        }

        return {
          id: docSnap.id,
          ...data,
          fecha: data.fecha?.toDate() || new Date(),
          fechaCreacion: data.fechaCreacion?.toDate() || new Date(),
          fechaActualizacion: data.fechaActualizacion?.toDate() || new Date(),
        } as Turno;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener turno:", error);
      throw error;
    }
  },

  // Crear un nuevo turno (INCLUIR TENANT ID)
  async create(
    turnoData: Omit<Turno, "id" | "fechaCreacion" | "fechaActualizacion">
  ): Promise<string> {
    try {
      // 🏢 Verificar que tenantId está presente
      if (!turnoData.tenantId) {
        throw new Error("tenantId es requerido para crear un turno");
      }

      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...turnoData,
        fecha: Timestamp.fromDate(turnoData.fecha),
        fechaCreacion: now,
        fechaActualizacion: now,
      });
      return docRef.id;
    } catch (error) {
      console.error("Error al crear turno:", error);
      throw error;
    }
  },

  // Actualizar un turno (VERIFICAR TENANT)
  async update(
    id: string,
    turnoData: Partial<Omit<Turno, "id" | "fechaCreacion" | "fechaActualizacion">>,
    tenantId: string
  ): Promise<void> {
    try {
      // 🏢 Primero verificar que el turno pertenece al tenant
      const existing = await this.getById(id, tenantId);
      if (!existing) {
        throw new Error("Turno no encontrado o no pertenece a este tenant");
      }

      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData: any = {
        ...turnoData,
        fechaActualizacion: Timestamp.now(),
      };
      if (turnoData.fecha) {
        updateData.fecha = Timestamp.fromDate(turnoData.fecha);
      }
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error("Error al actualizar turno:", error);
      throw error;
    }
  },

  // Eliminar un turno (VERIFICAR TENANT)
  async delete(id: string, tenantId: string): Promise<void> {
    try {
      // 🏢 Primero verificar que el turno pertenece al tenant
      const existing = await this.getById(id, tenantId);
      if (!existing) {
        throw new Error("Turno no encontrado o no pertenece a este tenant");
      }

      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error al eliminar turno:", error);
      throw error;
    }
  },
};
