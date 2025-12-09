# 🚀 PLAN DE IMPLEMENTACIÓN - TALLERAPP
## Roadmap Completo de Funcionalidades Faltantes

---

## 📋 FASE 1: SEGURIDAD Y CONTROL DE ACCESO (CRÍTICO)
**Objetivo:** Hacer que el sistema de planes funcione correctamente y sea seguro
**Duración estimada:** Sprint 1-2

### 1.1 - Validación de Módulos por Plan ⭐⭐⭐
**Descripción:** Implementar verificación real de qué módulos puede usar cada tenant según su plan

**Tareas:**
- [ ] Crear hook `useModuleAccess(module: TenantModule)` que verifica si el módulo está habilitado
- [ ] Crear componente `<ModuleGuard module={TenantModule}>` para proteger componentes
- [ ] Agregar verificación en cada ruta de módulos (`/productos`, `/presupuestos`, etc.)
- [ ] Mostrar mensaje "Módulo no disponible en tu plan" con CTA para upgrade
- [ ] Crear página `/upgrade` para cambiar de plan
- [ ] Agregar funciones Cloud para validar en backend (opcional pero recomendado)

**Archivos a crear/modificar:**
- `hooks/useModuleAccess.ts` (nuevo)
- `components/guards/ModuleGuard.tsx` (nuevo)
- `app/(private)/productos/page.tsx` (agregar guard)
- `app/(private)/presupuestos/page.tsx` (agregar guard)
- `app/(private)/caja/page.tsx` (agregar guard)
- `app/upgrade/page.tsx` (nuevo)

**Criterio de éxito:**
- Usuario con plan TRIAL no puede acceder a `/productos`
- Usuario con plan BASIC puede acceder a `/productos` pero no a reportes avanzados
- Mensaje claro de "upgrade requerido"

---

### 1.2 - Validación de Límites de Recursos ⭐⭐⭐
**Descripción:** Validar que no se excedan los límites del plan (maxUsers, maxClients, etc.)

**Tareas:**
- [ ] Crear hook `useResourceLimits()` que verifica límites actuales vs máximos
- [ ] Validar en formulario de nuevo cliente si se excede `maxClients`
- [ ] Validar en formulario de nuevo vehículo si se excede `maxVehicles`
- [ ] Validar al crear trabajo si se excede `maxMonthlyJobs`
- [ ] Validar al invitar usuario si se excede `maxUsers`
- [ ] Mostrar banner de warning cuando estás cerca del límite (80%)
- [ ] Mostrar modal bloqueante cuando alcanzas el límite con CTA a upgrade
- [ ] Agregar contador de uso en `/organizacion` (ej: "15/50 clientes")

**Archivos a crear/modificar:**
- `hooks/useResourceLimits.ts` (nuevo)
- `components/ResourceLimitBanner.tsx` (nuevo)
- `components/ResourceLimitModal.tsx` (nuevo)
- `app/(private)/clientes/page.tsx` (agregar validación)
- `app/(private)/vehiculos/page.tsx` (agregar validación)
- `app/(private)/trabajos/nuevo/page.tsx` (agregar validación)
- `app/(private)/organizacion/page.tsx` (agregar contadores)

**Criterio de éxito:**
- Usuario con 50/50 clientes no puede crear más
- Banner aparece al llegar a 40/50 (80%)
- Modal muestra opciones de upgrade

---

### 1.3 - Fortalecer Middleware de Autenticación ⭐⭐
**Descripción:** Implementar validación real de autenticación en el middleware

**Tareas:**
- [ ] Modificar `middleware.ts` para verificar auth con Firebase Admin SDK
- [ ] Redirigir a `/login` si no hay sesión válida
- [ ] Verificar `needsOnboarding` en middleware
- [ ] Cachear validación de auth para performance
- [ ] Agregar headers de seguridad

