import { z } from "zod";
import { TipoPago } from "@/types";

export const movimientoCajaSchema = z.object({
  tipo: z.enum(["ingreso", "egreso"], {
    message: "El tipo de movimiento es requerido",
  }),
  monto: z.number().min(0.01, "El monto debe ser mayor a 0"),
  concepto: z
    .string()
    .min(3, "El concepto debe tener al menos 3 caracteres")
    .max(200, "El concepto es muy largo"),
  metodoPago: z.nativeEnum(TipoPago),
  trabajoId: z.string().optional(),
  fecha: z.date(),
  notas: z.string().optional(),
});

export type MovimientoCajaFormData = z.infer<typeof movimientoCajaSchema>;
