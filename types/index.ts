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
  FACTURADO = "facturado",
  CANCELADO = "cancelado",
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
  clienteId: string;
  marca: string;
  modelo: string;
  año: number;
  patente: string;
  color?: string;
  nChasis?: string;
  kilometraje?: number;
  datosAdicionales?: string;
  notas?: string;
}

// Turno
export interface Turno extends BaseEntity {
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
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria?: string;
}

// Presupuesto
export interface Presupuesto extends BaseEntity {
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
  numero: string;
  clienteId: string;
  vehiculoId: string;
  presupuestoId?: string;
  turnoId?: string;
  descripcion: string;
  items: TrabajoItem[];
  subtotal: number;
  iva: number;
  total: number;
  estado: EstadoTrabajo;
  fechaInicio: Date;
  fechaFinalizacion?: Date;
  tecnico?: string;
  notas?: string;
}

export interface TrabajoItem {
  productoId?: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

// Movimiento de Caja
export interface MovimientoCaja extends BaseEntity {
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
