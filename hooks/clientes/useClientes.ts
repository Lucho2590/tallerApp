import { useState, useEffect } from "react";
import { Cliente } from "@/types";
import { clientesService } from "@/services/clientes/clientesService";

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientesService.getAll();
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
  }, []);

  const createCliente = async (
    clienteData: Omit<Cliente, "id" | "fechaCreacion" | "fechaActualizacion">
  ) => {
    try {
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
    try {
      await clientesService.update(id, clienteData);
      await fetchClientes(); // Recargar lista
    } catch (err) {
      console.error("Error al actualizar cliente:", err);
      throw err;
    }
  };

  const deleteCliente = async (id: string) => {
    try {
      await clientesService.delete(id);
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
