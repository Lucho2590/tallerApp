"use client"

import { useState } from "react"
import {
  Check,
  X,
  Edit,
  Save,
  XCircle as Cancel
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TenantModule, TenantFeature, SubscriptionPlan } from "@/types/tenant"

// Plan configuration interface
interface PlanConfig {
  plan: SubscriptionPlan
  name: string
  description: string
  maxUsers: number
  maxClients: number
  maxVehicles: number
  maxMonthlyJobs: number
  modules: TenantModule[]
  features: TenantFeature[]
}

// Module and feature labels
const moduleLabels: Record<TenantModule, string> = {
  [TenantModule.CLIENTS]: "Clientes",
  [TenantModule.VEHICLES]: "Vehículos",
  [TenantModule.JOBS]: "Trabajos y Órdenes",
  [TenantModule.SCHEDULE]: "Agenda y Turnos",
  [TenantModule.QUOTES]: "Presupuestos",
  [TenantModule.INVENTORY]: "Inventario",
  [TenantModule.INVOICING]: "Facturación",
  [TenantModule.REPORTS]: "Reportes"
}

const featureLabels: Record<TenantFeature, string> = {
  [TenantFeature.ADVANCED_REPORTS]: "Reportes Avanzados",
  [TenantFeature.API_ACCESS]: "Acceso API",
  [TenantFeature.CUSTOM_BRANDING]: "Marca Personalizada",
  [TenantFeature.EMAIL_NOTIFICATIONS]: "Notificaciones Email",
  [TenantFeature.SMS_NOTIFICATIONS]: "Notificaciones SMS",
  [TenantFeature.MULTI_LOCATION]: "Multi-sucursal"
}

