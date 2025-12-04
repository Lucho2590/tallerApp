"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Calendar, Car, ClipboardList, DollarSign, Package, Users } from "lucide-react"

const features = [
  {
    id: "clientes",
    icon: Users,
    title: "Clientes",
    description: "Gestiona toda la información de tus clientes en un solo lugar",
    details: [
      "Datos completos: nombre, email, teléfono, dirección, CUIT",
      "Historial de servicios por cliente",
      "Búsqueda y filtrado avanzado",
      "Notas y observaciones personalizadas"
    ],
    color: "blue"
  },
  {
    id: "vehiculos",
    icon: Car,
    title: "Vehículos",
    description: "Registra y da seguimiento a todos los vehículos que atiendes",
    details: [
      "Información completa: patente, VIN, marca, modelo",
      "Historial de reparaciones y mantenimientos",
      "Control de kilometraje",
      "Vinculación automática con clientes"
    ],
    color: "purple"
  },
  {
    id: "turnos",
    icon: Calendar,
    title: "Agenda & Turnos",
    description: "Organiza tu calendario y optimiza tu tiempo",
    details: [
      "Vista de calendario intuitiva",
      "Estados: pendiente, en progreso, completado",
      "Filtrado por fecha y estado",
      "Recordatorios automáticos"
    ],
    color: "green"
  },
  {
    id: "trabajos",
    icon: ClipboardList,
    title: "Órdenes de Trabajo",
    description: "Crea y gestiona trabajos con control total",
    details: [
      "Numeración automática (OT-YYYYMM-0000)",
      "Cálculo automático de costos y totales",
      "Gestión de prioridades (baja, media, alta, urgente)",
      "Asignación de técnicos y seguimiento"
    ],
    color: "orange"
  },
  {
    id: "productos",
    icon: Package,
    title: "Inventario",
    description: "Controla tu stock de repuestos y productos",
    details: [
      "Gestión de productos por categorías",
      "Control de stock en tiempo real",
      "Alertas de stock bajo",
      "Precios y proveedores"
    ],
    color: "pink"
  },
  {
    id: "caja",
    icon: DollarSign,
    title: "Caja",
    description: "Lleva el control de ingresos y egresos",
    details: [
      "Registro de todos los movimientos",
      "Múltiples métodos de pago",
      "Reportes de ingresos y egresos",
      "Balance en tiempo real"
    ],
    color: "emerald"
  }
]

const colorClasses = {
  blue: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    text: "text-orange-400",
    iconBg: "bg-orange-500/20",
    gradient: "from-orange-500/20 to-orange-500/5"
  },
  purple: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    iconBg: "bg-amber-500/20",
    gradient: "from-amber-500/20 to-amber-500/5"
  },
  green: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    text: "text-yellow-400",
    iconBg: "bg-yellow-500/20",
    gradient: "from-yellow-500/20 to-yellow-500/5"
  },
  orange: {
    bg: "bg-orange-600/10",
    border: "border-orange-600/20",
    text: "text-orange-500",
    iconBg: "bg-orange-600/20",
    gradient: "from-orange-600/20 to-orange-600/5"
  },
  pink: {
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    text: "text-orange-300",
    iconBg: "bg-orange-400/20",
    gradient: "from-orange-400/20 to-orange-400/5"
  },
  emerald: {
    bg: "bg-amber-600/10",
    border: "border-amber-600/20",
    text: "text-amber-500",
    iconBg: "bg-amber-600/20",
    gradient: "from-amber-600/20 to-amber-600/5"
  }
}

export function DemoSection() {
  const [activeFeature, setActiveFeature] = useState(features[0])

  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

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
            Todo lo que necesitas para{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              gestionar tu taller
            </span>
          </h2>
          <p className="text-xl text-slate-400">
            Módulos completos e integrados para cubrir cada aspecto de tu negocio
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Feature tabs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              const colors = colorClasses[feature.color as keyof typeof colorClasses]
              const isActive = activeFeature.id === feature.id

              return (
                <motion.button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature)}
                  className={`w-full text-left p-6 rounded-xl border transition-all ${
                    isActive
                      ? `${colors.bg} ${colors.border} shadow-lg`
                      : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${isActive ? colors.iconBg : "bg-slate-800"}`}>
                      <Icon className={`h-6 w-6 ${isActive ? colors.text : "text-slate-400"}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-1 ${isActive ? "text-white" : "text-slate-300"}`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </motion.div>

          {/* Feature details */}
          <motion.div
            key={activeFeature.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:sticky lg:top-24"
          >
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${colorClasses[activeFeature.color as keyof typeof colorClasses].iconBg}`}>
                  <activeFeature.icon className={`h-8 w-8 ${colorClasses[activeFeature.color as keyof typeof colorClasses].text}`} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{activeFeature.title}</h3>
                  <p className="text-slate-400">{activeFeature.description}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Funcionalidades principales
                </h4>
                {activeFeature.details.map((detail, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className={`mt-1 p-1 rounded-full ${colorClasses[activeFeature.color as keyof typeof colorClasses].bg}`}>
                      <svg className={`h-4 w-4 ${colorClasses[activeFeature.color as keyof typeof colorClasses].text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-slate-300">{detail}</p>
                  </motion.div>
                ))}
              </div>

              {/* Screenshot placeholder */}
              <div className="mt-8 pt-8 border-t border-slate-800">
                <div className={`aspect-video rounded-lg bg-gradient-to-br ${colorClasses[activeFeature.color as keyof typeof colorClasses].gradient} border ${colorClasses[activeFeature.color as keyof typeof colorClasses].border} flex items-center justify-center`}>
                  <div className="text-center text-slate-400 space-y-2">
                    <div className="text-4xl">📸</div>
                    <p className="text-sm">Screenshot de {activeFeature.title}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
