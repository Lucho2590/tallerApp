import { useState, useEffect } from "react";
import { Turno } from "@/types";
import { turnosService } from "@/services/agenda/turnosService";

export function useTurnos(fecha?: Date) {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTurnos = async () => {
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
  };

  useEffect(() => {
    fetchTurnos();
  }, [fecha?.toDateString()]);

  const createTurno = async (
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
  };

  const updateTurno = async (
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
  };

  const deleteTurno = async (id: string) => {
    try {
      await turnosService.delete(id);
      await fetchTurnos();
    } catch (err) {
      console.error("Error al eliminar turno:", err);
      throw err;
    }
  };

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