export default function AdminPlansPage() {
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)

  // Initial plan configurations
  const [planConfigs, setPlanConfigs] = useState<PlanConfig[]>([
    {
      plan: SubscriptionPlan.TRIAL,
      name: "Trial",
      description: "Plan de prueba gratuito",
      maxUsers: 2,
      maxClients: 50,
      maxVehicles: 50,
      maxMonthlyJobs: 20,
      modules: [
        TenantModule.CLIENTS,
        TenantModule.VEHICLES,
        TenantModule.JOBS
      ],
      features: []
    },
    {
      plan: SubscriptionPlan.BASIC,
      name: "Basic",
      description: "Plan básico para talleres pequeños",
      maxUsers: 5,
      maxClients: 500,
      maxVehicles: 500,
      maxMonthlyJobs: 100,
      modules: [
        TenantModule.CLIENTS,
        TenantModule.VEHICLES,
        TenantModule.JOBS,
        TenantModule.SCHEDULE,
        TenantModule.QUOTES
      ],
      features: [
        TenantFeature.EMAIL_NOTIFICATIONS
      ]
    },
    {
      plan: SubscriptionPlan.PREMIUM,
      name: "Premium",
      description: "Plan completo para talleres profesionales",
      maxUsers: 15,
      maxClients: -1,
      maxVehicles: -1,
      maxMonthlyJobs: -1,
      modules: Object.values(TenantModule),
      features: [
        TenantFeature.EMAIL_NOTIFICATIONS,
        TenantFeature.SMS_NOTIFICATIONS,
        TenantFeature.ADVANCED_REPORTS,
        TenantFeature.CUSTOM_BRANDING
      ]
    },
    {
      plan: SubscriptionPlan.ENTERPRISE,
      name: "Enterprise",
      description: "Plan empresarial sin límites",
      maxUsers: -1,
      maxClients: -1,
      maxVehicles: -1,
      maxMonthlyJobs: -1,
      modules: Object.values(TenantModule),
      features: Object.values(TenantFeature)
    }
  ])

  const toggleModule = (planType: SubscriptionPlan, module: TenantModule) => {
    setPlanConfigs(prev => prev.map(config => {
      if (config.plan === planType) {
        const modules = config.modules.includes(module)
          ? config.modules.filter(m => m !== module)
          : [...config.modules, module]
        return { ...config, modules }
      }
      return config
    }))
  }

  const toggleFeature = (planType: SubscriptionPlan, feature: TenantFeature) => {
    setPlanConfigs(prev => prev.map(config => {
      if (config.plan === planType) {
        const features = config.features.includes(feature)
          ? config.features.filter(f => f !== feature)
          : [...config.features, feature]
        return { ...config, features }
      }
      return config
    }))
  }

  const updateLimit = (planType: SubscriptionPlan, field: keyof PlanConfig, value: number) => {
    setPlanConfigs(prev => prev.map(config => {
      if (config.plan === planType) {
        return { ...config, [field]: value }
      }
      return config
    }))
  }

  const savePlan = async (planType: SubscriptionPlan) => {
    // TODO: Save to Firebase
    console.log("Saving plan configuration:", planConfigs.find(c => c.plan === planType))
    setEditingPlan(null)
  }

  const planColors = {
    [SubscriptionPlan.TRIAL]: "from-purple-500 to-pink-500",
    [SubscriptionPlan.BASIC]: "from-blue-500 to-cyan-500",
    [SubscriptionPlan.PREMIUM]: "from-orange-500 to-amber-500",
    [SubscriptionPlan.ENTERPRISE]: "from-green-500 to-emerald-500"
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
          Planes de Suscripción
        </h1>
        <p className="text-muted-foreground mt-2">
          Configura los módulos y características disponibles para cada plan
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {planConfigs.map((config) => {
          const isEditing = editingPlan === config.plan

          return (
            <Card key={config.plan} className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <span className={`text-2xl font-bold bg-gradient-to-r ${planColors[config.plan]} bg-clip-text text-transparent`}>
                        {config.name}
                      </span>
                      <Badge variant="outline" className="border-slate-700">
                        {config.plan}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {config.description}
                    </CardDescription>
                  </div>

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => savePlan(config.plan)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Guardar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPlan(null)}
                          className="border-slate-700"
                        >
                          <Cancel className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingPlan(config.plan)}
                        className="border-slate-700"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Limits */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-300">Límites</h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Usuarios máximos
                      </label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={config.maxUsers}
                          onChange={(e) => updateLimit(config.plan, 'maxUsers', parseInt(e.target.value))}
                          className="bg-slate-800 border-slate-700 text-white h-8"
                        />
                      ) : (
                        <p className="text-white font-medium">
                          {config.maxUsers === -1 ? "Ilimitado" : config.maxUsers}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Clientes máximos
                      </label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={config.maxClients}
                          onChange={(e) => updateLimit(config.plan, 'maxClients', parseInt(e.target.value))}
                          className="bg-slate-800 border-slate-700 text-white h-8"
                        />
                      ) : (
                        <p className="text-white font-medium">
                          {config.maxClients === -1 ? "Ilimitado" : config.maxClients}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Vehículos máximos
                      </label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={config.maxVehicles}
                          onChange={(e) => updateLimit(config.plan, 'maxVehicles', parseInt(e.target.value))}
                          className="bg-slate-800 border-slate-700 text-white h-8"
                        />
                      ) : (
                        <p className="text-white font-medium">
                          {config.maxVehicles === -1 ? "Ilimitado" : config.maxVehicles}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Trabajos/mes máximos
                      </label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={config.maxMonthlyJobs}
                          onChange={(e) => updateLimit(config.plan, 'maxMonthlyJobs', parseInt(e.target.value))}
                          className="bg-slate-800 border-slate-700 text-white h-8"
                        />
                      ) : (
                        <p className="text-white font-medium">
                          {config.maxMonthlyJobs === -1 ? "Ilimitado" : config.maxMonthlyJobs}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modules */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-300">Módulos</h3>
                  <div className="space-y-2">
                    {Object.values(TenantModule).map((module) => {
                      const isEnabled = config.modules.includes(module)

                      return (
                        <div
                          key={module}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50"
                        >
                          <span className="text-sm text-slate-300">
                            {moduleLabels[module]}
                          </span>

                          {isEditing ? (
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={() => toggleModule(config.plan, module)}
                            />
                          ) : (
                            isEnabled ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <X className="h-4 w-4 text-slate-600" />
                            )
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-300">Características Premium</h3>
                  <div className="space-y-2">
                    {Object.values(TenantFeature).map((feature) => {
                      const isEnabled = config.features.includes(feature)

                      return (
                        <div
                          key={feature}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50"
                        >
                          <span className="text-sm text-slate-300">
                            {featureLabels[feature]}
                          </span>

                          {isEditing ? (
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={() => toggleFeature(config.plan, feature)}
                            />
                          ) : (
                            isEnabled ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <X className="h-4 w-4 text-slate-600" />
                            )
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Notas Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-400">
          <p>• Los cambios en los planes afectarán solo a nuevas organizaciones o renovaciones.</p>
          <p>• Las organizaciones existentes mantendrán su configuración actual hasta que se actualice manualmente.</p>
          <p>• El valor -1 representa "Ilimitado" para cualquier límite.</p>
          <p>• Asegúrate de guardar los cambios antes de salir de la página.</p>
        </CardContent>
      </Card>
    </div>
  )
}
