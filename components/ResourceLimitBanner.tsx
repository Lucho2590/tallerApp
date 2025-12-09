"use client"

import { AlertTriangle, TrendingUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

interface ResourceLimitBannerProps {
  resourceName: string
  current: number
  max: number
  percentage: number
}

/**
 * Banner que se muestra cuando un recurso está cerca del límite (80%+)
 */
export function ResourceLimitBanner({
  resourceName,
  current,
  max,
  percentage,
}: ResourceLimitBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="mb-6 rounded-lg border border-orange-500/20 bg-orange-500/10 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-orange-500 mb-1">
              Te estás acercando al límite
            </h3>
            <p className="text-sm text-slate-300 mb-3">
              Has usado <strong>{current} de {max}</strong> {resourceName} ({percentage.toFixed(0)}% del límite).
              Considera actualizar tu plan para continuar sin interrupciones.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/upgrade">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Actualizar plan
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="sm" variant="ghost" className="text-orange-400 hover:text-orange-300">
                  Ver planes
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="mt-4 w-full bg-slate-800 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            percentage >= 95
              ? "bg-red-500"
              : percentage >= 80
              ? "bg-orange-500"
              : "bg-green-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}
