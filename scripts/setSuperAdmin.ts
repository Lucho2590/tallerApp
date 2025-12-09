/**
 * Script to set a user as Super Admin
 *
 * Usage:
 * 1. Update the USER_EMAIL constant below with your email
 * 2. Run: npx ts-node scripts/setSuperAdmin.ts
 */

import { doc, getDoc, updateDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../lib/firebase/config";

// ⚠️ UPDATE THIS WITH YOUR EMAIL
const USER_EMAIL = "your-email@example.com";

async function setSuperAdmin() {
  try {
    console.log(`🔍 Buscando usuario con email: ${USER_EMAIL}`);

    // Find user by email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", USER_EMAIL));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("❌ No se encontró ningún usuario con ese email");
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    console.log(`✅ Usuario encontrado: ${userId}`);
    console.log(`   Nombre: ${userData.nombre} ${userData.apellido}`);
    console.log(`   Email: ${userData.email}`);

    // Check current structure
    console.log(`\n📊 Estructura actual:`);
    console.log(`   tenants:`, userData.tenants);
    console.log(`   isSuperAdmin:`, userData.isSuperAdmin);

    // Update user
    const userRef = doc(db, "users", userId);

    const updateData: any = {
      isSuperAdmin: true,
      updatedAt: new Date(),
    };

    // Fix tenants structure if it's an object (convert to array)
    if (userData.tenants && !Array.isArray(userData.tenants)) {
      console.log(`\n🔧 Convirtiendo tenants de objeto a array...`);
      const tenantsArray = Object.entries(userData.tenants).map(([tenantId, relation]: [string, any]) => ({
        tenantId,
        role: relation.role,
        joinedAt: relation.joinedAt,
        ...(relation.invitedBy && { invitedBy: relation.invitedBy }),
      }));
      updateData.tenants = tenantsArray;
      console.log(`   Convertido a array:`, tenantsArray);
    } else if (!userData.tenants) {
      // Initialize as empty array if doesn't exist
      updateData.tenants = [];
      console.log(`   Inicializando tenants como array vacío`);
    }

    await updateDoc(userRef, updateData);

    console.log(`\n✅ Usuario actualizado correctamente como Super Admin!`);
    console.log(`\n🎉 Ahora puedes acceder a /admin con este usuario`);

    // Show final state
    const updatedDoc = await getDoc(userRef);
    const updatedData = updatedDoc.data();
    console.log(`\n📊 Estructura final:`);
    console.log(`   tenants:`, updatedData?.tenants);
    console.log(`   isSuperAdmin:`, updatedData?.isSuperAdmin);

  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error);
  }
}

// Run the script
setSuperAdmin()
  .then(() => {
    console.log("\n✅ Script completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  });
