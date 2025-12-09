import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { TenantRole } from "@/types/tenant"

export interface TenantInvitation {
  id: string
  tenantId: string
  email: string
  role: TenantRole
  invitedBy: string
  invitedByName: string
  tenantName: string
  status: "pending" | "accepted" | "rejected" | "expired"
  createdAt: Date
  expiresAt: Date
}

interface CreateInvitationData {
  tenantId: string
  tenantName: string
  email: string
  role: TenantRole
  invitedBy: string
  invitedByName: string
}

/**
 * Crea una nueva invitación para un usuario
 */
export async function createInvitation(data: CreateInvitationData): Promise<string> {
  try {
    // Verificar que no exista una invitación pendiente para este email y tenant
    const existingInvitation = await getInvitationByEmailAndTenant(data.email, data.tenantId)
    if (existingInvitation && existingInvitation.status === "pending") {
      throw new Error("Ya existe una invitación pendiente para este usuario")
    }

    // Crear fecha de expiración (7 días desde ahora)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitationsRef = collection(db, "invitations")
    const docRef = await addDoc(invitationsRef, {
      tenantId: data.tenantId,
      tenantName: data.tenantName,
      email: data.email.toLowerCase(),
      role: data.role,
      invitedBy: data.invitedBy,
      invitedByName: data.invitedByName,
      status: "pending",
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
    })

    return docRef.id
  } catch (error) {
    console.error("Error creating invitation:", error)
    throw error
  }
}

/**
 * Obtiene todas las invitaciones de un tenant
 */
export async function getInvitationsByTenant(tenantId: string): Promise<TenantInvitation[]> {
  try {
    const invitationsRef = collection(db, "invitations")
    const q = query(invitationsRef, where("tenantId", "==", tenantId))
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        tenantId: data.tenantId,
        email: data.email,
        role: data.role,
        invitedBy: data.invitedBy,
        invitedByName: data.invitedByName,
        tenantName: data.tenantName,
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || new Date(),
      }
    })
  } catch (error) {
    console.error("Error fetching invitations by tenant:", error)
    throw new Error("Failed to fetch invitations")
  }
}

/**
 * Obtiene todas las invitaciones pendientes para un email
 */
export async function getInvitationsByEmail(email: string): Promise<TenantInvitation[]> {
  try {
    const invitationsRef = collection(db, "invitations")
    const q = query(
      invitationsRef,
      where("email", "==", email.toLowerCase()),
      where("status", "==", "pending")
    )
    const snapshot = await getDocs(q)

    const now = new Date()
    const invitations: TenantInvitation[] = []

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data()
      const expiresAt = data.expiresAt?.toDate() || new Date()

      // Si expiró, actualizar el estado
      if (expiresAt < now && data.status === "pending") {
        await updateDoc(doc(db, "invitations", docSnap.id), {
          status: "expired",
        })
        continue
      }

      invitations.push({
        id: docSnap.id,
        tenantId: data.tenantId,
        email: data.email,
        role: data.role,
        invitedBy: data.invitedBy,
        invitedByName: data.invitedByName,
        tenantName: data.tenantName,
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        expiresAt,
      })
    }

    return invitations
  } catch (error) {
    console.error("Error fetching invitations by email:", error)
    throw new Error("Failed to fetch invitations")
  }
}

/**
 * Obtiene una invitación por email y tenant
 */
async function getInvitationByEmailAndTenant(
  email: string,
  tenantId: string
): Promise<TenantInvitation | null> {
  try {
    const invitationsRef = collection(db, "invitations")
    const q = query(
      invitationsRef,
      where("email", "==", email.toLowerCase()),
      where("tenantId", "==", tenantId),
      where("status", "==", "pending")
    )
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    const docSnap = snapshot.docs[0]
    const data = docSnap.data()

    return {
      id: docSnap.id,
      tenantId: data.tenantId,
      email: data.email,
      role: data.role,
      invitedBy: data.invitedBy,
      invitedByName: data.invitedByName,
      tenantName: data.tenantName,
      status: data.status,
      createdAt: data.createdAt?.toDate() || new Date(),
      expiresAt: data.expiresAt?.toDate() || new Date(),
    }
  } catch (error) {
    console.error("Error fetching invitation:", error)
    return null
  }
}

/**
 * Obtiene una invitación por ID
 */
export async function getInvitationById(invitationId: string): Promise<TenantInvitation | null> {
  try {
    const invitationRef = doc(db, "invitations", invitationId)
    const invitationDoc = await getDoc(invitationRef)

    if (!invitationDoc.exists()) {
      return null
    }

    const data = invitationDoc.data()
    const expiresAt = data.expiresAt?.toDate() || new Date()
    const now = new Date()

    // Si expiró, actualizar el estado
    if (expiresAt < now && data.status === "pending") {
      await updateDoc(invitationRef, {
        status: "expired",
      })

      return {
        id: invitationDoc.id,
        tenantId: data.tenantId,
        email: data.email,
        role: data.role,
        invitedBy: data.invitedBy,
        invitedByName: data.invitedByName,
        tenantName: data.tenantName,
        status: "expired",
        createdAt: data.createdAt?.toDate() || new Date(),
        expiresAt,
      }
    }

    return {
      id: invitationDoc.id,
      tenantId: data.tenantId,
      email: data.email,
      role: data.role,
      invitedBy: data.invitedBy,
      invitedByName: data.invitedByName,
      tenantName: data.tenantName,
      status: data.status,
      createdAt: data.createdAt?.toDate() || new Date(),
      expiresAt,
    }
  } catch (error) {
    console.error("Error fetching invitation:", error)
    throw new Error("Failed to fetch invitation")
  }
}

/**
 * Acepta una invitación y agrega al usuario al tenant
 */
export async function acceptInvitation(invitationId: string, userId: string): Promise<void> {
  try {
    const invitation = await getInvitationById(invitationId)

    if (!invitation) {
      throw new Error("Invitación no encontrada")
    }

    if (invitation.status !== "pending") {
      throw new Error(`La invitación está ${invitation.status}`)
    }

    // Actualizar estado de la invitación
    await updateDoc(doc(db, "invitations", invitationId), {
      status: "accepted",
    })

    // Agregar usuario al tenant (esto lo hace addUserToTenant)
    const { addUserToTenant } = await import("@/services/tenants/tenantsService")
    await addUserToTenant(
      invitation.tenantId,
      userId,
      invitation.role,
      invitation.invitedBy
    )
  } catch (error) {
    console.error("Error accepting invitation:", error)
    throw error
  }
}

/**
 * Rechaza una invitación
 */
export async function rejectInvitation(invitationId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "invitations", invitationId), {
      status: "rejected",
    })
  } catch (error) {
    console.error("Error rejecting invitation:", error)
    throw new Error("Failed to reject invitation")
  }
}

/**
 * Cancela una invitación (solo el que invitó o un admin)
 */
export async function cancelInvitation(invitationId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "invitations", invitationId))
  } catch (error) {
    console.error("Error canceling invitation:", error)
    throw new Error("Failed to cancel invitation")
  }
}

/**
 * Cuenta las invitaciones pendientes de un tenant
 */
export async function countPendingInvitations(tenantId: string): Promise<number> {
  try {
    const invitationsRef = collection(db, "invitations")
    const q = query(
      invitationsRef,
      where("tenantId", "==", tenantId),
      where("status", "==", "pending")
    )
    const snapshot = await getDocs(q)
    return snapshot.size
  } catch (error) {
    console.error("Error counting pending invitations:", error)
    return 0
  }
}
