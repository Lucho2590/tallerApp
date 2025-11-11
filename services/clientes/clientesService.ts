import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Cliente } from "@/types";

const COLLECTION_NAME = "clientes";

export const clientesService = {
  // Obtener todos los clientes
  async getAll(): Promise<Cliente[]> {
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
        } as Cliente;
      });
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      throw error;
    }
  },

  // Obtener un cliente por ID
  async getById(id: string): Promise<Cliente | null> {
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
        } as Cliente;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener cliente:", error);
      throw error;
    }
  },

  // Crear un nuevo cliente
  async create(
    clienteData: Omit<Cliente, "id" | "fechaCreacion" | "fechaActualizacion">
  ): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...clienteData,
        fechaCreacion: now,
        fechaActualizacion: now,
      });
      return docRef.id;
    } catch (error) {
      console.error("Error al crear cliente:", error);
      throw error;
    }
  },

  // Actualizar un cliente
  async update(
    id: string,
    clienteData: Partial<Omit<Cliente, "id" | "fechaCreacion" | "fechaActualizacion">>
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...clienteData,
        fechaActualizacion: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      throw error;
    }
  },

  // Eliminar un cliente
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      throw error;
    }
  },
};
