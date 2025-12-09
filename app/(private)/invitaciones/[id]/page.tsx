"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Mail, Building2, UserPlus, XCircle, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getInvitationById, acceptInvitation, rejectInvitation, type TenantInvitation } from "@/services/invitations/invitationsService"
import { toast } from "sonner"

const roleNames = {
  owner: "Dueño",
  admin: "Administrador",
  manager: "Gerente",
  user: "Usuario",
  viewer: "Visualizador",
}

export default function AcceptInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [invitation, setInvitation] = useState<TenantInvitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const invitationId = params.id as string

  useEffect(() => {
    loadInvitation()
  }, [invitationId])

  const loadInvitation = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getInvitationById(invitationId)

      if (!data) {
        setError("Invitación no encontrada")
        return
      }

      // Verificar que el email coincida con el usuario actual
      if (user && data.email.toLowerCase() !== user.email.toLowerCase()) {
        setError("Esta invitación fue enviada a otro email")
        return
      }

      setInvitation(data)
    } catch (err) {
      console.error("Error loading invitation:", err)
      setError("Error al cargar la invitación")
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!invitation || !user) return

    try {
      setProcessing(true)
      await acceptInvitation(invitation.id, user.id)
      toast.success("¡Te has unido al equipo!")

      // Redirigir al dashboard después de aceptar
      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 1500)
    } catch (err: any) {
      console.error("Error accepting invitation:", err)
      toast.error(err.message || "Error al aceptar la invitación")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!invitation) return

    try {
      setProcessing(true)
      await rejectInvitation(invitation.id)
      toast.success("Invitación rechazada")

      // Redirigir al dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err) {
      console.error("Error rejecting invitation:", err)
      toast.error("Error al rechazar la invitación")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando invitación...</p>
        </div>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="border-red-500/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-red-500">Invitación inválida</CardTitle>
            <CardDescription className="text-base">
              {error || "No se pudo encontrar esta invitación"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Verificar si la invitación ya fue procesada
  if (invitation.status !== "pending") {
    const statusInfo = {
      accepted: {
        icon: CheckCircle,
        color: "text-green-500",
        bg: "bg-green-500/10",
        title: "Invitación aceptada",
        message: "Ya has aceptado esta invitación y eres parte del equipo.",
      },
      rejected: {
        icon: XCircle,
        color: "text-red-500",
        bg: "bg-red-500/10",
        title: "Invitación rechazada",
        message: "Has rechazado esta invitación.",
      },
      expired: {
        icon: Clock,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        title: "Invitación expirada",
        message: "Esta invitación ha expirado. Solicita una nueva invitación al administrador.",
      },
    }

    const info = statusInfo[invitation.status as keyof typeof statusInfo]
    const StatusIcon = info.icon

    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className={`border-${invitation.status === "accepted" ? "green" : invitation.status === "rejected" ? "red" : "orange"}-500/20`}>
          <CardHeader className="text-center">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${info.bg}`}>
              <StatusIcon className={`h-8 w-8 ${info.color}`} />
            </div>
            <CardTitle className={`text-2xl ${info.color}`}>{info.title}</CardTitle>
            <CardDescription className="text-base">
              {info.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/dashboard")}>
              Ir al dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Verificar si está expirada
  const isExpired = new Date(invitation.expiresAt) < new Date()
  if (isExpired) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="border-orange-500/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <CardTitle className="text-2xl text-orange-500">Invitación expirada</CardTitle>
            <CardDescription className="text-base">
              Esta invitación expiró el {invitation.expiresAt.toLocaleDateString('es-AR')}. Solicita una nueva invitación al administrador.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="border-2 border-orange-500/20">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
            <Mail className="h-8 w-8 text-orange-500" />
          </div>
          <CardTitle className="text-2xl">Has sido invitado</CardTitle>
          <CardDescription className="text-base">
            {invitation.invitedByName} te ha invitado a unirte a su organización
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Organization Info */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20">
              <Building2 className="h-6 w-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">{invitation.tenantName}</h3>
              <p className="text-sm text-slate-400">
                Serás agregado como <strong className="text-white">{roleNames[invitation.role as keyof typeof roleNames]}</strong>
              </p>
            </div>
          </div>

          {/* Invitation Details */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Invitado por</span>
              <span className="text-white font-medium">{invitation.invitedByName}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Email</span>
              <span className="text-white font-medium">{invitation.email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Rol asignado</span>
              <Badge className="bg-orange-500/10 text-orange-400">
                {roleNames[invitation.role as keyof typeof roleNames]}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Expira</span>
              <span className="text-white font-medium">
                {invitation.expiresAt.toLocaleDateString('es-AR')}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleAccept}
              disabled={processing}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {processing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Aceptar invitación
                </>
              )}
            </Button>
            <Button
              onClick={handleReject}
              disabled={processing}
              variant="outline"
              className="flex-1 border-slate-700"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-center text-slate-500 pt-2">
            Al aceptar, tendrás acceso a los datos y funcionalidades de la organización según tu rol asignado.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
