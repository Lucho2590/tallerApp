import { useState, useEffect, useCallback, useMemo } from "react";
import { Turno } from "@/types";
import { turnosService } from "@/services/agenda/turnosService";

export function useTurnos(fecha?: Date) {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoizar la fecha como string para evitar re-renders innecesarios
  const fechaKey = useMemo(() => fecha?.toDateString(), [fecha?.toDateString()]);

  const fetchTurnos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = fecha
        ? await turnosService.getByDate(fecha)
        : await turnosService.getAll();
      setTurnos(data);
    } catch (err) {
      setError("Error al cargar turnos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fechaKey]);

  useEffect(() => {
    fetchTurnos();
  }, [fetchTurnos]);

  const createTurno = useCallback(async (
    turnoData: Omit<Turno, "id" | "fechaCreacion" | "fechaActualizacion">
  ) => {
    try {
      const id = await turnosService.create(turnoData);
      await fetchTurnos();
      return id;
    } catch (err) {
      console.error("Error al crear turno:", err);
      throw err;
    }
  }, [fetchTurnos]);

  const updateTurno = useCallback(async (
    id: string,
    turnoData: Partial<Omit<Turno, "id" | "fechaCreacion" | "fechaActualizacion">>
  ) => {
    try {
      await turnosService.update(id, turnoData);
      await fetchTurnos();
    } catch (err) {
      console.error("Error al actualizar turno:", err);
      throw err;
    }
  }, [fetchTurnos]);

  const deleteTurno = useCallback(async (id: string) => {
    try {
      await turnosService.delete(id);
      await fetchTurnos();
    } catch (err) {
      console.error("Error al eliminar turno:", err);
      throw err;
    }
  }, [fetchTurnos]);

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
