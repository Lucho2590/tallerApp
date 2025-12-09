"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTenant } from "@/contexts/TenantContext"
import { TenantRole } from "@/types/tenant"
import {
  Users,
  UserPlus,
  Mail,
  Clock,
  XCircle,
  MoreVertical,
  Crown,
  Shield,
  User as UserIcon,
  Eye,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createInvitation, getInvitationsByTenant, cancelInvitation, type TenantInvitation } from "@/services/invitations/invitationsService"
import { getUsersByTenant } from "@/services/tenants/tenantsService"
import { toast } from "sonner"

const roleNames: Record<TenantRole, string> = {
  [TenantRole.OWNER]: "Dueño",
  [TenantRole.ADMIN]: "Administrador",
  [TenantRole.MANAGER]: "Gerente",
  [TenantRole.USER]: "Usuario",
  [TenantRole.VIEWER]: "Visualizador",
}

const roleIcons: Record<TenantRole, any> = {
  [TenantRole.OWNER]: Crown,
  [TenantRole.ADMIN]: Shield,
  [TenantRole.MANAGER]: Users,
  [TenantRole.USER]: UserIcon,
  [TenantRole.VIEWER]: Eye,
}

const roleColors: Record<TenantRole, string> = {
  [TenantRole.OWNER]: "text-orange-500 bg-orange-500/10",
  [TenantRole.ADMIN]: "text-blue-500 bg-blue-500/10",
  [TenantRole.MANAGER]: "text-purple-500 bg-purple-500/10",
  [TenantRole.USER]: "text-green-500 bg-green-500/10",
  [TenantRole.VIEWER]: "text-slate-500 bg-slate-500/10",
}

interface TeamMember {
  id: string
  email: string
  nombre: string
  apellido: string
  role: TenantRole
  joinedAt: Date
  lastLogin?: Date
  photoURL?: string
}

export default function EquipoPage() {
  const { user } = useAuth()
  const { currentTenant, currentRole } = useTenant()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<TenantInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<TenantRole>(TenantRole.USER)
  const [isInviting, setIsInviting] = useState(false)

  // Solo OWNER y ADMIN pueden gestionar equipo
  const canManageTeam = currentRole === TenantRole.OWNER || currentRole === TenantRole.ADMIN

  useEffect(() => {
    if (currentTenant) {
      loadTeamData()
    }
  }, [currentTenant])

  const loadTeamData = async () => {
    if (!currentTenant) return

    try {
      setLoading(true)
      const [teamMembers, teamInvitations] = await Promise.all([
        getUsersByTenant(currentTenant.id),
        getInvitationsByTenant(currentTenant.id),
      ])

      setMembers(teamMembers)
      setInvitations(teamInvitations)
    } catch (error) {
      console.error("Error loading team data:", error)
      toast.error("Error al cargar el equipo")
    } finally {
      setLoading(false)
    }
  }

  const handleInviteUser = async () => {
    if (!currentTenant || !user) return

    try {
      setIsInviting(true)

      // Validar email
      if (!inviteEmail || !inviteEmail.includes("@")) {
        toast.error("Por favor ingresa un email válido")
        return
      }

      // Verificar que no sea el mismo usuario
      if (inviteEmail.toLowerCase() === user.email.toLowerCase()) {
        toast.error("No puedes invitarte a ti mismo")
        return
      }

      // Verificar que no esté ya en el equipo
      const existingMember = members.find(m => m.email.toLowerCase() === inviteEmail.toLowerCase())
      if (existingMember) {
        toast.error("Este usuario ya es miembro del equipo")
        return
      }

      await createInvitation({
        tenantId: currentTenant.id,
        tenantName: currentTenant.name,
        email: inviteEmail,
        role: inviteRole,
        invitedBy: user.id,
        invitedByName: `${user.nombre} ${user.apellido}`,
      })

      toast.success("Invitación enviada correctamente")
      setIsInviteDialogOpen(false)
      setInviteEmail("")
      setInviteRole(TenantRole.USER)
      loadTeamData()
    } catch (error: any) {
      console.error("Error inviting user:", error)
      toast.error(error.message || "Error al enviar la invitación")
    } finally {
      setIsInviting(false)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitation(invitationId)
      toast.success("Invitación cancelada")
      loadTeamData()
    } catch (error) {
      console.error("Error canceling invitation:", error)
      toast.error("Error al cancelar la invitación")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando equipo...</p>
        </div>
      </div>
    )
  }

  if (!canManageTeam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-500">Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para gestionar el equipo. Solo los dueños y administradores pueden acceder a esta sección.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipo</h1>
            <p className="text-muted-foreground">
              Gestiona los miembros de tu organización
            </p>
          </div>
        </div>

        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Invitar miembro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invitar nuevo miembro</DialogTitle>
              <DialogDescription>
                Envía una invitación por email para agregar un nuevo miembro al equipo
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rol</label>
                <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as TenantRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TenantRole.ADMIN}>Administrador</SelectItem>
                    <SelectItem value={TenantRole.MANAGER}>Gerente</SelectItem>
                    <SelectItem value={TenantRole.USER}>Usuario</SelectItem>
                    <SelectItem value={TenantRole.VIEWER}>Visualizador</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {inviteRole === TenantRole.ADMIN && "Acceso completo excepto eliminar la organización"}
                  {inviteRole === TenantRole.MANAGER && "Puede gestionar clientes, vehículos y trabajos"}
                  {inviteRole === TenantRole.USER && "Acceso estándar a las funcionalidades"}
                  {inviteRole === TenantRole.VIEWER && "Solo puede ver información, sin editar"}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleInviteUser}
                disabled={isInviting}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isInviting ? "Enviando..." : "Enviar invitación"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invitaciones Pendientes</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invitations.filter(i => i.status === "pending").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Límite del Plan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.length} / {currentTenant?.config.maxUsers === -1 ? "∞" : currentTenant?.config.maxUsers}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Miembros del Equipo</CardTitle>
          <CardDescription>
            Usuarios que tienen acceso a la organización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Se unió</TableHead>
                <TableHead>Último acceso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const RoleIcon = roleIcons[member.role]
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {member.nombre[0]}{member.apellido[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{member.nombre} {member.apellido}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleColors[member.role]}>
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {roleNames[member.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {member.joinedAt.toLocaleDateString('es-AR')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {member.lastLogin?.toLocaleDateString('es-AR') || "Nunca"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem disabled>
                            Cambiar rol
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled className="text-red-600">
                            Remover del equipo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.filter(i => i.status === "pending").length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invitaciones Pendientes</CardTitle>
            <CardDescription>
              Invitaciones enviadas esperando aceptación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Invitado por</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.filter(i => i.status === "pending").map((invitation) => {
                  const RoleIcon = roleIcons[invitation.role]
                  return (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>
                        <Badge className={roleColors[invitation.role]}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {roleNames[invitation.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {invitation.invitedByName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {invitation.expiresAt.toLocaleDateString('es-AR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelInvitation(invitation.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
