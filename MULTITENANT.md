# 🏢 Guía de Migración a Arquitectura Multitenant

Esta guía detalla cómo convertir Taller App en una aplicación multitenant (SaaS) que pueda servir a múltiples talleres simultáneamente.

## 📖 ¿Qué es Multitenant?

**Multitenant** es una arquitectura donde **una sola instancia de la aplicación sirve a múltiples talleres (tenants)**, cada uno con sus propios datos completamente aislados.

### Ejemplo Práctico:
- **Taller "AutoService"** → Sus clientes, vehículos, trabajos
- **Taller "MecánicaRápida"** → Sus propios datos independientes
- **Taller "TallerDelSur"** → Datos completamente aislados

Todos usando la misma aplicación, pero cada uno ve únicamente **SU información**.

---

## 🎯 Estado Actual de la Aplicación

### ✅ Ventajas para Migración

La aplicación está **muy bien preparada** para convertirse en multitenant:

1. **Arquitectura limpia**: Separación clara de servicios, hooks y validaciones
2. **Firebase Firestore**: Ideal para multitenant (mejor que SQL)
3. **Código moderno**: Base fresca sin legacy code
4. **Auth implementado**: Sistema de autenticación ya funcionando
5. **TypeScript**: Tipos fuertemente definidos facilitan refactoring

### ⚠️ Limitaciones Actuales

- No hay concepto de `tenantId` en el modelo de datos
- Queries no filtran por tenant
- No existe gestión de talleres/organizaciones
- Usuarios solo pertenecen a un "tenant implícito"

---

## 🔧 Cambios Necesarios

### 1️⃣ Modelo de Datos (Complejidad: Media)

#### Antes (Single Tenant):
```typescript
clientes/
  clienteId/
    nombre: "Juan Pérez"
    telefono: "123456789"
    email: "juan@email.com"
```

#### Después (Multitenant):
```typescript
clientes/
  clienteId/
    tenantId: "taller-autoservice"  // ⬅️ NUEVO CAMPO
    nombre: "Juan Pérez"
    telefono: "123456789"
    email: "juan@email.com"
```

#### Nueva Colección: Tenants
```typescript
tenants/
  tenant-id/
    nombre: "AutoService"
    razonSocial: "AutoService S.R.L."
    cuit: "20-12345678-9"
    email: "contacto@autoservice.com"
    telefono: "223-1234567"
    direccion: "Av. Principal 123"
    plan: "premium" | "basic" | "trial"
    activo: true
    fechaCreacion: Timestamp
    configuracion: {
      maxUsuarios: 10
      maxClientes: 1000
      modulos: ["clientes", "vehiculos", "trabajos", "agenda"]
    }
```

#### Relación Usuario-Tenant
```typescript
users/
  userId/
    nombre: "Admin"
    email: "admin@autoservice.com"
    tenants: ["taller-1", "taller-2"]  // Usuario puede estar en varios talleres
    currentTenantId: "taller-1"        // Taller activo actualmente
    rolesByTenant: {
      "taller-1": "admin",
      "taller-2": "user"
    }
```

---

### 2️⃣ Servicios con Filtro Tenant (Complejidad: Baja-Media)

