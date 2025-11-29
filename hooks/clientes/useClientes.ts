import { useState, useEffect } from "react";
import { Cliente } from "@/types";
import { clientesService } from "@/services/clientes/clientesService";
import { useTenant } from "@/contexts/TenantContext"; // 🏢 MULTITENANT

export function useClientes() {
  const { currentTenant } = useTenant(); // 🏢 OBTENER TENANT ACTUAL
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = async () => {
    // 🏢 NO CARGAR SI NO HAY TENANT
    if (!currentTenant) {
      setClientes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await clientesService.getAll(currentTenant.id); // 🏢 PASAR TENANT ID
      setClientes(data);
    } catch (err) {
      setError("Error al cargar clientes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [currentTenant?.id]); // 🏢 RECARGAR SI CAMBIA EL TENANT

  const createCliente = async (
    clienteData: Omit<Cliente, "id" | "fechaCreacion" | "fechaActualizacion">
  ) => {
    if (!currentTenant) {
      throw new Error("No hay tenant seleccionado");
    }

    try {
      // El clienteData ya debe incluir tenantId
      const id = await clientesService.create(clienteData);
      await fetchClientes(); // Recargar lista
      return id;
    } catch (err) {
      console.error("Error al crear cliente:", err);
      throw err;
    }
  };

  const updateCliente = async (
    id: string,
    clienteData: Partial<Omit<Cliente, "id" | "fechaCreacion" | "fechaActualizacion">>
  ) => {
    if (!currentTenant) {
      throw new Error("No hay tenant seleccionado");
    }

    try {
      await clientesService.update(id, clienteData, currentTenant.id); // 🏢 PASAR TENANT ID
      await fetchClientes(); // Recargar lista
    } catch (err) {
      console.error("Error al actualizar cliente:", err);
      throw err;
    }
  };

  const deleteCliente = async (id: string) => {
    if (!currentTenant) {
      throw new Error("No hay tenant seleccionado");
    }

    try {
      await clientesService.delete(id, currentTenant.id); // 🏢 PASAR TENANT ID
      await fetchClientes(); // Recargar lista
    } catch (err) {
      console.error("Error al eliminar cliente:", err);
      throw err;
    }
  };

  return {
    clientes,
    loading,
    error,
    createCliente,
    updateCliente,
    deleteCliente,
    refetch: fetchClientes,
  };
}
