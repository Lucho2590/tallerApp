"use client"

import { motion } from "framer-motion"
import { Check, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const features = [
  "Gestión completa de clientes y vehículos",
  "Órdenes de trabajo ilimitadas",
  "Control de inventario y productos",
  "Gestión de caja e ingresos/egresos",
  "Calendario y agenda de trabajos",
  "Presupuestos y cotizaciones",
  "Sin límite de usuarios",
  "Actualizaciones automáticas",
]

export function PricingSection() {

  return (
    <section className="py-20 md:py-32 bg-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
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

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered pricing card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Launch badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 mb-8"
          >
            <Sparkles className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-semibold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Oferta de Lanzamiento
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4"
          >
            Simple y transparente
          </motion.h2>

          {/* Price */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-7xl sm:text-8xl md:text-9xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                $0
              </span>
              <span className="text-2xl text-slate-400">/mes</span>
            </div>
            <p className="text-xl md:text-2xl text-slate-300 font-medium">
              Gratis durante el lanzamiento
            </p>
            <p className="text-base text-slate-400 mt-2">
              Sin tarjeta de crédito • Sin límites • Sin trucos
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 md:p-10">
              <h3 className="text-lg font-semibold text-white mb-6">
                Todo incluido:
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link href="/onboarding">
              <Button
                className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-8 py-6 text-lg font-semibold shadow-2xl shadow-orange-500/50 transition-all hover:scale-105"
                size="lg"
              >
                Comenzar ahora gratis
              </Button>
            </Link>
            <p className="text-sm text-slate-500 mt-4">
              Configura tu taller en menos de 2 minutos
            </p>
          </motion.div>

          {/* Bottom note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-16 pt-8 border-t border-slate-800"
          >
            <p className="text-slate-400 text-base">
              ¿Preguntas sobre funcionalidades específicas?{" "}
              <a
                href="mailto:contacto@tallerapp.com"
                className="text-orange-400 hover:text-orange-300 underline"
              >
                Contáctanos
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
