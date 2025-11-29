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
import { Cliente } from "@/types";

const COLLECTION_NAME = "clientes";

export const clientesService = {
  // Obtener todos los clientes (FILTRADO POR TENANT)
  async getAll(tenantId: string): Promise<Cliente[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("tenantId", "==", tenantId), // 🏢 FILTRO MULTITENANT
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

  // Obtener un cliente por ID (VERIFICAR TENANT)
  async getById(id: string, tenantId: string): Promise<Cliente | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // 🏢 VERIFICAR QUE PERTENECE AL TENANT
        if (data.tenantId !== tenantId) {
          console.warn(`Cliente ${id} no pertenece al tenant ${tenantId}`);
          return null;
        }

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

  // Crear un nuevo cliente (INCLUIR TENANT ID)
  async create(
    clienteData: Omit<Cliente, "id" | "fechaCreacion" | "fechaActualizacion">
  ): Promise<string> {
    try {
      // 🏢 Verificar que tenantId está presente
      if (!clienteData.tenantId) {
        throw new Error("tenantId es requerido para crear un cliente");
      }

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

  // Actualizar un cliente (VERIFICAR TENANT)
  async update(
    id: string,
    clienteData: Partial<Omit<Cliente, "id" | "fechaCreacion" | "fechaActualizacion">>,
    tenantId: string
  ): Promise<void> {
    try {
      // 🏢 Primero verificar que el cliente pertenece al tenant
      const existing = await this.getById(id, tenantId);
      if (!existing) {
        throw new Error("Cliente no encontrado o no pertenece a este tenant");
      }

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

  // Eliminar un cliente (VERIFICAR TENANT)
  async delete(id: string, tenantId: string): Promise<void> {
    try {
      // 🏢 Primero verificar que el cliente pertenece al tenant
      const existing = await this.getById(id, tenantId);
      if (!existing) {
        throw new Error("Cliente no encontrado o no pertenece a este tenant");
      }

      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      throw error;
    }
  },
};
