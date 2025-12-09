"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Users,
  Building2,
  TrendingUp,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { adminService, AdminStats } from "@/services/admin/adminService"

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTenants: 0,
    activeTenants: 0,
    inactiveTenants: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getSystemStats()
      setStats(data)
    } catch (err) {
      console.error("Error loading stats:", err)
      setError("Error al cargar las estadísticas")
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Usuarios",
      value: stats.totalUsers,
      description: "Usuarios registrados",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Total Talleres",
      value: stats.totalTenants,
      description: `${stats.activeTenants} activos`,
      icon: Building2,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      title: "Talleres Activos",
      value: stats.activeTenants,
      description: "Talleres en funcionamiento",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Talleres Inactivos",
      value: stats.inactiveTenants,
      description: "Talleres desactivados",
      icon: Activity,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error al cargar datos</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={loadStats}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
          Panel de Administración
        </h1>
        <p className="text-muted-foreground mt-2">
          Vista general del sistema
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="bg-slate-900/50 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Acciones Rápidas</CardTitle>
          <CardDescription>Administración del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/sudo/users" className="p-4 rounded-lg border border-slate-700 hover:border-orange-500 transition-colors text-left group">
              <Users className="h-5 w-5 text-orange-400 mb-2" />
              <h3 className="font-medium text-white group-hover:text-orange-400 transition-colors">
                Ver Usuarios
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Administrar usuarios del sistema
              </p>
            </Link>

            <Link href="/sudo/organizations" className="p-4 rounded-lg border border-slate-700 hover:border-orange-500 transition-colors text-left group">
              <Building2 className="h-5 w-5 text-orange-400 mb-2" />
              <h3 className="font-medium text-white group-hover:text-orange-400 transition-colors">
                Ver Talleres
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Gestionar talleres registrados
              </p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
