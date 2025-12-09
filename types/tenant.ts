import { Timestamp } from "firebase/firestore";

/**
 * Simplified Tenant (workshop) entity
 * MVP: 1 usuario = 1 taller, sin límites, sin planes
 */
export interface Tenant {
  id: string;

  // Basic info
  name: string;                    // Workshop name
  legalName?: string;              // Legal business name
  taxId?: string;                  // CUIT/Tax ID

  // Contact info
  email: string;
  phone?: string;
  website?: string;

  // Address
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  // Status
  active: boolean;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Metadata
  logo?: string;                   // URL to logo
  primaryColor?: string;           // Brand color
  timezone: string;                // e.g., "America/Argentina/Buenos_Aires"
  locale: string;                  // e.g., "es-AR"
  currency: string;                // e.g., "ARS"

  // Owner reference
  ownerId: string;                 // User ID of the owner
}

/**
 * Simplified user type
 * MVP: Each user has exactly ONE tenant (their own workshop)
 */
export interface TenantUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;

  // Single tenant reference
  tenantId?: string;               // User's workshop ID (created during onboarding)

  // Super Admin flag (for /sudo access)
  isSuperAdmin?: boolean;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
