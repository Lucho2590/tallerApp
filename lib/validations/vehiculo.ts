import { z } from "zod";

export const vehiculoSchema = z.object({
  clienteId: z
    .string()
    .min(1, "El cliente es requerido"),
  marca: z
    .string()
    .min(1, "La marca es requerida")
    .max(50, "La marca es muy larga"),
  modelo: z
    .string()
    .min(1, "El modelo es requerido")
    .max(50, "El modelo es muy largo"),
  año: z
    .number({ message: "El año debe ser un número" })
    .min(1900, "Año inválido")
    .max(new Date().getFullYear() + 1, "Año inválido"),
  patente: z
    .string()
    .min(1, "La patente es requerida")
    .max(20, "La patente es muy larga")
    .regex(/^[A-Z0-9\s-]+$/i, "Patente inválida"),
  color: z
    .string()
    .max(30, "El color es muy largo")
    .optional()
    .or(z.literal("")),
  nChasis: z
    .string()
    .max(50, "El número de chasis es muy largo")
    .optional()
    .or(z.literal("")),
  kilometraje: z
    .number({ message: "El kilometraje debe ser un número" })
    .min(0, "El kilometraje no puede ser negativo")
    .max(9999999, "Kilometraje inválido")
    .optional()
    .nullable(),
  datosAdicionales: z
    .string()
    .max(500, "Los datos adicionales son muy largos")
    .optional()
    .or(z.literal("")),
  notas: z
    .string()
    .max(500, "Las notas son muy largas")
    .optional()
    .or(z.literal("")),
});

export type VehiculoFormData = z.infer<typeof vehiculoSchema>;