#### Antes:
```typescript
// services/clientes/clientesService.ts
async getAll() {
  const snapshot = await getDocs(collection(db, "clientes"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

#### Después:
```typescript
// services/clientes/clientesService.ts
async getAll(tenantId: string) {
  const q = query(
    collection(db, "clientes"),
    where("tenantId", "==", tenantId)  // ⬅️ FILTRO POR TENANT
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async create(data: Cliente, tenantId: string) {
  const docRef = await addDoc(collection(db, "clientes"), {
    ...data,
    tenantId,  // ⬅️ SIEMPRE INCLUIR TENANT ID
    fechaCreacion: serverTimestamp(),
  });
  return docRef.id;
}
```

#### Archivos a Modificar:
- `services/clientes/clientesService.ts`
- `services/vehiculos/vehiculosService.ts`
- `services/trabajos/trabajosService.ts`
- `services/agenda/turnosService.ts`
- Todos los services existentes

---

### 3️⃣ Context de Tenant (Complejidad: Media)

Crear un nuevo contexto para gestionar el tenant activo:

```typescript
// contexts/TenantContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface Tenant {
  id: string;
  nombre: string;
  plan: string;
  activo: boolean;
}

interface TenantContextType {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  switchTenant: (tenantId: string) => void;
  loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Cargar tenants del usuario
      loadUserTenants(user.id);
    }
  }, [user]);

  const loadUserTenants = async (userId: string) => {
    // Implementar carga de tenants del usuario
  };

  const switchTenant = (tenantId: string) => {
    // Cambiar tenant activo
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
      // Guardar en localStorage o actualizar en Firebase
      localStorage.setItem("currentTenantId", tenantId);
    }
  };

  return (
    <TenantContext.Provider value={{ currentTenant, tenants, switchTenant, loading }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error("useTenant must be used within TenantProvider");
  return context;
};
```

---

### 4️⃣ Hooks Actualizados (Complejidad: Baja)

#### Antes:
```typescript
// hooks/clientes/useClientes.ts
export function useClientes() {
  const fetchClientes = async () => {
    const data = await clientesService.getAll();
    setClientes(data);
  };
}
```

#### Después:
```typescript
// hooks/clientes/useClientes.ts
import { useTenant } from "@/contexts/TenantContext";

export function useClientes() {
  const { currentTenant } = useTenant();  // ⬅️ OBTENER TENANT ACTUAL

  const fetchClientes = async () => {
    if (!currentTenant) return;
    const data = await clientesService.getAll(currentTenant.id);  // ⬅️ PASAR TENANT ID
    setClientes(data);
  };
}
```

---

### 5️⃣ Reglas de Seguridad Firebase (Complejidad: Media)

Actualizar las reglas de Firestore para garantizar aislamiento de datos:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: Verificar que el usuario pertenece al tenant
    function belongsToTenant(tenantId) {
      return request.auth != null
        && tenantId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.tenants;
    }

    // Regla para clientes
    match /clientes/{clienteId} {
      allow read: if request.auth != null
        && belongsToTenant(resource.data.tenantId);

      allow create: if request.auth != null
        && belongsToTenant(request.resource.data.tenantId)
        && request.resource.data.tenantId in request.auth.token.tenants;

      allow update, delete: if request.auth != null
        && belongsToTenant(resource.data.tenantId);
    }

    // Regla para vehículos
    match /vehiculos/{vehiculoId} {
      allow read: if request.auth != null
        && belongsToTenant(resource.data.tenantId);

      allow create: if request.auth != null
        && belongsToTenant(request.resource.data.tenantId);

      allow update, delete: if request.auth != null
        && belongsToTenant(resource.data.tenantId);
    }

    // Regla para trabajos
    match /trabajos/{trabajoId} {
      allow read: if request.auth != null
        && belongsToTenant(resource.data.tenantId);

      allow create: if request.auth != null
        && belongsToTenant(request.resource.data.tenantId);

      allow update, delete: if request.auth != null
        && belongsToTenant(resource.data.tenantId);
    }

    // Regla para tenants
    match /tenants/{tenantId} {
      allow read: if request.auth != null
        && tenantId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.tenants;

      allow update: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rolesByTenant[tenantId] == "admin";
    }

    // Regla para usuarios
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

### 6️⃣ UI: Selector de Tenant (Complejidad: Baja)

Agregar componente para cambiar entre talleres:

```typescript
// components/layout/TenantSwitcher.tsx
"use client";

import { useTenant } from "@/contexts/TenantContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

export function TenantSwitcher() {
  const { currentTenant, tenants, switchTenant } = useTenant();

  if (tenants.length <= 1) return null; // No mostrar si solo tiene 1 taller

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select
        value={currentTenant?.id}
        onValueChange={switchTenant}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar taller" />
        </SelectTrigger>
        <SelectContent>
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id}>
              {tenant.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

Integrar en el sidebar:
```typescript
// components/layout/sidebar.tsx
import { TenantSwitcher } from "./TenantSwitcher";

export function Sidebar() {
  return (
    <div className="...">
      <div className="border-b p-6">
        {/* Header existente */}
      </div>

      <TenantSwitcher />  {/* ⬅️ AGREGAR AQUÍ */}

      <nav className="...">
        {/* Navegación existente */}
      </nav>
    </div>
  );
}
```

---

### 7️⃣ Migración de Datos Existentes (Complejidad: Baja)

Script para migrar datos actuales:

```typescript
// scripts/migrate-to-multitenant.ts
import { db } from "@/lib/firebase/config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const DEFAULT_TENANT_ID = "taller-default"; // ID del tenant por defecto

async function migrateCollection(collectionName: string) {
  console.log(`Migrando colección: ${collectionName}`);

  const snapshot = await getDocs(collection(db, collectionName));

  for (const document of snapshot.docs) {
    const data = document.data();

    // Solo migrar si no tiene tenantId
    if (!data.tenantId) {
      await updateDoc(doc(db, collectionName, document.id), {
        tenantId: DEFAULT_TENANT_ID
      });
      console.log(`✅ Migrado: ${collectionName}/${document.id}`);
    }
  }
}

async function migrate() {
  try {
    // Primero crear el tenant por defecto
    await createDefaultTenant();

    // Migrar todas las colecciones
    await migrateCollection("clientes");
    await migrateCollection("vehiculos");
    await migrateCollection("trabajos");
    await migrateCollection("turnos");

    console.log("✅ Migración completada!");
  } catch (error) {
    console.error("❌ Error en migración:", error);
  }
}

migrate();
```

---

## ⏱️ Estimación de Esfuerzo

| Tarea | Complejidad | Tiempo Estimado |
|-------|-------------|-----------------|
| 1. Diseño de modelo de tenants | Media | 1 día |
| 2. Crear colección y tipos de tenants | Baja | 0.5 días |
| 3. Implementar TenantContext | Media | 1 día |
| 4. Modificar todos los services (6 archivos) | Media | 3 días |
| 5. Actualizar todos los hooks (6 archivos) | Baja | 2 días |
| 6. Crear UI de selector de tenant | Baja | 0.5 días |
| 7. Implementar reglas de seguridad | Media | 1.5 días |
| 8. Script de migración de datos | Baja | 0.5 días |
| 9. Testing exhaustivo | Alta | 2-3 días |
| 10. Documentación | Baja | 1 día |
| **TOTAL** | - | **13-14 días** |

---

## 🎯 Estrategias de Implementación

### Opción A: Big Bang (Todo de una vez)
**Cronograma:** 2-3 semanas

✅ **Ventajas:**
- Implementación completa y correcta desde el inicio
- No hay deuda técnica
- Todo funciona multitenant al terminar

❌ **Desventajas:**
- Parar desarrollo de features
- Riesgo si algo falla
- No puedes avanzar con otras funcionalidades

**Cuándo usar:** Si ya tenés 2+ clientes esperando usar la app.

---

### Opción B: Gradual (Recomendada)
**Cronograma:** 4-6 semanas

**Fase 1 (Semana 1-2):** Preparar el terreno
- Crear colección `tenants`
- Implementar `TenantContext`
- Agregar campo `tenantId` a tipos TypeScript

**Fase 2 (Semana 3-4):** Migración de servicios
- Actualizar services uno por uno
- Testear cada módulo
- Migrar datos existentes

**Fase 3 (Semana 5):** Reglas de seguridad
- Implementar reglas Firebase
- Testing de seguridad
- Verificar aislamiento de datos

**Fase 4 (Semana 6):** UI y pulido
- Agregar selector de tenant
- Onboarding de nuevos tenants
- Documentación

✅ **Ventajas:**
- Menor riesgo
- Puedes seguir desarrollando features
- Testing incremental

❌ **Desventajas:**
- Toma más tiempo total
- Código en estado "mixto" temporalmente

**Cuándo usar:** Si estás validando el producto aún.

---

### Opción C: Preparar sin implementar
**Cronograma:** 1 semana

- Crear abstraction layer en servicios
- Preparar estructura para `tenantId`
- No hacer cambios reales todavía

✅ **Ventajas:**
- No interrumpe desarrollo
- Fácil de implementar después
- Bajo riesgo

❌ **Desventajas:**
- No es multitenant real
- Deuda técnica temporal

**Cuándo usar:** Si no tenés claro si lo necesitás.

---

## 💡 Recomendación Personal

### Para tu caso específico:

1. ✅ **Terminá el MVP** completo (Presupuestos, Productos, Caja)
2. ✅ **Conseguí 1-2 talleres** probando la app (single-tenant está bien)
3. ✅ **Validá el modelo de negocio** - ¿Realmente quieren pagarla?
4. ✅ **Recién ahí implementá multitenant**

### ¿Por qué?

Multitenant es una **decisión de NEGOCIO**, no técnica:

- 🏢 **1 solo taller (el tuyo)** → No necesitás multitenant
- 🚀 **Vender como SaaS a múltiples talleres** → SÍ lo necesitás

No inviertas 2-3 semanas en multitenant si:
- No tenés clientes confirmados
- No validaste que pagarían por la app
- Todavía estás puliendo features core

**Primero validá el producto, después escalá la arquitectura.**

---

## 🔒 Consideraciones de Seguridad

### Crítico para Multitenant:

1. **Aislamiento de datos absoluto**
   - Nunca filtrar por tenant en el frontend únicamente
   - Siempre validar en reglas de Firebase
   - Nunca confiar en el cliente

2. **Autenticación robusta**
   - Verificar permisos en cada operación
   - Roles por tenant (admin en uno, user en otro)
   - Tokens con claims de tenant

3. **Audit trail**
   - Registrar quién accede a qué
   - Log de cambios de tenant
   - Monitoreo de accesos sospechosos

---

## 📚 Recursos Adicionales

### Documentación Firebase:
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Query Best Practices](https://firebase.google.com/docs/firestore/query-data/queries)
- [Multi-tenancy Patterns](https://cloud.google.com/firestore/docs/solutions/multi-tenancy)

### Arquitecturas de Referencia:
- [Slack](https://slack.engineering/how-slack-built-shared-channels/) - Multi-tenant messaging
- [Atlassian](https://www.atlassian.com/engineering/building-multi-tenant-architecture) - SaaS architecture
- [Auth0](https://auth0.com/docs/manage-users/organizations/multi-tenancy) - Multi-tenant auth

---

## 🤝 ¿Necesitás Ayuda?

Si decidís implementar multitenant, puedo ayudarte con:

1. ✅ Diseñar la arquitectura completa específica para tu caso
2. ✅ Crear plan de migración sin downtime
3. ✅ Implementar paso a paso cada módulo
4. ✅ Escribir tests de seguridad
5. ✅ Revisar código y reglas Firebase

---

**Última actualización:** Noviembre 2025
**Versión de la app:** 1.0.0 (Single-tenant)
**Documento creado por:** Claude Code
