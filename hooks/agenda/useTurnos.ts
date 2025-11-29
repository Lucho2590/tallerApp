import { useState, useEffect, useCallback, useMemo } from "react";
import { Turno } from "@/types";
import { turnosService } from "@/services/agenda/turnosService";
import { useTenant } from "@/contexts/TenantContext"; // 🏢 MULTITENANT

export function useTurnos(fecha?: Date) {
  const { currentTenant } = useTenant(); // 🏢 OBTENER TENANT ACTUAL
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoizar la fecha como string para evitar re-renders innecesarios
  const fechaKey = useMemo(() => fecha?.toDateString(), [fecha?.toDateString()]);

  const fetchTurnos = useCallback(async () => {
    // 🏢 NO CARGAR SI NO HAY TENANT
    if (!currentTenant) {
      setTurnos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = fecha
        ? await turnosService.getByDate(fecha, currentTenant.id) // 🏢 PASAR TENANT ID
        : await turnosService.getAll(currentTenant.id); // 🏢 PASAR TENANT ID
      setTurnos(data);
    } catch (err) {
      setError("Error al cargar turnos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fechaKey, currentTenant?.id]); // 🏢 AGREGAR TENANT A DEPENDENCIAS

  useEffect(() => {
    fetchTurnos();
  }, [fetchTurnos]);

  const createTurno = useCallback(async (
    turnoData: Omit<Turno, "id" | "fechaCreacion" | "fechaActualizacion">
  ) => {
    if (!currentTenant) {
      throw new Error("No hay tenant seleccionado");
    }

    try {
      // El turnoData ya debe incluir tenantId
      const id = await turnosService.create(turnoData);
      await fetchTurnos();
      return id;
    } catch (err) {
      console.error("Error al crear turno:", err);
      throw err;
    }
  }, [fetchTurnos, currentTenant]);

  const updateTurno = useCallback(async (
    id: string,
    turnoData: Partial<Omit<Turno, "id" | "fechaCreacion" | "fechaActualizacion">>
  ) => {
    if (!currentTenant) {
      throw new Error("No hay tenant seleccionado");
    }

    try {
      await turnosService.update(id, turnoData, currentTenant.id); // 🏢 PASAR TENANT ID
      await fetchTurnos();
    } catch (err) {
      console.error("Error al actualizar turno:", err);
      throw err;
    }
  }, [fetchTurnos, currentTenant]);

  const deleteTurno = useCallback(async (id: string) => {
    if (!currentTenant) {
      throw new Error("No hay tenant seleccionado");
    }

    try {
      await turnosService.delete(id, currentTenant.id); // 🏢 PASAR TENANT ID
      await fetchTurnos();
    } catch (err) {
      console.error("Error al eliminar turno:", err);
      throw err;
    }
  }, [fetchTurnos, currentTenant]);

  return {
    turnos,
    loading,
    error,
    createTurno,
    updateTurno,
    deleteTurno,
    refetch: fetchTurnos,
  };
}
