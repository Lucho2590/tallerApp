import { useState, useEffect } from "react";
import { Producto } from "@/types";
import { productosService } from "@/services/productos/productosService";
import { useTenant } from "@/contexts/TenantContext"; // 🏢 MULTITENANT

export function useProductos() {
  const { currentTenant } = useTenant(); // 🏢 OBTENER TENANT ACTUAL
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = async () => {
    // 🏢 NO CARGAR SI NO HAY TENANT
    if (!currentTenant) {
      setProductos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await productosService.getAll(currentTenant.id); // 🏢 PASAR TENANT ID
      setProductos(data);
    } catch (err) {
      setError("Error al cargar productos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, [currentTenant?.id]); // 🏢 RECARGAR SI CAMBIA EL TENANT

  const createProducto = async (
    productoData: Omit<Producto, "id" | "fechaCreacion" | "fechaActualizacion">
  ) => {
    if (!currentTenant) {
      throw new Error("No hay tenant seleccionado");
    }

    try {
      // El productoData ya debe incluir tenantId
      const id = await productosService.create(productoData);
      await fetchProductos(); // Recargar lista
      return id;
    } catch (err) {
      console.error("Error al crear producto:", err);
      throw err;
    }
  };

  const updateProducto = async (
    id: string,
    productoData: Partial<Omit<Producto, "id" | "fechaCreacion" | "fechaActualizacion">>
  ) => {
    if (!currentTenant) {
      throw new Error("No hay tenant seleccionado");
    }

    try {
      await productosService.update(id, productoData, currentTenant.id); // 🏢 PASAR TENANT ID
      await fetchProductos(); // Recargar lista
    } catch (err) {
      console.error("Error al actualizar producto:", err);
      throw err;
    }
  };

  const deleteProducto = async (id: string) => {
    if (!currentTenant) {
      throw new Error("No hay tenant seleccionado");
    }

    try {
      await productosService.delete(id, currentTenant.id); // 🏢 PASAR TENANT ID
      await fetchProductos(); // Recargar lista
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      throw err;
    }
  };

  return {
    productos,
    loading,
    error,
    createProducto,
    updateProducto,
    deleteProducto,
    refetch: fetchProductos,
  };
}
