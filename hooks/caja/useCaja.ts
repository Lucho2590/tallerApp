import { useState, useEffect, useMemo } from "react";
import { MovimientoCaja } from "@/types";
import { cajaService } from "@/services/caja/cajaService";
import { useTenant } from "@/contexts/TenantContext"; // 🏢 MULTITENANT

export function useCaja(startDate?: Date, endDate?: Date) {
  const { currentTenant } = useTenant(); // 🏢 OBTENER TENANT ACTUAL
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovimientos = async () => {
    // 🏢 NO CARGAR SI NO HAY TENANT
    if (!currentTenant) {
      setMovimientos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let data: MovimientoCaja[];
      if (startDate && endDate) {
        data = await cajaService.getByDateRange(
          currentTenant.id,
          startDate,
          endDate
        );
      } else {
        data = await cajaService.getAll(currentTenant.id);
      }

      setMovimientos(data);
    } catch (err) {
      setError("Error al cargar movimientos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovimientos();
  }, [currentTenant?.id, startDate?.toDateString(), endDate?.toDateString()]);

  const createMovimiento = async (
    movimientoData: Omit<MovimientoCaja, "id" | "fechaCreacion" | "fechaActualizacion">
  ) => {
    if (!currentTenant) {
      throw new Error("No hay tenant seleccionado");
    }

    try {
      const id = await cajaService.create(movimientoData);
      await fetchMovimientos();
      return id;
    } catch (err) {
      console.error("Error al crear movimiento:", err);
      throw err;
    }
  };

  const updateMovimiento = async (
    id: string,
    movimientoData: Partial<Omit<MovimientoCaja, "id" | "fechaCreacion" | "fechaActualizacion">>
  ) => {
    if (!currentTenant) {
      throw new Error("No hay tenant seleccionado");
    }

    try {
      await cajaService.update(id, movimientoData, currentTenant.id);
      await fetchMovimientos();
    } catch (err) {
      console.error("Error al actualizar movimiento:", err);
      throw err;
    }
  };

  const deleteMovimiento = async (id: string) => {
    if (!currentTenant) {
      throw new Error("No hay tenant seleccionado");
    }

    try {
      await cajaService.delete(id, currentTenant.id);
      await fetchMovimientos();
    } catch (err) {
      console.error("Error al eliminar movimiento:", err);
      throw err;
    }
  };

  // Calcular totales
  const totales = useMemo(() => {
    const ingresos = movimientos
      .filter((m) => m.tipo === "ingreso")
      .reduce((sum, m) => sum + m.monto, 0);

    const egresos = movimientos
      .filter((m) => m.tipo === "egreso")
      .reduce((sum, m) => sum + m.monto, 0);

    return {
      ingresos,
      egresos,
      balance: ingresos - egresos,
    };
  }, [movimientos]);

  return {
    movimientos,
    loading,
    error,
    totales,
    createMovimiento,
    updateMovimiento,
    deleteMovimiento,
    refetch: fetchMovimientos,
  };
}
