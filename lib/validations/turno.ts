import { z } from "zod";
import { EstadoTurno } from "@/types";

export const turnoSchema = z.object({
  // Cliente: puede ser existente (ID) o nuevo (datos temporales)
  clienteId: z.string().optional(),
  clienteTemp: z.object({
    nombre: z.string().min(1, "Nombre es requerido"),
    apellido: z.string(), // Puede estar vacío
    telefono: z.string().optional(),
  }).optional(),

  // Vehículo: puede ser existente (ID) o nuevo (datos temporales)
  vehiculoId: z.string().optional(),
  vehiculoTemp: z.object({
    patente: z.string().min(1, "Patente es requerida"),
    modeloMarca: z.string().min(1, "Modelo/Marca es requerido"),
  }).optional(),

  fecha: z
    .date({ message: "La fecha es requerida" }),
  horaInicio: z
    .string()
    .min(1, "La hora de inicio es requerida")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  horaFin: z
    .string()
    .min(1, "La hora de fin es requerida")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  descripcion: z
    .string()
    .min(1, "La descripción es requerida")
    .max(200, "La descripción es muy larga"),
  estado: z.nativeEnum(EstadoTurno),
  notas: z
    .string()
    .max(500, "Las notas son muy largas")
    .optional()
    .or(z.literal("")),
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

export type TurnoFormData = z.infer<typeof turnoSchema>;
