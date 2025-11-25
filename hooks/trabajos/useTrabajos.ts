import { useState, useEffect, useCallback, useMemo } from "react";
import { Trabajo } from "@/types";
import { trabajosService } from "@/services/trabajos/trabajosService";

export function useTrabajos(fechaKey?: string) {
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrabajos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trabajosService.getAll();
      setTrabajos(data);
    } catch (err) {
      setError("Error al cargar trabajos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrabajos();
  }, [fetchTrabajos]);

  const createTrabajo = useCallback(
    async (trabajoData: Omit<Trabajo, "id" | "fechaCreacion" | "fechaActualizacion">) => {
      try {
        const id = await trabajosService.create(trabajoData);
        await fetchTrabajos();
        return id;
      } catch (err) {
        console.error("Error al crear trabajo:", err);
        throw err;
      }
    },
    [fetchTrabajos]
  );

  const updateTrabajo = useCallback(
    async (
      id: string,
      trabajoData: Partial<Omit<Trabajo, "id" | "fechaCreacion" | "fechaActualizacion">>
    ) => {
      try {
        await trabajosService.update(id, trabajoData);
        await fetchTrabajos();
      } catch (err) {
        console.error("Error al actualizar trabajo:", err);
        throw err;
      }
    },
    [fetchTrabajos]
  );

  const deleteTrabajo = useCallback(
    async (id: string) => {
      try {
        await trabajosService.delete(id);
        await fetchTrabajos();
      } catch (err) {
        console.error("Error al eliminar trabajo:", err);
        throw err;
      }
    },
    [fetchTrabajos]
  );

  const cambiarEstado = useCallback(
    async (id: string, nuevoEstado: Trabajo["estado"]) => {
      try {
        await trabajosService.cambiarEstado(id, nuevoEstado);
        await fetchTrabajos();
      } catch (err) {
        console.error("Error al cambiar estado:", err);
        throw err;
      }
    },
    [fetchTrabajos]
  );

  const generarNumeroOrden = useCallback(() => {
    return trabajosService.generarNumeroOrden();
  }, []);

  const getById = useCallback(async (id: string) => {
    try {
      return await trabajosService.getById(id);
    } catch (err) {
      console.error("Error al obtener trabajo:", err);
      throw err;
    }
  }, []);

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
