"use client"

import { Lock, TrendingUp, Zap } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ResourceLimitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resourceName: string
  current: number
  max: number
  requiredPlan?: string
}

/**
 * Modal que se muestra cuando se alcanza el límite de un recurso
 */
export function ResourceLimitModal({
  open,
  onOpenChange,
  resourceName,
  current,
  max,
  requiredPlan = "Premium",
}: ResourceLimitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
            <Lock className="h-6 w-6 text-orange-500" />
          </div>
          <DialogTitle className="text-center">Límite alcanzado</DialogTitle>
          <DialogDescription className="text-center">
            Has alcanzado el límite de <strong>{max} {resourceName}</strong> de tu plan actual.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Current usage */}
          <div className="mb-6 p-4 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Uso actual</span>
              <span className="text-lg font-bold text-white">{current} / {max}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-4">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              Actualiza a {requiredPlan} para obtener:
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                <span>Límite mayor de {resourceName}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                <span>Acceso a módulos adicionales</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                <span>Más usuarios en tu equipo</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                <span>Soporte prioritario</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cerrar
          </Button>
          <Button asChild className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto">
            <Link href="/upgrade" className="flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Ver planes
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
