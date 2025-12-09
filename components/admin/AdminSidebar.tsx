"use client"

import { useAuth } from "@/contexts/AuthContext"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/sudo",
  },
  {
    title: "Usuarios",
    icon: Users,
    href: "/sudo/users",
  },
  {
    title: "Organizaciones",
    icon: Building2,
    href: "/sudo/organizations",
  },
  {
    title: "Planes",
    icon: CreditCard,
    href: "/sudo/plans",
  },
  {
    title: "Configuración",
    icon: Settings,
    href: "/sudo/settings",
  },
]

export function AdminSidebar() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } h-full bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Super Admin
            </h1>
            <p className="text-xs text-slate-400 mt-1">Panel de Control</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-slate-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-orange-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium">{item.title}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User info + Logout */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {!collapsed && (
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-white truncate">
              {user?.nombre} {user?.apellido}
            </p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-500/10 text-orange-400 text-xs font-medium">
                Super Admin
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={handleSignOut}
          variant="ghost"
          className={`w-full ${
            collapsed ? "px-2" : ""
          } justify-start text-slate-400 hover:text-white hover:bg-slate-800`}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="ml-3">Cerrar sesión</span>}
        </Button>
      </div>
    </aside>
  )
}
