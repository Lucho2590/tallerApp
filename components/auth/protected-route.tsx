"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authState === "unauthenticated") {
      router.push("/login");
    }
  }, [authState, router]);

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

  if (authState === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
