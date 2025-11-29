import { Timestamp } from "firebase/firestore";

/**
 * Subscription plan types for tenants
 */
export enum SubscriptionPlan {
  TRIAL = "trial",
  BASIC = "basic",
  PREMIUM = "premium",
  ENTERPRISE = "enterprise",
}

/**
 * User roles within a tenant
 */
export enum TenantRole {
  OWNER = "owner",      // Full control, billing, can delete tenant
  ADMIN = "admin",      // Full access to all features
  MANAGER = "manager",  // Can manage users and view reports
  USER = "user",        // Standard user access
  VIEWER = "viewer",    // Read-only access
}

/**
 * Tenant configuration and limits
 */
export interface TenantConfig {
  maxUsers: number;
  maxClients: number;
  maxVehicles: number;
  maxMonthlyJobs: number;
  modules: TenantModule[];
  features: TenantFeature[];
}

/**
 * Available modules for tenants
 */
export enum TenantModule {
  CLIENTS = "clients",
  VEHICLES = "vehicles",
  JOBS = "jobs",
  SCHEDULE = "schedule",
  QUOTES = "quotes",
  INVENTORY = "inventory",
  INVOICING = "invoicing",
  REPORTS = "reports",
}

/**
 * Premium features
 */
export enum TenantFeature {
  ADVANCED_REPORTS = "advanced_reports",
  API_ACCESS = "api_access",
  CUSTOM_BRANDING = "custom_branding",
  EMAIL_NOTIFICATIONS = "email_notifications",
  SMS_NOTIFICATIONS = "sms_notifications",
  MULTI_LOCATION = "multi_location",
}

/**
 * Main tenant (workshop) entity
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

  // Subscription
  plan: SubscriptionPlan;
  active: boolean;

  // Configuration
  config: TenantConfig;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  trialEndsAt?: Timestamp;

  // Metadata
  logo?: string;                   // URL to logo
  primaryColor?: string;           // Brand color
  timezone: string;                // e.g., "America/Argentina/Buenos_Aires"
  locale: string;                  // e.g., "es-AR"
  currency: string;                // e.g., "ARS"
}

/**
 * User-Tenant relationship
 * Stored in the user document
 */
export interface UserTenantRelation {
  tenantId: string;
  role: TenantRole;
  joinedAt: Timestamp;
  invitedBy?: string;              // User ID who invited
}

/**
 * Extended user type with multi-tenant support
 */
export interface TenantUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;

  // Multi-tenant fields
  tenants: UserTenantRelation[];   // All tenants user belongs to
  currentTenantId: string;         // Currently active tenant

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Tenant invitation
 */
export interface TenantInvitation {
  id: string;
  tenantId: string;
  email: string;
  role: TenantRole;
  invitedBy: string;               // User ID
  status: "pending" | "accepted" | "rejected" | "expired";
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

/**
 * Default configuration by plan
 */
export const DEFAULT_TENANT_CONFIG: Record<SubscriptionPlan, TenantConfig> = {
  [SubscriptionPlan.TRIAL]: {
    maxUsers: 2,
    maxClients: 50,
    maxVehicles: 50,
    maxMonthlyJobs: 20,
    modules: [
      TenantModule.CLIENTS,
      TenantModule.VEHICLES,
      TenantModule.JOBS,
    ],
    features: [],
  },
  [SubscriptionPlan.BASIC]: {
    maxUsers: 5,
    maxClients: 500,
    maxVehicles: 500,
    maxMonthlyJobs: 100,
    modules: [
      TenantModule.CLIENTS,
      TenantModule.VEHICLES,
      TenantModule.JOBS,
      TenantModule.SCHEDULE,
      TenantModule.QUOTES,
    ],
    features: [
      TenantFeature.EMAIL_NOTIFICATIONS,
    ],
  },
  [SubscriptionPlan.PREMIUM]: {
    maxUsers: 15,
    maxClients: -1,                // Unlimited
    maxVehicles: -1,
    maxMonthlyJobs: -1,
    modules: Object.values(TenantModule),
    features: [
      TenantFeature.EMAIL_NOTIFICATIONS,
      TenantFeature.SMS_NOTIFICATIONS,
      TenantFeature.ADVANCED_REPORTS,
      TenantFeature.CUSTOM_BRANDING,
    ],
  },
  [SubscriptionPlan.ENTERPRISE]: {
    maxUsers: -1,                  // Unlimited
    maxClients: -1,
    maxVehicles: -1,
    maxMonthlyJobs: -1,
    modules: Object.values(TenantModule),
    features: Object.values(TenantFeature),
  },
};
