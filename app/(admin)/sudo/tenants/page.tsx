"use client";

import { useEffect, useState } from "react";
import { Search, Building2, Mail, Phone, MapPin, Calendar, Crown, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAllTenants, type AdminTenantData } from "@/services/admin/adminService";

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<AdminTenantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTenants();
      setTenants(data);
    } catch (err) {
      console.error("Error loading tenants:", err);
      setError("Error al cargar talleres");
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const searchLower = searchQuery.toLowerCase();
    return (
      tenant.name.toLowerCase().includes(searchLower) ||
      tenant.email.toLowerCase().includes(searchLower) ||
      (tenant.ownerName && tenant.ownerName.toLowerCase().includes(searchLower)) ||
      (tenant.ownerEmail && tenant.ownerEmail.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-slate-400">Cargando talleres...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Error al cargar talleres</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={loadTenants}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            Talleres
          </h1>
          <p className="text-slate-400 mt-2">
            {tenants.length} talleres registrados
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Talleres Activos
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {tenants.filter(t => t.active).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Talleres Inactivos
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {tenants.filter(t => !t.active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, email o dueño..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {filteredTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  {/* Tenant Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-orange-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-white">
                          {tenant.name}
                        </h3>
                        {tenant.active ? (
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactivo
                          </Badge>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-400 mb-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          {tenant.email}
                        </div>

                        {tenant.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            {tenant.phone}
                          </div>
                        )}

                        {tenant.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            {tenant.address.city}, {tenant.address.state}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          Creado: {tenant.createdAt.toLocaleDateString('es-AR')}
                        </div>
                      </div>

                      {/* Owner */}
                      <div className="mt-4 pt-4 border-t border-slate-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="h-4 w-4 text-orange-400" />
                          <span className="text-sm font-medium text-slate-300">Dueño</span>
                        </div>
                        {tenant.ownerName ? (
                          <div className="ml-6">
                            <p className="text-sm text-white">{tenant.ownerName}</p>
                            {tenant.ownerEmail && (
                              <p className="text-xs text-slate-400">{tenant.ownerEmail}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 ml-6">Sin dueño asignado</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredTenants.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No se encontraron talleres</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
