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

      if (!user) {
        setLoading(false);
        return;
      }

      // Get user's tenant IDs from their document
      const userTenants = user.tenants || {};
      const tenantIds = Object.keys(userTenants);

      if (tenantIds.length === 0) {
        // User has no tenants - will need onboarding
        setTenants([]);
        setCurrentTenant(null);
        setCurrentRole(null);
        setLoading(false);
        return;
      }

      // Load full tenant documents
      const { tenantsService } = await import("@/services/tenants/tenantsService");
      const loadedTenants: Tenant[] = [];

      for (const tenantId of tenantIds) {
        const tenant = await tenantsService.getById(tenantId);
        if (tenant) {
          loadedTenants.push(tenant);
        }
      }

      setTenants(loadedTenants);

      // Set current tenant from user's currentTenantId or first tenant
      let currentTenant = loadedTenants.find(t => t.id === user.currentTenantId);
      if (!currentTenant && loadedTenants.length > 0) {
        currentTenant = loadedTenants[0];
      }

      if (currentTenant) {
        setCurrentTenant(currentTenant);

        // Get user's role in current tenant
        const relation = userTenants[currentTenant.id];
        setCurrentRole(relation?.role || null);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error loading tenants:", err);
      setError("Error al cargar los talleres");
      setLoading(false);
    }
  };

  const switchTenant = async (tenantId: string) => {
    try {
      setError(null);

      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      const tenant = tenants.find((t) => t.id === tenantId);
      if (!tenant) {
        throw new Error("Taller no encontrado");
      }

      setCurrentTenant(tenant);

      // Update current role
      const userTenants = user.tenants || {};
      const relation = userTenants[tenantId];
      setCurrentRole(relation?.role || null);

      // Update in Firebase
      const { usersService } = await import("@/services/users/usersService");
      await usersService.switchTenant(user.id, tenantId);
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
