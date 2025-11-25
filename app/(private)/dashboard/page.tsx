"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Car, Calendar, Wrench, Plus } from "lucide-react";
import { useClientes } from "@/hooks/clientes/useClientes";
import { useVehiculos } from "@/hooks/vehiculos/useVehiculos";
import { useTurnos } from "@/hooks/agenda/useTurnos";
import { useTrabajos } from "@/hooks/trabajos/useTrabajos";
import { EstadoTrabajo } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { clientes } = useClientes();
  const { vehiculos } = useVehiculos();

  // Obtener turnos de hoy
  const hoy = new Date();
  const { turnos: turnosHoy } = useTurnos(hoy);

  const { trabajos } = useTrabajos();

  // Calcular trabajos activos (pendientes + en progreso)
  const trabajosActivos = useMemo(() => {
    return trabajos.filter(
      (t) =>
        t.estado === EstadoTrabajo.PENDIENTE ||
        t.estado === EstadoTrabajo.EN_PROGRESO
    ).length;
  }, [trabajos]);

  // Métricas en el orden especificado
  const metrics = [
    {
      title: "Turnos de Hoy",
      value: turnosHoy.length.toString(),
      icon: Calendar,
      description: "Turnos programados para hoy",
      clickable: true,
      onClick: () => router.push("/agenda"),
      showButton: true,
      buttonText: "Nuevo Turno",
      onButtonClick: () => router.push("/agenda"),
    },
    {
      title: "Vehículos",
      value: vehiculos.length.toString(),
      icon: Car,
      description: "Vehículos en sistema",
      clickable: false,
    },
    {
      title: "Clientes Totales",
      value: clientes.length.toString(),
      icon: Users,
      description: "Total de clientes registrados",
      clickable: false,
    },
    {
      title: "Trabajos Activos",
      value: trabajosActivos.toString(),
      icon: Wrench,
      description: "Trabajos en progreso",
      clickable: false,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido al sistema de gestión Taller App
        </p>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.title}
              className={metric.clickable ? "cursor-pointer hover:shadow-lg transition-shadow" : ""}
              onClick={metric.clickable && metric.onClick ? metric.onClick : undefined}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>

                {/* Botón en la esquina inferior derecha */}
                {metric.showButton && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Evitar que active el onClick de la card
                        if (metric.onButtonClick) {
                          metric.onButtonClick();
                        }
                      }}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {metric.buttonText}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Vista rápida de agenda */}
      <Card>
        <CardHeader>
          <CardTitle>Agenda de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          {turnosHoy.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay turnos programados para hoy</p>
              <p className="text-sm mt-2">
                Los turnos aparecerán aquí cuando sean creados
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push("/agenda")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Turno
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {turnosHoy.slice(0, 5).map((turno) => (
                <div
                  key={turno.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{turno.descripcion}</p>
                      <p className="text-xs text-muted-foreground">
                        {turno.horaInicio} - {turno.horaFin}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      turno.estado === "completado"
                        ? "bg-green-100 text-green-800"
                        : turno.estado === "en_progreso"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {turno.estado === "completado"
                      ? "Completado"
                      : turno.estado === "en_progreso"
                      ? "En Progreso"
                      : "Pendiente"}
                  </div>
                </div>
              ))}
              {turnosHoy.length > 5 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/agenda")}
                >
                  Ver todos los turnos ({turnosHoy.length})
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trabajos recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Trabajos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {trabajos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay trabajos registrados</p>
              <p className="text-sm mt-2">
                Los trabajos recientes aparecerán aquí
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push("/trabajos/nuevo")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Trabajo
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {trabajos.slice(0, 5).map((trabajo) => (
                <div
                  key={trabajo.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/trabajos/${trabajo.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <Wrench className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-sm font-mono">
                        {trabajo.numero}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {trabajo.descripcionGeneral || "Sin descripción"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">
                      ${trabajo.total.toFixed(2)}
                    </span>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        trabajo.estado === EstadoTrabajo.COMPLETADO
                          ? "bg-green-100 text-green-800"
                          : trabajo.estado === EstadoTrabajo.EN_PROGRESO
                          ? "bg-blue-100 text-blue-800"
                          : trabajo.estado === EstadoTrabajo.CANCELADO
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {trabajo.estado === EstadoTrabajo.COMPLETADO
                        ? "Completado"
                        : trabajo.estado === EstadoTrabajo.EN_PROGRESO
                        ? "En Progreso"
                        : trabajo.estado === EstadoTrabajo.CANCELADO
                        ? "Cancelado"
                        : "Pendiente"}
                    </div>
                  </div>
                </div>
              ))}
              {trabajos.length > 5 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/trabajos")}
                >
                  Ver todos los trabajos ({trabajos.length})
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
