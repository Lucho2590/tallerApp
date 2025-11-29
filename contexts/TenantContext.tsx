"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Tenant, TenantRole } from "@/types/tenant";

interface TenantContextType {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  currentRole: TenantRole | null;
  switchTenant: (tenantId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentRole, setCurrentRole] = useState<TenantRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's tenants when user changes
  useEffect(() => {
    if (!user) {
      setCurrentTenant(null);
      setTenants([]);
      setCurrentRole(null);
      setLoading(false);
      return;
    }

    loadUserTenants();
  }, [user]);

  const loadUserTenants = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implementar en Fase 2
      // Por ahora, crear un tenant mock para que la app siga funcionando
      const mockTenant: Tenant = {
        id: "default-tenant",
        name: "Mi Taller",
        email: user?.email || "",
        plan: "basic" as any,
        active: true,
        config: {
          maxUsers: 5,
          maxClients: 500,
          maxVehicles: 500,
          maxMonthlyJobs: 100,
          modules: [] as any,
          features: [] as any,
        },
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
        timezone: "America/Argentina/Buenos_Aires",
        locale: "es-AR",
        currency: "ARS",
      };

      setTenants([mockTenant]);
      setCurrentTenant(mockTenant);
      setCurrentRole("admin" as TenantRole);
      setLoading(false);

      // TODO: Fase 2 - Cargar tenants reales desde Firebase
      // const userTenants = await tenantsService.getUserTenants(user.id);
      // setTenants(userTenants);
      //
      // // Set current tenant from localStorage or first tenant
      // const savedTenantId = localStorage.getItem("currentTenantId");
      // const currentTenant = userTenants.find(t => t.id === savedTenantId) || userTenants[0];
      // setCurrentTenant(currentTenant);
      //
      // // Get user's role in current tenant
      // const relation = user.tenants?.find(t => t.tenantId === currentTenant.id);
      // setCurrentRole(relation?.role || null);
    } catch (err) {
      console.error("Error loading tenants:", err);
      setError("Error al cargar los talleres");
      setLoading(false);
    }
  };

  const switchTenant = async (tenantId: string) => {
    try {
      setError(null);

      const tenant = tenants.find((t) => t.id === tenantId);
      if (!tenant) {
        throw new Error("Taller no encontrado");
      }

      setCurrentTenant(tenant);

      // Save to localStorage
      localStorage.setItem("currentTenantId", tenantId);

      // TODO: Fase 2 - Actualizar en Firebase
      // await updateDoc(doc(db, "users", user!.id), {
      //   currentTenantId: tenantId,
      //   updatedAt: serverTimestamp(),
      // });

      // Update current role
      // TODO: Fase 2 - Get role from user.tenants
      // const relation = user?.tenants?.find(t => t.tenantId === tenantId);
      // setCurrentRole(relation?.role || null);
    } catch (err) {
      console.error("Error switching tenant:", err);
      setError("Error al cambiar de taller");
      throw err;
    }
  };

  const value: TenantContextType = {
    currentTenant,
    tenants,
    currentRole,
    switchTenant,
    loading,
    error,
  };

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
