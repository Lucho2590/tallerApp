"use client"

import { useEffect, useState } from "react"
import {
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  Building2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { getAllUsers, AdminUserData } from "@/services/admin/adminService"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

// Extended interface with tenant names
interface AdminUserWithTenants extends AdminUserData {
  tenantsWithNames: {
    tenantId: string
    tenantName: string
    role: string
  }[]
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserWithTenants[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const usersData = await getAllUsers()

      // Enrich users with tenant names
      const usersWithTenantNames = await Promise.all(
        usersData.map(async (user) => {
          // Ensure tenants is an array
          const tenantsArray = Array.isArray(user.tenants) ? user.tenants : []

          const tenantsWithNames = await Promise.all(
            tenantsArray.map(async (tenantRelation) => {
              try {
                const tenantDoc = await getDoc(doc(db, "tenants", tenantRelation.tenantId))
                const tenantName = tenantDoc.exists() ? tenantDoc.data()?.name : "Desconocido"
                return {
                  tenantId: tenantRelation.tenantId,
                  tenantName,
                  role: tenantRelation.role
                }
              } catch (err) {
                return {
                  tenantId: tenantRelation.tenantId,
                  tenantName: "Error",
                  role: tenantRelation.role
                }
              }
            })
          )

          return {
            ...user,
            tenantsWithNames
          }
        })
      )

      setUsers(usersWithTenantNames)
    } catch (err) {
      console.error("Error loading users:", err)
      setError("Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive)

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <UserX className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error al cargar usuarios</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={loadUsers}
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
          Usuarios
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestión de usuarios del sistema
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {users.filter(u => u.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Inactivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {users.filter(u => !u.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Super Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">
              {users.filter(u => u.isSuperAdmin).length}
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
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                className={filterStatus === "all" ? "bg-orange-600 hover:bg-orange-700" : "border-slate-700"}
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === "active" ? "default" : "outline"}
                onClick={() => setFilterStatus("active")}
                className={filterStatus === "active" ? "bg-orange-600 hover:bg-orange-700" : "border-slate-700"}
              >
                Activos
              </Button>
              <Button
                variant={filterStatus === "inactive" ? "default" : "outline"}
                onClick={() => setFilterStatus("inactive")}
                className={filterStatus === "inactive" ? "bg-orange-600 hover:bg-orange-700" : "border-slate-700"}
              >
                Inactivos
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  {/* User Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="relative h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt={`${user.nombre} ${user.apellido}`}
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-medium text-slate-400">
                          {user.nombre[0]}{user.apellido[0]}
                        </span>
                      )}
                      {user.isActive && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-slate-900" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">
                          {user.nombre} {user.apellido}
                        </h3>
                        {user.isSuperAdmin && (
                          <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                            <Shield className="h-3 w-3 mr-1" />
                            Super Admin
                          </Badge>
                        )}
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" />
                              Activo
                            </>
                          ) : (
                            <>
                              <UserX className="h-3 w-3 mr-1" />
                              Inactivo
                            </>
                          )}
                        </Badge>
                      </div>

                      <div className="flex flex-col gap-1 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {user.createdAt ? (
                            <>
                              Creado: {user.createdAt.toLocaleDateString('es-AR')}
                              {user.lastLogin && (
                                <span className="ml-4">
                                  Último login: {user.lastLogin.toLocaleDateString('es-AR')}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-500">Fecha de creación no disponible</span>
                          )}
                        </div>

                        {user.tenantsWithNames.length > 0 && (
                          <div className="flex items-start gap-2 mt-2">
                            <Building2 className="h-3 w-3 mt-1 flex-shrink-0" />
                            <div className="flex flex-wrap gap-2">
                              {user.tenantsWithNames.map((tenant, idx) => (
                                <Badge key={idx} variant="outline" className="border-slate-700">
                                  {tenant.tenantName} ({tenant.role})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">No se encontraron usuarios</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
