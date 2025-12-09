"use client"

import { motion } from "framer-motion"
import {
  Cloud,
  Lock,
  Zap,
  BarChart,
  Users2,
  Smartphone,
  Shield,
  Clock,
  TrendingUp
} from "lucide-react"

const allFeatures = [
  {
    icon: Cloud,
    title: "100% en la Nube",
    description: "Accede desde cualquier dispositivo con internet. Tus datos siempre disponibles y seguros.",
    priority: 1
  },
  {
    icon: Lock,
    title: "Seguridad Total",
    description: "Tus datos protegidos con encriptación y backups automáticos.",
    priority: 1
  },
  {
    icon: Zap,
    title: "Actualización Instantánea",
    description: "Todos los cambios se reflejan al momento en todos los dispositivos.",
    priority: 1
  },
  {
    icon: BarChart,
    title: "Reportes y Métricas",
    description: "Dashboard con estadísticas clave para visualizar el rendimiento de tu taller.",
    priority: 1
  },
  {
    icon: Users2,
    title: "Multi-usuario",
    description: "Múltiples usuarios con roles y permisos personalizados.",
    priority: 1
  },
  {
    icon: Smartphone,
    title: "Funciona en Todos tus Dispositivos",
    description: "Desktop, tablet y móvil. Gestiona desde cualquier pantalla.",
    priority: 1
  },
  {
    icon: Shield,
    title: "Backups Automáticos",
    description: "Respaldos diarios automáticos. Recupera información cuando lo necesites.",
    priority: 2
  },
  {
    icon: Clock,
    title: "Sin Instalación",
    description: "Empieza a usar en minutos. No requiere instalación ni configuración compleja.",
    priority: 2
  },
  {
    icon: TrendingUp,
    title: "Escalable",
    description: "Crece con tu negocio. Desde un usuario hasta equipos completos sin límites.",
    priority: 2
  }
]

export function FeaturesGrid() {
  // En mobile solo mostramos features con priority 1
  const mobileFeatures = allFeatures.filter(f => f.priority === 1)

  return (
    <section className="py-20 md:py-32 bg-slate-900 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

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
            ¿Por qué elegir{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              TallerApp
            </span>
            ?
          </h2>
          <p className="text-lg md:text-xl text-slate-400">
            Tecnología moderna y experiencia diseñada para talleres
          </p>
        </motion.div>

        {/* MOBILE VERSION - Solo 6 features principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:hidden">
          {mobileFeatures.map((feature, index) => {
            const Icon = feature.icon

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative"
              >
                <div className="h-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all duration-300">
                  {/* Icon */}
                  <div className="mb-4">
                    <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 group-hover:from-orange-500/30 group-hover:to-amber-500/30 transition-all duration-300">
                      <Icon className="h-5 w-5 text-orange-400 group-hover:text-orange-300 transition-colors" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* DESKTOP VERSION - Todas las features */}
        <div className="hidden md:grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {allFeatures.map((feature, index) => {
            const Icon = feature.icon

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="group relative"
              >
                <div className="h-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-slate-600 transition-all duration-300">
                  {/* Icon */}
                  <div className="mb-6">
                    <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 group-hover:from-orange-500/30 group-hover:to-amber-500/30 transition-all duration-300">
                      <Icon className="h-6 w-6 text-orange-400 group-hover:text-orange-300 transition-colors" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-orange-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Gradient border on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/0 via-amber-500/0 to-yellow-500/0 group-hover:from-orange-500/10 group-hover:via-amber-500/10 group-hover:to-yellow-500/10 transition-all duration-300 pointer-events-none" />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Stats section */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 md:mt-24 grid grid-cols-3 gap-4 md:gap-8"
        >
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-2">
              99.9%
            </div>
            <div className="text-xs md:text-base text-slate-400">Uptime garantizado</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-2">
              &lt;100ms
            </div>
            <div className="text-xs md:text-base text-slate-400">Tiempo de respuesta</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
              24/7
            </div>
            <div className="text-xs md:text-base text-slate-400">Disponibilidad</div>
          </div>
        </motion.div> */}
      </div>
    </section>
  )
}
