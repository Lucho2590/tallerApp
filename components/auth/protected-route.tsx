"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authState, needsOnboarding } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si no está autenticado, redirigir a login
    if (authState === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Si está autenticado pero necesita onboarding y NO está ya en onboarding
    if (authState === "authenticated" && needsOnboarding && pathname !== "/onboarding") {
      router.push("/onboarding");
      return;
    }

    // Si ya completó onboarding pero está en /onboarding, redirigir a dashboard
    if (authState === "authenticated" && !needsOnboarding && pathname === "/onboarding") {
      router.push("/dashboard");
    }
  }, [authState, needsOnboarding, pathname, router]);

  // Mostrar loading mientras carga
  if (authState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // No mostrar nada si no está autenticado (está redirigiendo)
  if (authState === "unauthenticated") {
    return null;
  }

  // No mostrar nada si necesita onboarding y no está en esa página (está redirigiendo)
  if (needsOnboarding && pathname !== "/onboarding") {
    return null;
  }

  return <>{children}</>;
}
