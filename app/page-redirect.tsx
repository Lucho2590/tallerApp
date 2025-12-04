"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { authState } = useAuth();

  useEffect(() => {
    if (authState === "authenticated") {
      router.push("/dashboard");
    } else if (authState === "unauthenticated") {
      router.push("/login");
    }
  }, [authState, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
}