**Archivos a modificar:**
- `middleware.ts`
- `lib/firebase/admin.ts` (nuevo - Firebase Admin SDK)

**Criterio de éxito:**
- Usuarios no autenticados son redirigidos desde rutas protegidas
- No se puede acceder a rutas privadas sin token válido

---

## 📋 FASE 2: GESTIÓN DE USUARIOS Y ROLES (ALTA PRIORIDAD)
**Objetivo:** Permitir que owners gestionen su equipo
**Duración estimada:** Sprint 3-4

### 2.1 - Sistema de Invitaciones ⭐⭐⭐
**Descripción:** Implementar flujo completo para invitar empleados

**Tareas:**
- [ ] Crear `services/invitations/invitationsService.ts`
  - `createInvitation(tenantId, email, role)`
  - `getInvitationsByTenant(tenantId)`
  - `getInvitationsByEmail(email)`
  - `acceptInvitation(invitationId)`
  - `rejectInvitation(invitationId)`
  - `cancelInvitation(invitationId)`
- [ ] Crear página `/organizacion/equipo` para gestionar empleados
- [ ] Crear formulario "Invitar empleado" con email y rol
- [ ] Enviar email de invitación (Firebase Extension o Resend)
- [ ] Crear página `/invitaciones/[id]` para aceptar/rechazar
- [ ] Mostrar invitaciones pendientes en navbar o dashboard
- [ ] Agregar Cloud Function para limpiar invitaciones expiradas (7 días)

**Archivos a crear/modificar:**
- `services/invitations/invitationsService.ts` (nuevo)
- `app/(private)/organizacion/equipo/page.tsx` (nuevo)
- `app/(private)/invitaciones/[id]/page.tsx` (nuevo)
- `components/InvitationCard.tsx` (nuevo)
- `lib/email/sendInvitation.ts` (nuevo)

**Criterio de éxito:**
- Owner puede invitar empleado por email
- Empleado recibe email con link
- Empleado puede aceptar y se agrega al tenant
- Owner puede cancelar invitación pendiente
- Owner ve listado de empleados actuales

---

### 2.2 - Gestión de Empleados por Owner ⭐⭐
**Descripción:** CRUD de empleados dentro de la organización

**Tareas:**
- [ ] Crear tabla de empleados en `/organizacion/equipo`
- [ ] Permitir cambiar rol de empleado (owner/admin puede)
- [ ] Permitir desactivar empleado (soft delete)
- [ ] Permitir reactivar empleado
- [ ] Permitir eliminar empleado del tenant (hard delete)
- [ ] Mostrar último login de cada empleado
- [ ] Filtrar por rol
- [ ] Validar permisos: solo OWNER y ADMIN pueden gestionar equipo

**Archivos a crear/modificar:**
- `app/(private)/organizacion/equipo/page.tsx` (expandir)
- `services/tenants/tenantsService.ts` (agregar `removeUserFromTenant()`)
- `components/EmployeeTable.tsx` (nuevo)
- `components/EmployeeActionsMenu.tsx` (nuevo)

**Criterio de éxito:**
- Owner ve lista completa de empleados
- Owner puede cambiar rol de empleado
- Owner puede remover empleado del tenant
- Empleado común NO puede acceder a esta página

---

### 2.3 - Control de Permisos por Rol ⭐⭐
**Descripción:** Diferenciar qué puede hacer cada rol dentro del tenant

**Tareas:**
- [ ] Crear hook `usePermissions()` que retorna permisos del usuario
- [ ] Definir matriz de permisos por rol:
  - OWNER: todo
  - ADMIN: todo excepto eliminar tenant y cambiar plan
  - MANAGER: CRUD clientes/vehículos/trabajos, ver reportes
  - USER: CRUD trabajos, ver clientes/vehículos
  - VIEWER: solo lectura
- [ ] Crear componente `<PermissionGuard permission={...}>`
- [ ] Aplicar guards en botones de acciones
- [ ] Aplicar validación en servicios
- [ ] Actualizar Firestore rules para validar rol

