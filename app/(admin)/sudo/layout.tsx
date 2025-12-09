"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, authState } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if not authenticated
    if (authState === "unauthenticated") {
      router.push("/login")
      return
    }

    // Redirect if not super admin
    if (authState === "authenticated" && !user?.isSuperAdmin) {
      router.push("/dashboard")
    }
  }, [authState, user, router])

  // Show loading while checking auth
  if (authState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Don't render if not super admin
  if (!user?.isSuperAdmin) {
    return null
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
