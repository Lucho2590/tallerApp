import { useState, useEffect, useCallback, useMemo } from "react";
import { Trabajo } from "@/types";
import { trabajosService } from "@/services/trabajos/trabajosService";
import { useTenant } from "@/contexts/TenantContext"; // 🏢 MULTITENANT

export function useTrabajos(fechaKey?: string) {
  const { currentTenant } = useTenant(); // 🏢 OBTENER TENANT ACTUAL
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrabajos = useCallback(async () => {
    // 🏢 NO CARGAR SI NO HAY TENANT
    if (!currentTenant) {
      setTrabajos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await trabajosService.getAll(currentTenant.id); // 🏢 PASAR TENANT ID
      setTrabajos(data);
    } catch (err) {
      setError("Error al cargar trabajos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchTrabajos();
  }, [fetchTrabajos]);

  const createTrabajo = useCallback(
    async (trabajoData: Omit<Trabajo, "id" | "fechaCreacion" | "fechaActualizacion">) => {
      if (!currentTenant) {
        throw new Error("No hay tenant seleccionado");
      }

      try {
        // El trabajoData ya debe incluir tenantId
        const id = await trabajosService.create(trabajoData);
        await fetchTrabajos();
        return id;
      } catch (err) {
        console.error("Error al crear trabajo:", err);
        throw err;
      }
    },
    [fetchTrabajos, currentTenant]
  );

  const updateTrabajo = useCallback(
    async (
      id: string,
      trabajoData: Partial<Omit<Trabajo, "id" | "fechaCreacion" | "fechaActualizacion">>
    ) => {
      if (!currentTenant) {
        throw new Error("No hay tenant seleccionado");
      }

      try {
        await trabajosService.update(id, trabajoData, currentTenant.id); // 🏢 PASAR TENANT ID
        await fetchTrabajos();
      } catch (err) {
        console.error("Error al actualizar trabajo:", err);
        throw err;
      }
    },
    [fetchTrabajos, currentTenant]
  );

  const deleteTrabajo = useCallback(
    async (id: string) => {
      if (!currentTenant) {
        throw new Error("No hay tenant seleccionado");
      }

      try {
        await trabajosService.delete(id, currentTenant.id); // 🏢 PASAR TENANT ID
        await fetchTrabajos();
      } catch (err) {
        console.error("Error al eliminar trabajo:", err);
        throw err;
      }
    },
    [fetchTrabajos, currentTenant]
  );

  const cambiarEstado = useCallback(
    async (id: string, nuevoEstado: Trabajo["estado"]) => {
      if (!currentTenant) {
        throw new Error("No hay tenant seleccionado");
      }

      try {
        await trabajosService.cambiarEstado(id, nuevoEstado, currentTenant.id); // 🏢 PASAR TENANT ID
        await fetchTrabajos();
      } catch (err) {
        console.error("Error al cambiar estado:", err);
        throw err;
      }
    },
    [fetchTrabajos, currentTenant]
  );

  const generarNumeroOrden = useCallback(async () => {
    if (!currentTenant) {
      throw new Error("No hay tenant seleccionado");
    }
    return await trabajosService.generarNumeroOrden(currentTenant.id); // 🏢 PASAR TENANT ID
  }, [currentTenant]);

  const getById = useCallback(async (id: string) => {
    if (!currentTenant) {
      throw new Error("No hay tenant seleccionado");
    }

    try {
      return await trabajosService.getById(id, currentTenant.id); // 🏢 PASAR TENANT ID
    } catch (err) {
      console.error("Error al obtener trabajo:", err);
      throw err;
    }
  }, [currentTenant]);

  return {
    trabajos,
    loading,
    error,
    createTrabajo,
    updateTrabajo,
    deleteTrabajo,
    cambiarEstado,
    generarNumeroOrden,
    getById,
    refetch: fetchTrabajos,
  };
}
