// Export tenant types
export type { Tenant, TenantUser } from "./tenant"

// Enums
export enum UserRole {
  ADMIN = "admin",
  MODERADOR = "moderador",
  USER = "user",
}

export enum EstadoTurno {
  PENDIENTE = "pendiente",
  EN_PROGRESO = "en_progreso",
  COMPLETADO = "completado",
  CANCELADO = "cancelado",
}

export enum EstadoTrabajo {
  PENDIENTE = "pendiente",
  EN_PROGRESO = "en_progreso",
  COMPLETADO = "completado",
  CANCELADO = "cancelado",
}

export enum PrioridadTrabajo {
  BAJA = "baja",
  MEDIA = "media",
  ALTA = "alta",
  URGENTE = "urgente",
}

export enum EstadoPresupuesto {
  BORRADOR = "borrador",
  ENVIADO = "enviado",
  APROBADO = "aprobado",
  RECHAZADO = "rechazado",
}

export enum TipoPago {
  EFECTIVO = "efectivo",
  TARJETA = "tarjeta",
  TRANSFERENCIA = "transferencia",
  OTRO = "otro",
}

// Interfaces Base
export interface BaseEntity {
  id: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// Usuario
export interface User extends BaseEntity {
  email: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
}

// Cliente
export interface Cliente extends BaseEntity {
  tenantId: string; // 🏢 MULTITENANT
  nombre: string;
  apellido: string;
  email?: string;
  telefono: string;
  direccion?: string;
  cuit?: string;
  profesion?: string;
  ciudad?: string;
  notas?: string;
  observaciones?: string;
}

// Vehículo
export interface Vehiculo extends BaseEntity {
  tenantId: string; // 🏢 MULTITENANT
  patente: string;
  vin?: string; // vehicle identification number
  modeloMarca: string; // Campo unificado "Toyota Corolla", "Ford Focus", etc.
  combustible: string; // "Nafta", "Diesel", "GNC", etc.
  color?: string;
  año?: number;
  kilometraje?: number;
  datosAdicionales?: string;
  clienteId?: string; // Opcional: puede tener cliente registrado
  nombreDueno?: string; // Opcional: puede tener solo nombre sin ser cliente
  // Campos legacy para compatibilidad (deprecados)
  marca?: string;
  modelo?: string;
}

// Turno
export interface Turno extends BaseEntity {
  tenantId: string; // 🏢 MULTITENANT
  clienteId: string;
  vehiculoId: string;
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  estado: EstadoTurno;
  descripcion: string;
  notas?: string;
}

// Producto
export interface Producto extends BaseEntity {
  tenantId: string; // 🏢 MULTITENANT
  codigo?: string; // Código de producto/SKU
  nombre: string;
  descripcion?: string;
  categoria?: string;
  precio: number;
  precioCompra?: number; // Costo de compra
  stock: number;
  stockMinimo?: number; // Alerta de stock bajo
  unidad?: string; // "unidad", "litro", "metro", etc.
  marca?: string;
  proveedor?: string;
  ubicacion?: string; // Ubicación en depósito
  activo: boolean; // Si está disponible para venta
}

// Presupuesto
export interface Presupuesto extends BaseEntity {
  tenantId: string; // 🏢 MULTITENANT
  numero: string;
  clienteId: string;
  vehiculoId: string;
  items: PresupuestoItem[];
  subtotal: number;
  iva: number;
  total: number;
  estado: EstadoPresupuesto;
  validoHasta: Date;
  notas?: string;
}

export interface PresupuestoItem {
  productoId?: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

// Trabajo/Orden de Trabajo
export interface Trabajo extends BaseEntity {
  tenantId: string; // 🏢 MULTITENANT
  numero: string; // Número de orden autogenerado
  clienteId?: string; // Opcional si se usa clienteTemp
  vehiculoId?: string; // Opcional si se usa vehiculoTemp

  // Datos temporales de cliente (cuando no se guarda en la BD)
  clienteTemp?: {
    nombre: string;
    apellido: string;
    telefono?: string;
    email?: string;
  };

  // Datos temporales de vehículo (cuando no se guarda en la BD)
  vehiculoTemp?: {
    patente: string;
    modeloMarca: string;
  };

  descripcionGeneral?: string; // Descripción general del trabajo
  items: TrabajoItem[]; // Productos/servicios
  subtotal: number;
  descuento?: number; // Porcentaje de descuento
  manoDeObra?: number; // Costo de mano de obra
  impuestos: number; // Monto de impuestos (IVA)
  total: number;
  aplicarIVA: boolean; // Si se aplica IVA o no
  estado: EstadoTrabajo;
  prioridad: PrioridadTrabajo;
  tecnicoAsignado?: string;
  observacionesTrabajo?: string;
  fechaInicio?: Date;
  fechaFinalizacion?: Date;
}

export interface TrabajoItem {
  id: string; // ID único del item
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  productoId?: string; // Referencia al producto del inventario (opcional)
}

// Movimiento de Caja
export interface MovimientoCaja extends BaseEntity {
  tenantId: string; // 🏢 MULTITENANT
  tipo: "ingreso" | "egreso";
  monto: number;
  concepto: string;
  metodoPago: TipoPago;
  trabajoId?: string;
  fecha: Date;
  notas?: string;
}

// Tipos para formularios
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  confirmPassword: string;
}
