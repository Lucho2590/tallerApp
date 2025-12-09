"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Tenant } from "@/types/tenant";

interface TenantContextType {
  currentTenant: Tenant | null;
  loading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's tenant when user changes
  useEffect(() => {
    if (!user) {
      setCurrentTenant(null);
      setLoading(false);
      return;
    }

    loadUserTenant();
  }, [user]);

  const loadUserTenant = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setLoading(false);
        return;
      }

      console.log("🔍 [TenantContext] Loading tenant for user:", user.id);
      console.log("🔍 [TenantContext] User tenantId:", user.tenantId);

      // If user doesn't have a tenant, they need onboarding (unless super admin)
      if (!user.tenantId) {
        console.log("⚠️ [TenantContext] User has no tenant, needs onboarding");
        setCurrentTenant(null);
        setLoading(false);
        return;
      }

      // Load the tenant
      const { tenantsService } = await import("@/services/tenants/tenantsService");
      const tenant = await tenantsService.getTenantById(user.tenantId);

      if (tenant) {
        console.log("✅ [TenantContext] Tenant loaded:", tenant.name);
        setCurrentTenant(tenant);
      } else {
        console.log("❌ [TenantContext] Tenant not found:", user.tenantId);
        setError("No se pudo cargar el taller");
      }

      setLoading(false);
    } catch (err) {
      console.error("Error loading tenant:", err);
      setError("Error al cargar el taller");
      setLoading(false);
    }
  };

  const refreshTenant = async () => {
    await loadUserTenant();
  };

  const value: TenantContextType = {
    currentTenant,
    loading,
    error,
    refreshTenant,
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
