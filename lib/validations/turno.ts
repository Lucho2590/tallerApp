import { z } from "zod";
import { EstadoTurno } from "@/types";

export const turnoSchema = z.object({
  clienteId: z
    .string()
    .min(1, "El cliente es requerido"),
  vehiculoId: z
    .string()
    .min(1, "El vehículo es requerido"),
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
});

export type TurnoFormData = z.infer<typeof turnoSchema>;
