"use client"

import { useState } from "react"
import {
  Save,
  Mail,
  Bell,
  Shield,
  Database,
  Activity,
  AlertTriangle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // Email notifications
    sendWelcomeEmails: true,
    sendTrialExpirationEmails: true,
    sendPaymentReminders: true,

    // System settings
    allowNewRegistrations: true,
    requireEmailVerification: true,
    enableMaintenanceMode: false,

    // Limits
    maxTrialDays: 14,
    defaultTrialDays: 14,

    // Notifications
    notifyOnNewUser: true,
    notifyOnNewOrganization: true,
    notifyOnPaymentFailed: true,

    // Security
    enforceStrongPasswords: true,
    requireMFA: false,
    sessionTimeoutMinutes: 60
  })

  const [hasChanges, setHasChanges] = useState(false)

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const saveSettings = async () => {
    // TODO: Save to Firebase
    console.log("Saving settings:", settings)
    setHasChanges(false)
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
          Configuración del Sistema
        </h1>
        <p className="text-muted-foreground mt-2">
          Ajustes globales de la plataforma
        </p>
      </div>

      {/* Save button */}
      {hasChanges && (
        <Card className="bg-orange-900/20 border-orange-500/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                <p className="text-sm text-orange-300">
                  Tienes cambios sin guardar
                </p>
              </div>
              <Button
                onClick={saveSettings}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Email Notifications */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-white">Notificaciones por Email</CardTitle>
                <CardDescription>Emails automáticos del sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-white">Emails de bienvenida</p>
                <p className="text-xs text-slate-400">Enviar email al registrarse</p>
              </div>
              <Switch
                checked={settings.sendWelcomeEmails}
                onCheckedChange={(val) => updateSetting('sendWelcomeEmails', val)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-white">Expiración de trial</p>
                <p className="text-xs text-slate-400">Notificar cuando expira el trial</p>
              </div>
              <Switch
                checked={settings.sendTrialExpirationEmails}
                onCheckedChange={(val) => updateSetting('sendTrialExpirationEmails', val)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-white">Recordatorios de pago</p>
                <p className="text-xs text-slate-400">Enviar recordatorios de pago</p>
              </div>
              <Switch
                checked={settings.sendPaymentReminders}
                onCheckedChange={(val) => updateSetting('sendPaymentReminders', val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Database className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-white">Sistema</CardTitle>
                <CardDescription>Configuración general</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-white">Nuevos registros</p>
                <p className="text-xs text-slate-400">Permitir registro de usuarios</p>
              </div>
              <Switch
                checked={settings.allowNewRegistrations}
                onCheckedChange={(val) => updateSetting('allowNewRegistrations', val)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-white">Verificación de email</p>
                <p className="text-xs text-slate-400">Requerir email verificado</p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(val) => updateSetting('requireEmailVerification', val)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">Modo mantenimiento</p>
                {settings.enableMaintenanceMode && (
                  <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                    Activo
                  </Badge>
                )}
              </div>
              <Switch
                checked={settings.enableMaintenanceMode}
                onCheckedChange={(val) => updateSetting('enableMaintenanceMode', val)}
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-800/50 space-y-2">
              <label className="text-sm font-medium text-white">
                Duración del trial (días)
              </label>
              <Input
                type="number"
                value={settings.defaultTrialDays}
                onChange={(e) => updateSetting('defaultTrialDays', parseInt(e.target.value))}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400">
                Días de prueba para nuevas organizaciones
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Admin Notifications */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Bell className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-white">Notificaciones Admin</CardTitle>
                <CardDescription>Alertas para super admin</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-white">Nuevo usuario</p>
                <p className="text-xs text-slate-400">Notificar cuando se registra alguien</p>
              </div>
              <Switch
                checked={settings.notifyOnNewUser}
                onCheckedChange={(val) => updateSetting('notifyOnNewUser', val)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-white">Nueva organización</p>
                <p className="text-xs text-slate-400">Notificar cuando se crea un taller</p>
              </div>
              <Switch
                checked={settings.notifyOnNewOrganization}
                onCheckedChange={(val) => updateSetting('notifyOnNewOrganization', val)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-white">Pago fallido</p>
                <p className="text-xs text-slate-400">Alertar sobre pagos rechazados</p>
              </div>
              <Switch
                checked={settings.notifyOnPaymentFailed}
                onCheckedChange={(val) => updateSetting('notifyOnPaymentFailed', val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Shield className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-white">Seguridad</CardTitle>
                <CardDescription>Políticas de seguridad</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-white">Contraseñas fuertes</p>
                <p className="text-xs text-slate-400">Requerir contraseñas seguras</p>
              </div>
              <Switch
                checked={settings.enforceStrongPasswords}
                onCheckedChange={(val) => updateSetting('enforceStrongPasswords', val)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-white">Autenticación 2FA</p>
                <p className="text-xs text-slate-400">Requerir verificación en dos pasos</p>
              </div>
              <Switch
                checked={settings.requireMFA}
                onCheckedChange={(val) => updateSetting('requireMFA', val)}
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-800/50 space-y-2">
              <label className="text-sm font-medium text-white">
                Timeout de sesión (minutos)
              </label>
              <Input
                type="number"
                value={settings.sessionTimeoutMinutes}
                onChange={(e) => updateSetting('sessionTimeoutMinutes', parseInt(e.target.value))}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400">
                Tiempo de inactividad antes de cerrar sesión
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Activity className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <CardTitle className="text-white">Estado del Sistema</CardTitle>
              <CardDescription>Información de la plataforma</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-800/50 text-center">
              <p className="text-xs text-slate-400 mb-1">Estado</p>
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                Operativo
              </Badge>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/50 text-center">
              <p className="text-xs text-slate-400 mb-1">Uptime</p>
              <p className="text-lg font-bold text-white">99.9%</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/50 text-center">
              <p className="text-xs text-slate-400 mb-1">Versión</p>
              <p className="text-lg font-bold text-white">1.0.0</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/50 text-center">
              <p className="text-xs text-slate-400 mb-1">Última actualización</p>
              <p className="text-sm text-white">05/12/2024</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
