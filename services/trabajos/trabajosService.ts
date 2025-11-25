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
import { Trabajo } from "@/types";

const COLLECTION_NAME = "trabajos";

// Helper para limpiar valores undefined de un objeto (Firebase no los acepta)
const cleanUndefined = <T extends Record<string, any>>(obj: T): T => {
  const cleaned = {} as T;
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      cleaned[key as keyof T] = obj[key];
    }
  });
  return cleaned;
};

// Contador global para números de orden (en producción esto debería ser más robusto)
let ordenCounter = 1;

export const trabajosService = {
  // Generar número de orden único
  generarNumeroOrden(): string {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const numero = String(ordenCounter++).padStart(4, "0");
    return `OT-${año}${mes}-${numero}`;
  },

  // Obtener todos los trabajos
  async getAll(): Promise<Trabajo[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy("fechaCreacion", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          fechaCreacion: data.fechaCreacion?.toDate() || new Date(),
          fechaActualizacion: data.fechaActualizacion?.toDate() || new Date(),
          fechaInicio: data.fechaInicio?.toDate() || undefined,
          fechaFinalizacion: data.fechaFinalizacion?.toDate() || undefined,
        } as Trabajo;
      });
    } catch (error) {
      console.error("Error al obtener trabajos:", error);
      throw error;
    }
  },

  // Obtener trabajos por cliente
  async getByClienteId(clienteId: string): Promise<Trabajo[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("clienteId", "==", clienteId),
        orderBy("fechaCreacion", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          fechaCreacion: data.fechaCreacion?.toDate() || new Date(),
          fechaActualizacion: data.fechaActualizacion?.toDate() || new Date(),
          fechaInicio: data.fechaInicio?.toDate() || undefined,
          fechaFinalizacion: data.fechaFinalizacion?.toDate() || undefined,
        } as Trabajo;
      });
    } catch (error) {
      console.error("Error al obtener trabajos del cliente:", error);
      throw error;
    }
  },

  // Obtener trabajos por vehículo
  async getByVehiculoId(vehiculoId: string): Promise<Trabajo[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("vehiculoId", "==", vehiculoId),
        orderBy("fechaCreacion", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          fechaCreacion: data.fechaCreacion?.toDate() || new Date(),
          fechaActualizacion: data.fechaActualizacion?.toDate() || new Date(),
          fechaInicio: data.fechaInicio?.toDate() || undefined,
          fechaFinalizacion: data.fechaFinalizacion?.toDate() || undefined,
        } as Trabajo;
      });
    } catch (error) {
      console.error("Error al obtener trabajos del vehículo:", error);
      throw error;
    }
  },

  // Obtener un trabajo por ID
  async getById(id: string): Promise<Trabajo | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          fechaCreacion: data.fechaCreacion?.toDate() || new Date(),
          fechaActualizacion: data.fechaActualizacion?.toDate() || new Date(),
          fechaInicio: data.fechaInicio?.toDate() || undefined,
          fechaFinalizacion: data.fechaFinalizacion?.toDate() || undefined,
        } as Trabajo;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener trabajo:", error);
      throw error;
    }
  },

  // Crear un nuevo trabajo
  async create(
    trabajoData: Omit<Trabajo, "id" | "fechaCreacion" | "fechaActualizacion">
  ): Promise<string> {
    try {
      const now = Timestamp.now();
      const cleanedData = cleanUndefined({
        ...trabajoData,
        fechaCreacion: now,
        fechaActualizacion: now,
        fechaInicio: trabajoData.fechaInicio
          ? Timestamp.fromDate(trabajoData.fechaInicio)
          : undefined,
        fechaFinalizacion: trabajoData.fechaFinalizacion
          ? Timestamp.fromDate(trabajoData.fechaFinalizacion)
          : undefined,
      });
      const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanedData);
      return docRef.id;
    } catch (error) {
      console.error("Error al crear trabajo:", error);
      throw error;
    }
  },

  // Actualizar un trabajo
  async update(
    id: string,
    trabajoData: Partial<Omit<Trabajo, "id" | "fechaCreacion" | "fechaActualizacion">>
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const cleanedData = cleanUndefined({
        ...trabajoData,
        fechaActualizacion: Timestamp.now(),
        fechaInicio: trabajoData.fechaInicio
          ? Timestamp.fromDate(trabajoData.fechaInicio)
          : undefined,
        fechaFinalizacion: trabajoData.fechaFinalizacion
          ? Timestamp.fromDate(trabajoData.fechaFinalizacion)
          : undefined,
      });
      await updateDoc(docRef, cleanedData);
    } catch (error) {
      console.error("Error al actualizar trabajo:", error);
      throw error;
    }
  },

  // Eliminar un trabajo
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error al eliminar trabajo:", error);
      throw error;
    }
  },

  // Cambiar estado de un trabajo
  async cambiarEstado(
    id: string,
    nuevoEstado: Trabajo["estado"]
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updates: any = {
        estado: nuevoEstado,
        fechaActualizacion: Timestamp.now(),
      };

      // Si se completa el trabajo, marcar fecha de finalización
      if (nuevoEstado === "completado") {
        updates.fechaFinalizacion = Timestamp.now();
      }

      await updateDoc(docRef, updates);
    } catch (error) {
      console.error("Error al cambiar estado del trabajo:", error);
      throw error;
    }
  },
};
