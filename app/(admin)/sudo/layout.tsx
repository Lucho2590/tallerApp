"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Shield, Users, Building2, LayoutDashboard, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, authState, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Verificar que el usuario está autenticado y es superadmin
    if (authState === "authenticated" && !user?.isSuperAdmin) {
      router.push("/dashboard");
    } else if (authState === "unauthenticated") {
      router.push("/login");
    }
  }, [authState, user, router]);

  // Mostrar loading mientras verifica
  if (authState === "loading" || !user?.isSuperAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Panel de Administración
              </h1>
              <p className="text-xs text-slate-400">Super Admin</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {user.nombre} {user.apellido}
              </p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-6 pb-4">
          <div className="flex gap-2">
            <Link
              href="/sudo"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/sudo/users"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Usuarios
            </Link>
            <Link
              href="/sudo/tenants"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"
            >
              <Building2 className="h-4 w-4" />
              Talleres
            </Link>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
