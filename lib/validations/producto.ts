import { z } from "zod";

export const productoSchema = z.object({
  codigo: z.string().optional(),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es muy largo"),
  descripcion: z.string().optional(),
  categoria: z.string().optional(),
  precio: z.number().min(0, "El precio no puede ser negativo"),
  precioCompra: z.number().min(0, "El precio de compra no puede ser negativo").optional(),
  stock: z.number().int("El stock debe ser un número entero").min(0, "El stock no puede ser negativo"),
  stockMinimo: z.number().int("El stock mínimo debe ser un número entero").min(0, "El stock mínimo no puede ser negativo").optional(),
  unidad: z.string().optional(),
  marca: z.string().optional(),
  proveedor: z.string().optional(),
  ubicacion: z.string().optional(),
  activo: z.boolean(),
});

export type ProductoFormData = z.infer<typeof productoSchema>;
