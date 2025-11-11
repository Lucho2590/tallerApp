"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, Calendar, Wrench } from "lucide-react";

export default function DashboardPage() {
  // Estas métricas serán dinámicas una vez que implementemos Firebase
  const metrics = [
    {
      title: "Clientes Totales",
      value: "0",
      icon: Users,
      description: "Total de clientes registrados",
    },
    {
      title: "Vehículos",
      value: "0",
      icon: Car,
      description: "Vehículos en sistema",
    },
    {
      title: "Turnos Hoy",
      value: "0",
      icon: Calendar,
      description: "Turnos programados para hoy",
    },
    {
      title: "Trabajos Activos",
      value: "0",
      icon: Wrench,
      description: "Trabajos en progreso",
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
            <Card key={metric.title}>
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
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay turnos programados para hoy</p>
            <p className="text-sm mt-2">
              Los turnos aparecerán aquí cuando sean creados
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trabajos recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Trabajos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay trabajos registrados</p>
            <p className="text-sm mt-2">
              Los trabajos recientes aparecerán aquí
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
