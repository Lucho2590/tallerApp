"use client"

import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const plans = [
  {
    name: "Trial",
    description: "Perfecto para probar la plataforma",
    price: "Gratis",
    period: "14 días",
    features: [
      { text: "Hasta 2 usuarios", included: true },
      { text: "Hasta 50 clientes", included: true },
      { text: "Clientes y Vehículos", included: true },
      { text: "Trabajos y Órdenes", included: true },
      { text: "Soporte por email", included: true },
    ],
    cta: "Comenzar gratis",
  },
  {
    name: "Basic",
    description: "Para talleres en crecimiento",
    price: "$29",
    period: "por mes",
    features: [
      { text: "Hasta 5 usuarios", included: true },
      { text: "Hasta 500 clientes", included: true },
      { text: "Clientes, Vehículos, Trabajos", included: true },
      { text: "Agenda y Turnos", included: true },
      { text: "Presupuestos", included: true },
      { text: "Soporte prioritario", included: true },
    ],
    cta: "Comenzar ahora",
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
      { text: "Reportes avanzados", included: true },
      { text: "Soporte 24/7", included: true },
    ],
    cta: "Comenzar ahora",
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
      { text: "Soporte dedicado", included: true },
      { text: "Capacitación personalizada", included: true },
    ],
    cta: "Contactar ventas",
  },
]

export function PricingSection() {
  const [activePlan, setActivePlan] = useState(0)

  return (
    <section className="py-20 md:py-32 bg-slate-950 relative overflow-hidden">
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
          className="text-center max-w-3xl mx-auto mb-12 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6">
            Planes que se adaptan a{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              tu taller
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400">
            Comienza gratis y escala cuando lo necesites
          </p>
        </motion.div>

        {/* MOBILE VERSION - Tabs */}
        <div className="md:hidden">
          {/* Tabs horizontales */}
          <div className="flex gap-2 overflow-x-auto mb-8 pb-2 scrollbar-hide">
            {plans.map((plan, index) => (
              <button
                key={plan.name}
                onClick={() => setActivePlan(index)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activePlan === index
                    ? "bg-orange-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {plan.name}
              </button>
            ))}
          </div>

          {/* Plan card */}
          <motion.div
            key={activePlan}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800 p-6">
              {/* Plan header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-1">{plans[activePlan].name}</h3>
                <p className="text-slate-400 text-sm mb-4">{plans[activePlan].description}</p>

                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">{plans[activePlan].price}</span>
                  {plans[activePlan].period !== "contactar" && (
                    <span className="text-slate-400 text-sm">/{plans[activePlan].period}</span>
                  )}
                </div>
              </div>

              {/* Features list */}
              <ul className="space-y-3 mb-6">
                {plans[activePlan].features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`${feature.included ? "text-slate-300" : "text-slate-600"}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <Link href="/onboarding">
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/50"
                  size="lg"
                >
                  {plans[activePlan].cta}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* DESKTOP VERSION - Grid normal sin destacado */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="h-full bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 hover:border-slate-700 p-8 flex flex-col transition-all">
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
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
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
          className="mt-12 md:mt-20 text-center"
        >
          <p className="text-slate-400 text-base md:text-lg">
            ¿Necesitas un plan personalizado?{" "}
            <a href="mailto:contacto@tallerapp.com" className="text-orange-400 hover:text-orange-300 underline">
              Contáctanos
            </a>
          </p>
        </motion.div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