**Archivos a crear/modificar:**
- `hooks/usePermissions.ts` (nuevo)
- `types/permissions.ts` (nuevo)
- `components/guards/PermissionGuard.tsx` (nuevo)
- `firestore.rules` (agregar validación de roles)

**Criterio de éxito:**
- VIEWER no puede editar ni eliminar nada
- USER no puede gestionar empleados
- MANAGER puede ver reportes pero no configuración

---

## 📋 FASE 3: PANEL DE SUPER ADMIN (MEDIA PRIORIDAD)
**Objetivo:** Completar funcionalidades de administración
**Duración estimada:** Sprint 5

### 3.1 - Acciones sobre Usuarios ⭐⭐
**Descripción:** Conectar las acciones del panel admin a los servicios

**Tareas:**
- [ ] Crear `components/admin/UserActionsMenu.tsx`
- [ ] Acción: Activar/Desactivar usuario
- [ ] Acción: Ver detalles del usuario (modal)
- [ ] Acción: Ver organizaciones del usuario
- [ ] Acción: Forzar cambio de plan de una org del usuario
- [ ] Agregar confirmación antes de acciones destructivas
- [ ] Mostrar toast de éxito/error
- [ ] Refrescar lista después de acción

**Archivos a crear/modificar:**
- `components/admin/UserActionsMenu.tsx` (nuevo)
- `components/admin/UserDetailsModal.tsx` (nuevo)
- `app/(admin)/sudo/users/page.tsx` (conectar menu)

**Criterio de éxito:**
- Super admin puede desactivar un usuario
- Usuario desactivado no puede hacer login
- Se muestra confirmación antes de desactivar

---

### 3.2 - Acciones sobre Organizaciones ⭐⭐
**Descripción:** Conectar las acciones del panel admin para organizaciones

**Tareas:**
- [ ] Crear `components/admin/OrganizationActionsMenu.tsx`
- [ ] Acción: Activar/Desactivar organización
- [ ] Acción: Cambiar plan de organización
- [ ] Acción: Ver detalles (modal con todas las métricas)
- [ ] Acción: Ver usuarios de la organización
- [ ] Acción: Extender trial (agregar 30 días)
- [ ] Acción: Ver uso de recursos (clientes, vehículos, trabajos)
- [ ] Agregar confirmación antes de acciones

**Archivos a crear/modificar:**
- `components/admin/OrganizationActionsMenu.tsx` (nuevo)
- `components/admin/OrganizationDetailsModal.tsx` (nuevo)
- `components/admin/ChangePlanModal.tsx` (nuevo)
- `services/admin/adminService.ts` (agregar `extendTrial()`)
- `app/(admin)/sudo/organizations/page.tsx` (conectar menu)

**Criterio de éxito:**
- Super admin puede cambiar plan de cualquier org
- Super admin puede desactivar org (todos sus usuarios pierden acceso)
- Super admin puede extender trial

---

### 3.3 - Gestión de Configuración de Planes ⭐⭐
**Descripción:** Permitir que super admin modifique los planes

**Tareas:**
- [ ] Crear colección `planConfigurations` en Firestore
- [ ] Crear `services/admin/planConfigService.ts`
  - `getPlanConfig(plan: SubscriptionPlan)`
  - `updatePlanConfig(plan, config)`
  - `getAllPlanConfigs()`
- [ ] Modificar `DEFAULT_TENANT_CONFIG` para leer de Firestore
- [ ] Conectar página `/sudo/plans` para guardar cambios
- [ ] Agregar botón "Guardar cambios"
- [ ] Agregar validación (ej: PREMIUM debe tener más que BASIC)
- [ ] Mostrar historial de cambios (opcional)

