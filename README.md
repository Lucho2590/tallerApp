# Cioffi Climatización - Sistema de Gestión

Sistema de gestión completo para taller de climatización desarrollado con Next.js 14, TypeScript, Firebase y Tailwind CSS.

## Características Principales

### Autenticación y Seguridad
- Sistema completo de login y registro
- Autenticación con Firebase Auth (Email/Password + Google)
- Login con Google OAuth 2.0
- Protección de rutas privadas
- Gestión de roles (admin, moderador, user)

### Módulos Implementados
- **Dashboard**: Vista general con métricas del sistema
- **Clientes**: CRUD completo para gestión de clientes
- **Vehículos**: CRUD completo vinculado a clientes
- **Agenda/Turnos**: Sistema de gestión de turnos con estados

### Tecnologías Utilizadas
- **Framework**: Next.js 14 (App Router) con SSR
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + Radix UI
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Validación**: React Hook Form + Zod
- **Iconos**: Lucide React

## Estructura del Proyecto

```
tallerApp/
├── app/                          # Páginas y rutas (App Router)
│   ├── (auth)/                   # Rutas públicas (login, register)
│   ├── (private)/                # Rutas privadas protegidas
│   │   ├── dashboard/
│   │   ├── clientes/
│   │   ├── vehiculos/
│   │   └── agenda/
│   ├── layout.tsx                # Layout raíz
│   └── page.tsx                  # Página principal
├── components/                   # Componentes reutilizables
│   ├── ui/                       # Componentes UI base
│   ├── auth/                     # Componentes de autenticación
│   ├── layout/                   # Componentes de layout
│   └── providers/                # Providers de contexto
├── contexts/                     # Contextos de React
│   └── AuthContext.tsx           # Contexto de autenticación
├── hooks/                        # Hooks personalizados
│   ├── clientes/
│   ├── vehiculos/
│   └── agenda/
├── services/                     # Servicios de Firebase
│   ├── clientes/
│   ├── vehiculos/
│   └── agenda/
├── lib/                          # Utilidades y configuraciones
│   ├── firebase/                 # Configuración de Firebase
│   ├── validations/              # Esquemas de validación (Zod)
│   └── utils.ts                  # Funciones utilitarias
├── types/                        # Definiciones de TypeScript
│   └── index.ts                  # Tipos e interfaces
└── middleware.ts                 # Middleware de Next.js
```

## Instalación y Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Firebase

El proyecto ya está configurado con las credenciales de Firebase en el archivo `.env.local`. Las credenciales incluidas son:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAN6L3HE3Wy4Vbfl_rDwN495wR3FvMFWd4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mdqapps-taller.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mdqapps-taller
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mdqapps-taller.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=388236611799
NEXT_PUBLIC_FIREBASE_APP_ID=1:388236611799:web:6404c1b3e24a0895eee092
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-EZPGT9L7KQ
```

### 3. Configurar Colecciones de Firestore

Asegúrate de que tu proyecto de Firebase tenga las siguientes colecciones creadas:
- `users` - Para almacenar información de usuarios
- `clientes` - Para gestión de clientes
- `vehiculos` - Para gestión de vehículos
- `turnos` - Para gestión de turnos/agenda

### 4. Reglas de Firestore (Recomendadas)

Aplica estas reglas básicas en Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regla para usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Ejecución del Proyecto

### Modo Desarrollo

```bash
npm run dev
```

El proyecto estará disponible en [http://localhost:3000](http://localhost:3000)

### Build de Producción

```bash
npm run build
npm run start
```

### Linter

```bash
npm run lint
```

## 🚀 Deploy a Producción

Este proyecto está optimizado para deploy en **Vercel**, que ofrece soporte completo para Next.js con SSR y rutas dinámicas.

### Deploy Rápido en Vercel

1. Crea una cuenta en [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno de Firebase
4. ¡Deploy automático!

**📖 Para instrucciones detalladas, consulta [DEPLOY.md](./DEPLOY.md)**

### ¿Por qué Vercel?

- ✅ Soporte completo de SSR y rutas dinámicas
- ✅ Deploy automático desde Git
- ✅ HTTPS gratuito
- ✅ Compatible con Firebase (Auth, Firestore)
- ✅ Tier gratuito generoso

## Uso del Sistema

### 1. Primer Acceso
1. Accede a `/register` para crear una cuenta
2. Completa el formulario de registro
3. Serás redirigido automáticamente al dashboard

### 2. Gestión de Clientes
- Navega a "Clientes" desde el sidebar
- Haz clic en "Nuevo Cliente" para agregar clientes
- Completa: nombre, apellido, teléfono (requeridos) y opcionalmente email, dirección y notas
- Edita o elimina clientes desde las tarjetas

### 3. Gestión de Vehículos
- Navega a "Vehículos" desde el sidebar
- Haz clic en "Nuevo Vehículo"
- Selecciona un cliente (necesitas tener clientes registrados)
- Completa: marca, modelo, año, patente (requeridos) y opcionalmente color y notas

### 4. Gestión de Turnos
- Navega a "Agenda" desde el sidebar
- Usa los botones para navegar entre fechas
- Haz clic en "Nuevo Turno" para crear un turno
- Selecciona cliente, vehículo, fecha, horarios y estado
- Los turnos se muestran organizados por fecha

## Tipos de Datos

### Cliente
```typescript
{
  nombre: string
  apellido: string
  telefono: string
  email?: string
  direccion?: string
  notas?: string
}
```

### Vehículo
```typescript
{
  clienteId: string
  marca: string
  modelo: string
  año: number
  patente: string
  color?: string
  notas?: string
}
```

### Turno
```typescript
{
  clienteId: string
  vehiculoId: string
  fecha: Date
  horaInicio: string (HH:MM)
  horaFin: string (HH:MM)
  descripcion: string
  estado: "pendiente" | "en_progreso" | "completado" | "cancelado"
  notas?: string
}
```

## Estados del Sistema

### Estados de Turno
- **Pendiente**: Turno agendado, esperando inicio
- **En Progreso**: Trabajo en curso
- **Completado**: Trabajo finalizado
- **Cancelado**: Turno cancelado

### Roles de Usuario
- **User**: Usuario estándar con acceso completo al sistema
- **Moderador**: Permisos extendidos (preparado para futuro)
- **Admin**: Acceso administrativo total (preparado para futuro)

## Próximas Funcionalidades (No incluidas en MVP)

- Módulo de Presupuestos
- Módulo de Órdenes de Trabajo
- Módulo de Productos e Inventario
- Módulo de Caja y Movimientos
- Dashboard con métricas dinámicas
- Calendario visual interactivo
- Reportes y exportación de datos
- Sistema de notificaciones
- Búsqueda y filtros avanzados

## Soporte

Para reportar problemas o solicitar funcionalidades, contacta al equipo de desarrollo.

## Licencia

Proyecto privado - Cioffi Climatización © 2024
