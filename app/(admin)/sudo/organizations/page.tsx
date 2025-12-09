"use client"

import { useEffect, useState } from "react"
import {
  Search,
  Building2,
  Users,
  Crown,
  Calendar,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  MoreVertical,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getAllOrganizations, AdminTenantData } from "@/services/admin/adminService"

const planColors = {
  trial: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  basic: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  premium: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  enterprise: "text-green-400 bg-green-500/10 border-green-500/20"
}

const planNames = {
  trial: "Trial",
  basic: "Basic",
  premium: "Premium",
  enterprise: "Enterprise"
}

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<AdminTenantData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPlan, setFilterPlan] = useState<"all" | "trial" | "basic" | "premium" | "enterprise">("all")

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllOrganizations()
      setOrganizations(data)
    } catch (err) {
      console.error("Error loading organizations:", err)
      setError("Error al cargar organizaciones")
    } finally {
      setLoading(false)
    }
  }


  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (org.owner?.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (org.owner?.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

    const matchesFilter = filterPlan === "all" || org.plan === filterPlan

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando organizaciones...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error al cargar organizaciones</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={loadOrganizations}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
          Organizaciones
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestión de talleres y empresas
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{organizations.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {organizations.filter(o => o.active).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              En Trial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {organizations.filter(o => o.plan === "trial").length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Premium+
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">
              {organizations.filter(o => o.plan === "premium" || o.plan === "enterprise").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar organización..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterPlan === "all" ? "default" : "outline"}
                onClick={() => setFilterPlan("all")}
                className={filterPlan === "all" ? "bg-orange-600 hover:bg-orange-700" : "border-slate-700"}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={filterPlan === "trial" ? "default" : "outline"}
                onClick={() => setFilterPlan("trial")}
                className={filterPlan === "trial" ? "bg-orange-600 hover:bg-orange-700" : "border-slate-700"}
                size="sm"
              >
                Trial
              </Button>
              <Button
                variant={filterPlan === "basic" ? "default" : "outline"}
                onClick={() => setFilterPlan("basic")}
                className={filterPlan === "basic" ? "bg-orange-600 hover:bg-orange-700" : "border-slate-700"}
                size="sm"
              >
                Basic
              </Button>
              <Button
                variant={filterPlan === "premium" ? "default" : "outline"}
                onClick={() => setFilterPlan("premium")}
                className={filterPlan === "premium" ? "bg-orange-600 hover:bg-orange-700" : "border-slate-700"}
                size="sm"
              >
                Premium
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {filteredOrganizations.map((org) => (
              <div
                key={org.id}
                className="p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  {/* Organization Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-orange-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-white">
                          {org.name}
                        </h3>
                        <Badge className={planColors[org.plan]}>
                          <CreditCard className="h-3 w-3 mr-1" />
                          {planNames[org.plan]}
                        </Badge>
                        {org.active ? (
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Activa
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactiva
                          </Badge>
                        )}
                      </div>

                      {org.legalName && (
                        <p className="text-sm text-slate-400 mb-3">{org.legalName}</p>
                      )}

                      <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          {org.email}
                        </div>

                        {org.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            {org.phone}
                          </div>
                        )}

                        {org.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            {org.address.city}, {org.address.state}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          Creada: {org.createdAt.toLocaleDateString('es-AR')}
                        </div>
                      </div>

                      {org.trialEndsAt && (
                        <div className="mt-3">
                          <Badge variant="outline" className="border-purple-500/20 text-purple-400">
                            Trial termina: {org.trialEndsAt.toLocaleDateString('es-AR')}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>

                {/* Owner and Employees */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Owner */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-medium text-slate-300">Dueño</span>
                      </div>
                      {org.owner ? (
                        <div className="ml-6">
                          <p className="text-sm text-white">
                            {org.owner.nombre} {org.owner.apellido}
                          </p>
                          <p className="text-xs text-slate-400">{org.owner.email}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 ml-6">Sin dueño asignado</p>
                      )}
                    </div>

                    {/* Employees */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-slate-300">
                          Empleados ({org.employees.length})
                        </span>
                      </div>
                      {org.employees.length > 0 ? (
                        <div className="ml-6 space-y-1">
                          {org.employees.map((emp) => (
                            <div key={emp.id} className="flex items-center justify-between">
                              <p className="text-sm text-white">
                                {emp.nombre} {emp.apellido}
                              </p>
                              <Badge variant="outline" className="border-slate-700 text-xs">
                                {emp.role}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 ml-6">Sin empleados</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredOrganizations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">No se encontraron organizaciones</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
