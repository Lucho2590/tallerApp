import { useState, useEffect } from "react";
import { Vehiculo } from "@/types";
import { vehiculosService } from "@/services/vehiculos/vehiculosService";

export function useVehiculos(clienteId?: string) {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehiculos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = clienteId
        ? await vehiculosService.getByClienteId(clienteId)
        : await vehiculosService.getAll();
      setVehiculos(data);
    } catch (err) {
      setError("Error al cargar vehículos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehiculos();
  }, [clienteId]);

  const createVehiculo = async (
    vehiculoData: Omit<Vehiculo, "id" | "fechaCreacion" | "fechaActualizacion">
  ) => {
    try {
      const id = await vehiculosService.create(vehiculoData);
      await fetchVehiculos();
      return id;
    } catch (err) {
      console.error("Error al crear vehículo:", err);
      throw err;
    }
  };

  const updateVehiculo = async (
    id: string,
    vehiculoData: Partial<Omit<Vehiculo, "id" | "fechaCreacion" | "fechaActualizacion">>
  ) => {
    try {
      await vehiculosService.update(id, vehiculoData);
      await fetchVehiculos();
    } catch (err) {
      console.error("Error al actualizar vehículo:", err);
      throw err;
    }
  };

  const deleteVehiculo = async (id: string) => {
    try {
      await vehiculosService.delete(id);
      await fetchVehiculos();
    } catch (err) {
      console.error("Error al eliminar vehículo:", err);
      throw err;
    }
  };

  return {
    vehiculos,
    loading,
    error,
    createVehiculo,
    updateVehiculo,
    deleteVehiculo,
    refetch: fetchVehiculos,
  };
}
