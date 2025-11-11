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
import { Vehiculo } from "@/types";

const COLLECTION_NAME = "vehiculos";

export const vehiculosService = {
  // Obtener todos los vehículos
  async getAll(): Promise<Vehiculo[]> {
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
        } as Vehiculo;
      });
    } catch (error) {
      console.error("Error al obtener vehículos:", error);
      throw error;
    }
  },

  // Obtener vehículos por cliente
  async getByClienteId(clienteId: string): Promise<Vehiculo[]> {
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
        } as Vehiculo;
      });
    } catch (error) {
      console.error("Error al obtener vehículos del cliente:", error);
      throw error;
    }
  },

  // Obtener un vehículo por ID
  async getById(id: string): Promise<Vehiculo | null> {
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
        } as Vehiculo;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener vehículo:", error);
      throw error;
    }
  },

  // Crear un nuevo vehículo
  async create(
    vehiculoData: Omit<Vehiculo, "id" | "fechaCreacion" | "fechaActualizacion">
  ): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...vehiculoData,
        fechaCreacion: now,
        fechaActualizacion: now,
      });
      return docRef.id;
    } catch (error) {
      console.error("Error al crear vehículo:", error);
      throw error;
    }
  },

  // Actualizar un vehículo
  async update(
    id: string,
    vehiculoData: Partial<Omit<Vehiculo, "id" | "fechaCreacion" | "fechaActualizacion">>
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...vehiculoData,
        fechaActualizacion: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error al actualizar vehículo:", error);
      throw error;
    }
  },

  // Eliminar un vehículo
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error al eliminar vehículo:", error);
      throw error;
    }
  },
};
