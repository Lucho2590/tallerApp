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
  // Obtener todos los turnos
  async getAll(): Promise<Turno[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
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

  // Obtener turnos por fecha
  async getByDate(fecha: Date): Promise<Turno[]> {
    try {
      const startOfDay = new Date(fecha);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(fecha);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, COLLECTION_NAME),
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

  // Obtener un turno por ID
  async getById(id: string): Promise<Turno | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
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

  // Crear un nuevo turno
  async create(
    turnoData: Omit<Turno, "id" | "fechaCreacion" | "fechaActualizacion">
  ): Promise<string> {
    try {
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

  // Actualizar un turno
  async update(
    id: string,
    turnoData: Partial<Omit<Turno, "id" | "fechaCreacion" | "fechaActualizacion">>
  ): Promise<void> {
    try {
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

  // Eliminar un turno
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error al eliminar turno:", error);
      throw error;
    }
  },
};
