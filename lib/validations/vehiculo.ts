import { z } from "zod";

export const vehiculoSchema = z.object({
  patente: z
    .string()
    .min(1, "La patente es requerida")
    .max(20, "La patente es muy larga")
    .regex(/^[A-Z0-9\s-]+$/i, "Patente inválida"),
  vin: z
    .string()
    .max(50, "El VIN es muy largo")
    .optional()
    .or(z.literal("")),
  modeloMarca: z
    .string()
    .min(1, "Modelo y Marca son requeridos")
    .max(100, "Modelo y Marca son muy largos"),
  combustible: z
    .string()
    .min(1, "El combustible es requerido"),
  color: z
    .string()
    .max(30, "El color es muy largo")
    .optional()
    .or(z.literal("")),
  año: z
    .string()
    .optional()
    .or(z.literal("")),
  kilometraje: z
    .string()
    .optional()
    .or(z.literal("")),
  datosAdicionales: z
    .string()
    .max(500, "Los datos adicionales son muy largos")
    .optional()
    .or(z.literal("")),
  clienteId: z
    .string()
    .optional()
    .or(z.literal("")),
  nombreDueno: z
    .string()
    .max(100, "El nombre del dueño es muy largo")
    .optional()
    .or(z.literal("")),
});

export type VehiculoFormData = z.infer<typeof vehiculoSchema>;
