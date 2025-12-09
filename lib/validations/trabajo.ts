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
  // Cliente: puede ser existente (ID) o nuevo (datos temporales)
  clienteId: z.string().optional(),
  clienteTemp: z.object({
    nombre: z.string().min(1, "Nombre es requerido"),
    apellido: z.string().min(1, "Apellido es requerido"),
    telefono: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
  }).optional(),

  // Vehículo: puede ser existente (ID) o nuevo (datos temporales)
  vehiculoId: z.string().optional(),
  vehiculoTemp: z.object({
    patente: z.string().min(1, "Patente es requerida"),
    modeloMarca: z.string().min(1, "Modelo/Marca es requerido"),
  }).optional(),

  descripcionGeneral: z.string().optional().or(z.literal("")),
  items: z.array(trabajoItemSchema),
  descuento: z.number().min(0).max(100).optional(),
  manoDeObra: z.number().min(0).optional(),
  aplicarIVA: z.boolean(),
  prioridad: z.nativeEnum(PrioridadTrabajo),
  tecnicoAsignado: z.string().optional().or(z.literal("")),
  observacionesTrabajo: z.string().optional().or(z.literal("")),
}).refine(
  (data) => data.clienteId || data.clienteTemp,
  {
    message: "Debe seleccionar un cliente existente o ingresar datos de un cliente nuevo",
    path: ["clienteId"],
  }
).refine(
  (data) => data.vehiculoId || data.vehiculoTemp,
  {
    message: "Debe seleccionar un vehículo existente o ingresar datos de un vehículo nuevo",
    path: ["vehiculoId"],
  }
);

export type TrabajoFormData = z.infer<typeof trabajoSchema>;
export type TrabajoItemFormData = z.infer<typeof trabajoItemSchema>;