**Archivos a crear/modificar:**
- `services/admin/planConfigService.ts` (nuevo)
- `app/(admin)/sudo/plans/page.tsx` (conectar a servicio)
- `types/tenant.ts` (modificar para leer de Firestore)

**Criterio de éxito:**
- Super admin modifica límites de plan BASIC
- Cambios se guardan en Firestore
- Nuevos tenants usan la nueva configuración
- Tenants existentes mantienen su config actual (o se actualizan)

---

## 📋 FASE 4: CARACTERÍSTICAS PREMIUM (BAJA PRIORIDAD)
**Objetivo:** Implementar features que diferencian planes premium
**Duración estimada:** Sprint 6-8

### 4.1 - Notificaciones por Email ⭐
**Descripción:** Enviar emails automáticos según eventos

**Tareas:**
- [ ] Integrar Resend o SendGrid
- [ ] Crear templates de email con React Email
- [ ] Email: Bienvenida al registrarse
- [ ] Email: Invitación a tenant
- [ ] Email: Turno confirmado (para clientes)
- [ ] Email: Trabajo completado (para clientes)
- [ ] Email: Presupuesto enviado (para clientes)
- [ ] Email: Trial expirando (7 días antes)
- [ ] Email: Recordatorio de turno (1 día antes)
- [ ] Configuración: usuario puede desactivar notificaciones
- [ ] Solo disponible para BASIC+

**Archivos a crear/modificar:**
- `lib/email/resend.ts` (nuevo)
- `emails/` (carpeta con templates)
- `services/notifications/emailService.ts` (nuevo)
- Cloud Functions para triggers

**Criterio de éxito:**
- Cliente recibe email cuando se confirma su turno
- Cliente recibe recordatorio 1 día antes
- Solo funciona en planes BASIC+

---

### 4.2 - Reportes Avanzados ⭐
**Descripción:** Dashboard con métricas y gráficos

**Tareas:**
- [ ] Crear página `/reportes`
- [ ] Reporte: Ingresos mensuales (gráfico de barras)
- [ ] Reporte: Trabajos por estado (gráfico de torta)
- [ ] Reporte: Top clientes (tabla)
- [ ] Reporte: Trabajos por mecánico (si tienen empleados)
- [ ] Reporte: Productos más vendidos
- [ ] Reporte: Tiempo promedio de trabajo
- [ ] Exportar a PDF
- [ ] Exportar a Excel
- [ ] Filtrar por rango de fechas
- [ ] Solo disponible para PREMIUM+

**Archivos a crear/modificar:**
- `app/(private)/reportes/page.tsx` (nuevo)
- `components/charts/` (varios componentes)
- `services/reports/reportsService.ts` (nuevo)
- `lib/pdf/exportPDF.ts` (nuevo)

**Criterio de éxito:**
- Usuario PREMIUM ve reportes detallados
- Usuario BASIC ve mensaje de upgrade
- Puede exportar a PDF

---

### 4.3 - Custom Branding ⭐
**Descripción:** Permitir personalizar colores y logo

**Tareas:**
- [ ] Agregar campos en tenant: `logo`, `primaryColor`, `secondaryColor`
- [ ] Crear página `/organizacion/branding`
- [ ] Upload de logo a Firebase Storage
- [ ] Color picker para colores primarios/secundarios
- [ ] Preview en tiempo real
- [ ] Aplicar colores en toda la app (CSS variables)
- [ ] Mostrar logo en presupuestos y facturas
- [ ] Solo disponible para PREMIUM+

**Archivos a crear/modificar:**
- `app/(private)/organizacion/branding/page.tsx` (nuevo)
- `components/ColorPicker.tsx` (nuevo)
- `services/storage/uploadLogo.ts` (nuevo)
- `app/layout.tsx` (aplicar CSS variables)

**Criterio de éxito:**
- Tenant PREMIUM sube su logo
- Colores se aplican en toda la app
- Logo aparece en PDFs de presupuestos

---

