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
import { Producto } from "@/types";

const COLLECTION_NAME = "productos";

export const productosService = {
  // Obtener todos los productos (FILTRADO POR TENANT)
  async getAll(tenantId: string): Promise<Producto[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("tenantId", "==", tenantId), // 🏢 FILTRO MULTITENANT
        orderBy("nombre", "asc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          fechaCreacion: data.fechaCreacion?.toDate() || new Date(),
          fechaActualizacion: data.fechaActualizacion?.toDate() || new Date(),
        } as Producto;
      });
    } catch (error) {
      console.error("Error al obtener productos:", error);
      throw error;
    }
  },

  // Obtener un producto por ID (VERIFICAR TENANT)
  async getById(id: string, tenantId: string): Promise<Producto | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // 🏢 VERIFICAR QUE PERTENECE AL TENANT
        if (data.tenantId !== tenantId) {
          console.warn(`Producto ${id} no pertenece al tenant ${tenantId}`);
          return null;
        }

        return {
          id: docSnap.id,
          ...data,
          fechaCreacion: data.fechaCreacion?.toDate() || new Date(),
          fechaActualizacion: data.fechaActualizacion?.toDate() || new Date(),
        } as Producto;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener producto:", error);
      throw error;
    }
  },

  // Crear un nuevo producto (INCLUIR TENANT ID)
  async create(
    productoData: Omit<Producto, "id" | "fechaCreacion" | "fechaActualizacion">
  ): Promise<string> {
    try {
      // 🏢 Verificar que tenantId está presente
      if (!productoData.tenantId) {
        throw new Error("tenantId es requerido para crear un producto");
      }

      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...productoData,
        fechaCreacion: now,
        fechaActualizacion: now,
      });
      return docRef.id;
    } catch (error) {
      console.error("Error al crear producto:", error);
      throw error;
    }
  },

  // Actualizar un producto (VERIFICAR TENANT)
  async update(
    id: string,
    productoData: Partial<Omit<Producto, "id" | "fechaCreacion" | "fechaActualizacion">>,
    tenantId: string
  ): Promise<void> {
    try {
      // 🏢 Primero verificar que el producto pertenece al tenant
      const existing = await this.getById(id, tenantId);
      if (!existing) {
        throw new Error("Producto no encontrado o no pertenece a este tenant");
      }

      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...productoData,
        fechaActualizacion: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      throw error;
    }
  },

  // Eliminar un producto (VERIFICAR TENANT)
  async delete(id: string, tenantId: string): Promise<void> {
    try {
      // 🏢 Primero verificar que el producto pertenece al tenant
      const existing = await this.getById(id, tenantId);
      if (!existing) {
        throw new Error("Producto no encontrado o no pertenece a este tenant");
      }

      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      throw error;
    }
  },

  // Obtener productos con stock bajo (FILTRADO POR TENANT)
  async getStockBajo(tenantId: string): Promise<Producto[]> {
    try {
      const productos = await this.getAll(tenantId);
      return productos.filter((p) => {
        const minimo = p.stockMinimo || 0;
        return p.stock <= minimo && p.activo;
      });
    } catch (error) {
      console.error("Error al obtener productos con stock bajo:", error);
      throw error;
    }
  },

  // Obtener productos por categoría (FILTRADO POR TENANT)
  async getByCategoria(tenantId: string, categoria: string): Promise<Producto[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("tenantId", "==", tenantId),
        where("categoria", "==", categoria),
        orderBy("nombre", "asc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          fechaCreacion: data.fechaCreacion?.toDate() || new Date(),
          fechaActualizacion: data.fechaActualizacion?.toDate() || new Date(),
        } as Producto;
      });
    } catch (error) {
      console.error("Error al obtener productos por categoría:", error);
      throw error;
    }
  },
};
