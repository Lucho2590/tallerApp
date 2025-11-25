import { z } from "zod";
import { PrioridadTrabajo } from "@/types";

// Schema para item de trabajo
export const trabajoItemSchema = z.object({
  id: z.string(),
  descripcion: z.string().min(1, "Descripción es requerida"),
  cantidad: z.number().min(0.01, "Cantidad debe ser mayor a 0"),
  precioUnitario: z.number().min(0, "Precio debe ser mayor o igual a 0"),
  subtotal: z.number(),
});

// Schema para formulario de trabajo
export const trabajoSchema = z.object({
  clienteId: z.string().min(1, "Cliente es requerido"),
  vehiculoId: z.string().min(1, "Vehículo es requerido"),
  descripcionGeneral: z.string().optional().or(z.literal("")),
  items: z.array(trabajoItemSchema).min(1, "Debe agregar al menos un producto o servicio"),
  descuento: z.number().min(0).max(100).optional(),
  manoDeObra: z.number().min(0).optional(),
  aplicarIVA: z.boolean(),
  prioridad: z.nativeEnum(PrioridadTrabajo),
  tecnicoAsignado: z.string().optional().or(z.literal("")),
  observacionesTrabajo: z.string().optional().or(z.literal("")),
});

export type TrabajoFormData = z.infer<typeof trabajoSchema>;
export type TrabajoItemFormData = z.infer<typeof trabajoItemSchema>;
