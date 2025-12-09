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
import { productosService } from "@/services/productos/productosService";
import { tenantCountersService } from "@/services/tenants/tenantCountersService";

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

export const trabajosService = {
  // Generar número de orden único usando contador de Firestore (multitenant)
  async generarNumeroOrden(tenantId: string): Promise<string> {
    return await tenantCountersService.getNextWorkOrderNumber(tenantId);
  },

  // Obtener todos los trabajos (FILTRADO POR TENANT)
  async getAll(tenantId: string): Promise<Trabajo[]> {
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
          fechaInicio: data.fechaInicio?.toDate() || undefined,
          fechaFinalizacion: data.fechaFinalizacion?.toDate() || undefined,
        } as Trabajo;
      });
    } catch (error) {
      console.error("Error al obtener trabajos:", error);
      throw error;
    }
  },

  // Obtener trabajos por cliente (FILTRADO POR TENANT)
  async getByClienteId(clienteId: string, tenantId: string): Promise<Trabajo[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("tenantId", "==", tenantId), // 🏢 FILTRO MULTITENANT
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

  // Obtener trabajos por vehículo (FILTRADO POR TENANT)
  async getByVehiculoId(vehiculoId: string, tenantId: string): Promise<Trabajo[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("tenantId", "==", tenantId), // 🏢 FILTRO MULTITENANT
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

  // Obtener un trabajo por ID (VERIFICAR TENANT)
  async getById(id: string, tenantId: string): Promise<Trabajo | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // 🏢 VERIFICAR QUE PERTENECE AL TENANT
        if (data.tenantId !== tenantId) {
          console.warn(`Trabajo ${id} no pertenece al tenant ${tenantId}`);
          return null;
        }

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

  // Crear un nuevo trabajo (INCLUIR TENANT ID)
  async create(
    trabajoData: Omit<Trabajo, "id" | "fechaCreacion" | "fechaActualizacion">
  ): Promise<string> {
    try {
      // 🏢 Verificar que tenantId está presente
      if (!trabajoData.tenantId) {
        throw new Error("tenantId es requerido para crear un trabajo");
      }

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

  // Actualizar un trabajo (VERIFICAR TENANT)
  async update(
    id: string,
    trabajoData: Partial<Omit<Trabajo, "id" | "fechaCreacion" | "fechaActualizacion">>,
    tenantId: string
  ): Promise<void> {
    try {
      // 🏢 Primero verificar que el trabajo pertenece al tenant
      const existing = await this.getById(id, tenantId);
      if (!existing) {
        throw new Error("Trabajo no encontrado o no pertenece a este tenant");
      }

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

  // Eliminar un trabajo (VERIFICAR TENANT)
  async delete(id: string, tenantId: string): Promise<void> {
    try {
      // 🏢 Primero verificar que el trabajo pertenece al tenant
      const existing = await this.getById(id, tenantId);
      if (!existing) {
        throw new Error("Trabajo no encontrado o no pertenece a este tenant");
      }

      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error al eliminar trabajo:", error);
      throw error;
    }
  },

  // Cambiar estado de un trabajo (VERIFICAR TENANT)
  async cambiarEstado(
    id: string,
    nuevoEstado: Trabajo["estado"],
    tenantId: string
  ): Promise<void> {
    try {
      // 🏢 Primero verificar que el trabajo pertenece al tenant
      const existing = await this.getById(id, tenantId);
      if (!existing) {
        throw new Error("Trabajo no encontrado o no pertenece a este tenant");
      }

      const docRef = doc(db, COLLECTION_NAME, id);
      const updates: any = {
        estado: nuevoEstado,
        fechaActualizacion: Timestamp.now(),
      };

      // Si se completa el trabajo, marcar fecha de finalización y descontar stock
      if (nuevoEstado === "completado") {
        updates.fechaFinalizacion = Timestamp.now();

        // Descontar stock de productos del inventario
        if (existing.items && existing.items.length > 0) {
          for (const item of existing.items) {
            // Solo procesar items que tengan referencia a un producto del inventario
            if (item.productoId) {
              try {
                // Obtener el producto actual
                const producto = await productosService.getById(
                  item.productoId,
                  tenantId
                );

                if (producto) {
                  // Calcular nuevo stock
                  const nuevoStock = producto.stock - item.cantidad;

                  // Actualizar stock del producto
                  await productosService.update(
                    item.productoId,
                    { stock: nuevoStock },
                    tenantId
                  );

                  console.log(
                    `Stock actualizado para producto ${producto.nombre}: ${producto.stock} -> ${nuevoStock}`
                  );
                } else {
                  console.warn(
                    `Producto ${item.productoId} no encontrado para descontar stock`
                  );
                }
              } catch (error) {
                console.error(
                  `Error al descontar stock del producto ${item.productoId}:`,
                  error
                );
                // Continuar con los demás productos aunque uno falle
              }
            }
          }
        }
      }

      await updateDoc(docRef, updates);
    } catch (error) {
      console.error("Error al cambiar estado del trabajo:", error);
      throw error;
    }
  },
};
