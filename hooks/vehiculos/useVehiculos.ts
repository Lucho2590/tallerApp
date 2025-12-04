import { useState, useEffect } from "react";
import { Vehiculo } from "@/types";
import { vehiculosService } from "@/services/vehiculos/vehiculosService";
import { useTenant } from "@/contexts/TenantContext"; // 🏢 MULTITENANT

export function useVehiculos(clienteId?: string) {
  const { currentTenant } = useTenant(); // 🏢 OBTENER TENANT ACTUAL
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehiculos = async () => {
    // 🏢 NO CARGAR SI NO HAY TENANT
    if (!currentTenant) {
      setVehiculos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = clienteId
        ? await vehiculosService.getByClienteId(clienteId, currentTenant.id) // 🏢 PASAR TENANT ID
        : await vehiculosService.getAll(currentTenant.id); // 🏢 PASAR TENANT ID
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
  }, [clienteId, currentTenant?.id]); // 🏢 RECARGAR SI CAMBIA EL TENANT

  const createVehiculo = async (
    vehiculoData: Omit<Vehiculo, "id" | "fechaCreacion" | "fechaActualizacion">
  ) => {
    if (!currentTenant) {
      throw new Error("No hay tenant seleccionado");
    }

    try {
      // El vehiculoData ya debe incluir tenantId
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
    if (!currentTenant) {
      throw new Error("No hay tenant seleccionado");
    }

    try {
      await vehiculosService.update(id, vehiculoData, currentTenant.id); // 🏢 PASAR TENANT ID
      await fetchVehiculos();
    } catch (err) {
      console.error("Error al actualizar vehículo:", err);
      throw err;
    }
  };

  const deleteVehiculo = async (id: string) => {
    if (!currentTenant) {
      throw new Error("No hay tenant seleccionado");
    }

    try {
      await vehiculosService.delete(id, currentTenant.id); // 🏢 PASAR TENANT ID
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
