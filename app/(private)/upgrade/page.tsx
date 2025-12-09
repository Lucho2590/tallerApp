"use client"

import { useTenant } from "@/contexts/TenantContext"
import { SubscriptionPlan, DEFAULT_TENANT_CONFIG } from "@/types/tenant"
import { Check, Zap, Users, Database, TrendingUp, Crown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

const planInfo = {
  [SubscriptionPlan.TRIAL]: {
    name: "Trial",
    description: "Perfecto para probar",
    price: "Gratis",
    period: "15 días",
    color: "purple",
    icon: Zap,
    badge: undefined,
  },
  [SubscriptionPlan.BASIC]: {
    name: "Básico",
    description: "Para talleres pequeños",
    price: "$9.990",
    period: "/mes",
    color: "blue",
    icon: Users,
    badge: undefined,
  },
  [SubscriptionPlan.PREMIUM]: {
    name: "Premium",
    description: "Para talleres profesionales",
    price: "$19.990",
    period: "/mes",
    color: "orange",
    icon: Database,
    badge: "Popular",
  },
  [SubscriptionPlan.ENTERPRISE]: {
    name: "Enterprise",
    description: "Para cadenas de talleres",
    price: "Personalizado",
    period: "",
    color: "green",
    icon: Crown,
    badge: undefined,
  },
}

const colorClasses = {
  purple: {
    bg: "bg-purple-500",
    border: "border-purple-500",
    text: "text-purple-500",
    hover: "hover:bg-purple-600",
  },
  blue: {
    bg: "bg-blue-500",
    border: "border-blue-500",
    text: "text-blue-500",
    hover: "hover:bg-blue-600",
  },
  orange: {
    bg: "bg-orange-500",
    border: "border-orange-500",
    text: "text-orange-500",
    hover: "hover:bg-orange-600",
  },
  green: {
    bg: "bg-green-500",
    border: "border-green-500",
    text: "text-green-500",
    hover: "hover:bg-green-600",
  },
}

export default function UpgradePage() {
  const { currentTenant } = useTenant()
  const [isLoading, setIsLoading] = useState(false)

  const currentPlan = currentTenant?.plan || SubscriptionPlan.TRIAL

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    setIsLoading(true)
    // TODO: Implementar integración con Stripe/MercadoPago
    console.log("Upgrading to:", plan)

    // Por ahora solo mostramos un alert
    alert(`Próximamente: Actualizar a plan ${planInfo[plan].name}`)
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-4">
          Elige el plan perfecto para tu taller
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Escala tu negocio con las herramientas que necesitas. Sin sorpresas, sin compromisos.
        </p>
        {currentTenant && (
          <div className="mt-4">
            <Badge variant="outline" className="text-sm">
              Plan actual: {planInfo[currentPlan].name}
            </Badge>
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {Object.values(SubscriptionPlan).map((plan) => {
          const info = planInfo[plan]
          const config = DEFAULT_TENANT_CONFIG[plan]
          const Icon = info.icon
          const colors = colorClasses[info.color as keyof typeof colorClasses]
          const isCurrentPlan = currentPlan === plan
          const canUpgrade =
            (currentPlan === SubscriptionPlan.TRIAL && plan !== SubscriptionPlan.TRIAL) ||
            (currentPlan === SubscriptionPlan.BASIC && (plan === SubscriptionPlan.PREMIUM || plan === SubscriptionPlan.ENTERPRISE)) ||
            (currentPlan === SubscriptionPlan.PREMIUM && plan === SubscriptionPlan.ENTERPRISE)

          return (
            <Card
              key={plan}
              className={`relative ${
                plan === SubscriptionPlan.PREMIUM
                  ? "border-2 border-orange-500 shadow-lg shadow-orange-500/20"
                  : isCurrentPlan
                  ? "border-2 border-slate-600"
                  : "border-slate-800"
              }`}
            >
              {info.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className={`${colors.bg} text-white`}>
                    {info.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${colors.bg}/10`}>
                  <Icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <CardTitle className="text-xl text-white">{info.name}</CardTitle>
                <CardDescription>{info.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">{info.price}</span>
                  {info.period && <span className="text-slate-400 text-sm">{info.period}</span>}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className={`h-4 w-4 mt-0.5 ${colors.text} flex-shrink-0`} />
                    <span className="text-slate-300">
                      {config.maxUsers === -1 ? "Usuarios ilimitados" : `Hasta ${config.maxUsers} usuarios`}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className={`h-4 w-4 mt-0.5 ${colors.text} flex-shrink-0`} />
                    <span className="text-slate-300">
                      {config.maxClients === -1 ? "Clientes ilimitados" : `Hasta ${config.maxClients} clientes`}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className={`h-4 w-4 mt-0.5 ${colors.text} flex-shrink-0`} />
                    <span className="text-slate-300">
                      {config.maxVehicles === -1 ? "Vehículos ilimitados" : `Hasta ${config.maxVehicles} vehículos`}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className={`h-4 w-4 mt-0.5 ${colors.text} flex-shrink-0`} />
                    <span className="text-slate-300">
                      {config.maxMonthlyJobs === -1 ? "Trabajos ilimitados" : `${config.maxMonthlyJobs} trabajos/mes`}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className={`h-4 w-4 mt-0.5 ${colors.text} flex-shrink-0`} />
                    <span className="text-slate-300">
                      {config.modules.length} módulos
                    </span>
                  </li>
                  {config.features.length > 0 && (
                    <li className="flex items-start gap-2">
                      <Check className={`h-4 w-4 mt-0.5 ${colors.text} flex-shrink-0`} />
                      <span className="text-slate-300">
                        {config.features.length} características premium
                      </span>
                    </li>
                  )}
                </ul>

                {/* CTA Button */}
                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button disabled className="w-full" variant="outline">
                      Plan actual
                    </Button>
                  ) : canUpgrade ? (
                    <Button
                      onClick={() => handleUpgrade(plan)}
                      disabled={isLoading}
                      className={`w-full ${colors.bg} ${colors.hover} text-white`}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Actualizar
                    </Button>
                  ) : (
                    <Button disabled className="w-full" variant="ghost">
                      No disponible
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* FAQ Section */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Preguntas frecuentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-white mb-2">¿Puedo cambiar de plan en cualquier momento?</h3>
            <p className="text-sm text-slate-400">
              Sí, puedes actualizar o reducir tu plan cuando quieras. Los cambios se aplicarán en tu próximo ciclo de facturación.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-white mb-2">¿Qué sucede al finalizar el trial?</h3>
            <p className="text-sm text-slate-400">
              Tendrás que elegir un plan de pago para continuar usando la plataforma. Tus datos se mantendrán seguros durante 30 días.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-white mb-2">¿Ofrecen descuentos por pago anual?</h3>
            <p className="text-sm text-slate-400">
              Sí, al pagar anualmente obtienes 2 meses gratis (equivalente a 16% de descuento).
            </p>
          </div>
          <div>
            <h3 className="font-medium text-white mb-2">¿Necesito ayuda para elegir?</h3>
            <p className="text-sm text-slate-400">
              Contáctanos y te ayudaremos a elegir el plan perfecto para tu taller.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