### 4.4 - Notificaciones SMS ⭐
**Descripción:** Enviar SMS para recordatorios urgentes

**Tareas:**
- [ ] Integrar Twilio
- [ ] SMS: Turno confirmado
- [ ] SMS: Recordatorio de turno (3 horas antes)
- [ ] SMS: Trabajo listo para retirar
- [ ] Configuración: clientes pueden opt-out
- [ ] Solo disponible para ENTERPRISE

**Archivos a crear/modificar:**
- `lib/sms/twilio.ts` (nuevo)
- `services/notifications/smsService.ts` (nuevo)

**Criterio de éxito:**
- Cliente recibe SMS 3 horas antes del turno
- Solo funciona en plan ENTERPRISE

---

## 📋 FASE 5: MEJORAS DE UX Y OPTIMIZACIÓN (CONTINUA)
**Objetivo:** Pulir detalles y mejorar experiencia
**Duración estimada:** Ongoing

### 5.1 - Onboarding Mejorado ⭐
- [ ] Tour guiado para nuevos usuarios (Shepherd.js o similar)
- [ ] Wizard de configuración inicial paso a paso
- [ ] Sugerencias de datos de ejemplo
- [ ] Video tutorial embebido

### 5.2 - Página de Upgrade/Pricing ⭐
- [ ] Crear `/pricing` público
- [ ] Comparación de planes con tabla
- [ ] FAQ sobre planes
- [ ] Integración con Stripe/MercadoPago para pagos
- [ ] Flujo de upgrade desde dentro de la app

### 5.3 - Métricas y Analytics ⭐
- [ ] Integrar PostHog o Mixpanel
- [ ] Trackear eventos clave (signup, create_client, create_job, etc.)
- [ ] Dashboard de métricas para super admin
- [ ] Identificar churn y patrones de uso

### 5.4 - Optimizaciones de Performance ⭐
- [ ] Implementar ISR para páginas públicas
- [ ] Agregar Suspense boundaries
- [ ] Lazy loading de componentes pesados
- [ ] Optimizar queries de Firestore (indices, batching)
- [ ] Implementar React Query para caching

### 5.5 - Testing ⭐
- [ ] Unit tests para servicios críticos
- [ ] Integration tests para flujos principales
- [ ] E2E tests con Playwright
- [ ] Tests de Security Rules con emulador

---

## 🎯 RESUMEN DE PRIORIZACIÓN

### MUST HAVE (Fase 1-2) - 4-6 semanas
- ✅ Validación de módulos por plan
- ✅ Validación de límites de recursos
- ✅ Sistema de invitaciones
- ✅ Gestión de empleados
- ✅ Control de permisos por rol

### SHOULD HAVE (Fase 3) - 2 semanas
- ✅ Acciones de admin sobre usuarios/orgs
- ✅ Configuración de planes editable

### NICE TO HAVE (Fase 4) - 6-8 semanas
- ⭐ Notificaciones email
- ⭐ Reportes avanzados
- ⭐ Custom branding
- ⭐ SMS notifications

### ONGOING (Fase 5)
- 🔄 UX improvements
- 🔄 Performance
- 🔄 Testing

---

## 📊 MÉTRICAS DE ÉXITO

### Por Fase:
- **Fase 1:** 0% de usuarios pueden acceder a módulos no permitidos
- **Fase 2:** 80%+ de owners invitan al menos 1 empleado
- **Fase 3:** Super admin puede gestionar 100% de usuarios y orgs
- **Fase 4:** 30%+ de conversión de TRIAL a PREMIUM
- **Fase 5:** Reducir churn en 20%

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. **Revisar este plan** y ajustar prioridades según negocio
2. **Elegir con qué Fase empezar** (recomiendo Fase 1)
3. **Definir sprint** (¿cuánto tiempo por fase?)
4. **Comenzar desarrollo** tarea por tarea

¿Por dónde empezamos? 🎯
