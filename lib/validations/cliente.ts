import { z } from "zod";

export const clienteSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "El nombre es muy largo"),
  apellido: z
    .string()
    .min(1, "El apellido es requerido")
    .max(50, "El apellido es muy largo"),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  telefono: z
    .string()
    .min(1, "El teléfono es requerido")
    .regex(/^[0-9+\-\s()]+$/, "Teléfono inválido"),
  direccion: z
    .string()
    .max(200, "La dirección es muy larga")
    .optional()
    .or(z.literal("")),
  cuit: z
    .string()
    .regex(/^[0-9\-]+$/, "CUIT inválido")
    .optional()
    .or(z.literal("")),
  profesion: z
    .string()
    .max(100, "La profesión es muy larga")
    .optional()
    .or(z.literal("")),
  ciudad: z
    .string()
    .max(100, "La ciudad es muy larga")
    .optional()
    .or(z.literal("")),
  notas: z
    .string()
    .max(500, "Las notas son muy largas")
    .optional()
    .or(z.literal("")),
  observaciones: z
    .string()
    .max(500, "Las observaciones son muy largas")
    .optional()
    .or(z.literal("")),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;
