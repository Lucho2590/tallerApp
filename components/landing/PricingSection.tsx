"use client"

import { motion } from "framer-motion"
import { Check, X, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Trial",
    description: "Perfecto para probar la plataforma",
    price: "Gratis",
    period: "14 días",
    features: [
      { text: "Hasta 2 usuarios", included: true },
      { text: "Hasta 50 clientes", included: true },
      { text: "Módulos básicos", included: true },
      { text: "Clientes y Vehículos", included: true },
      { text: "Trabajos y Órdenes", included: true },
      { text: "Soporte por email", included: true },
      { text: "Agenda y Turnos", included: false },
      { text: "Productos e Inventario", included: false },
      { text: "Caja e Ingresos", included: false },
      { text: "Reportes avanzados", included: false },
    ],
    cta: "Comenzar gratis",
    highlighted: false,
  },
  {
    name: "Basic",
    description: "Para talleres en crecimiento",
    price: "$29",
    period: "por mes",
    features: [
      { text: "Hasta 5 usuarios", included: true },
      { text: "Hasta 500 clientes", included: true },
      { text: "Todos los módulos básicos", included: true },
      { text: "Clientes, Vehículos, Trabajos", included: true },
      { text: "Agenda y Turnos", included: true },
      { text: "Presupuestos", included: true },
      { text: "Notificaciones por email", included: true },
      { text: "Soporte prioritario", included: true },
      { text: "Productos e Inventario", included: false },
      { text: "Reportes avanzados", included: false },
    ],
    cta: "Comenzar ahora",
    highlighted: false,
  },
  {
    name: "Premium",
    description: "Para talleres profesionales",
    price: "$79",
    period: "por mes",
    features: [
      { text: "Hasta 15 usuarios", included: true },
      { text: "Clientes ilimitados", included: true },
      { text: "Todos los módulos", included: true },
      { text: "Inventario completo", included: true },
      { text: "Caja e ingresos/egresos", included: true },
      { text: "Notificaciones email + SMS", included: true },
      { text: "Reportes avanzados", included: true },
      { text: "Branding personalizado", included: true },
      { text: "Soporte prioritario 24/7", included: true },
      { text: "Capacitación incluida", included: true },
    ],
    cta: "Comenzar ahora",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "Para redes de talleres",
    price: "Custom",
    period: "contactar",
    features: [
      { text: "Usuarios ilimitados", included: true },
      { text: "Clientes ilimitados", included: true },
      { text: "Todos los módulos", included: true },
      { text: "Multi-taller", included: true },
      { text: "API dedicada", included: true },
      { text: "Integraciones custom", included: true },
      { text: "Soporte dedicado", included: true },
      { text: "SLA garantizado", included: true },
      { text: "Capacitación personalizada", included: true },
      { text: "Onboarding asistido", included: true },
    ],
    cta: "Contactar ventas",
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
      <motion.div
        className="absolute top-1/3 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Planes que se adaptan a{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              tu taller
            </span>
          </h2>
          <p className="text-xl text-slate-400">
            Comienza gratis y escala cuando lo necesites. Sin contratos largos, cancela cuando quieras.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Most popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    Más popular
                  </div>
                </div>
              )}

              <div
                className={`h-full bg-slate-900/50 backdrop-blur-xl rounded-2xl border ${
                  plan.highlighted
                    ? "border-orange-500 shadow-lg shadow-orange-500/20"
                    : "border-slate-800"
                } p-8 flex flex-col ${plan.highlighted ? "scale-105" : ""}`}
              >
                {/* Plan header */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    {plan.period !== "contactar" && (
                      <span className="text-slate-400">/{plan.period}</span>
                    )}
                  </div>
                </div>

                {/* Features list */}
                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? "text-slate-300" : "text-slate-600"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <Link href="/onboarding">
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg shadow-orange-500/50"
                        : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ or additional info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <p className="text-slate-400 text-lg">
            ¿Necesitas un plan personalizado?{" "}
            <a href="mailto:contacto@tallerapp.com" className="text-orange-400 hover:text-orange-300 underline">
              Contáctanos
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
