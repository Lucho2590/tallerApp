# Landing Page - TallerApp

Landing page moderna y profesional creada con Next.js 14, Framer Motion y Tailwind CSS.

## Estructura

```
app/
  page.tsx                    # Página principal (ruta /)
components/
  landing/
    Navbar.tsx               # Barra de navegación fija
    HeroSection.tsx          # Sección hero con animaciones
    DemoSection.tsx          # Demo interactivo con tabs
    FeaturesGrid.tsx         # Grid de características
    PricingSection.tsx       # Planes y precios
    CTASection.tsx           # Call to action final
    Footer.tsx               # Footer con links
public/
  grid.svg                   # Patrón de grid para fondos
```

## Secciones de la Landing Page

### 1. Navbar
- Navegación fija con backdrop blur
- Links a secciones con scroll smooth
- CTAs: "Iniciar sesión" y "Comenzar gratis"
- Menú responsive para mobile

### 2. Hero Section
- Headline con gradiente animado
- Subheadline descriptivo
- 2 CTAs principales
- Trust badges (sin tarjeta, 14 días gratis, soporte)
- Preview del dashboard con cards flotantes animadas
- Background con gradientes animados

### 3. Demo Section (Producto-céntrica)
- Sistema de tabs interactivo
- 6 módulos principales:
  - Clientes
  - Vehículos
  - Agenda & Turnos
  - Órdenes de Trabajo
  - Inventario
  - Caja
- Cada módulo muestra:
  - Icono con color único
  - Descripción
  - Lista de funcionalidades
  - Placeholder para screenshot

### 4. Features Grid
- 12 características destacadas
- Animaciones al hacer hover
- Stats section (uptime, response time, disponibilidad)
- Enfoque en tecnología y seguridad

### 5. Pricing Section
- 4 planes: Trial, Basic, Premium, Enterprise
- Plan Premium destacado como "Más popular"
- Lista detallada de features por plan
- Pricing transparente

### 6. CTA Section
- Call to action final
- 2 botones: "Comenzar gratis" y "Contactar ventas"
- Trust indicators
- Background con gradientes animados

### 7. Footer
- 6 columnas:
  - Brand + info de contacto
  - Producto
  - Empresa
  - Recursos
  - Legal
  - (en brand column)
- Social media links
- Copyright

## Personalización

### Colores
Los componentes usan el sistema de colores de Tailwind CSS con enfoque en:
- `blue-*`: Color principal
- `purple-*`: Color secundario
- `slate-*`: Grises y fondos

Para cambiar los colores principales, edita los componentes reemplazando las clases.

### Contenido

#### Cambiar pricing:
Edita `components/landing/PricingSection.tsx`:
```typescript
const plans = [
  {
    name: "Trial",
    price: "Gratis",
    // ... más configuración
  }
]
```

#### Cambiar features del demo:
Edita `components/landing/DemoSection.tsx`:
```typescript
const features = [
  {
    id: "clientes",
    icon: Users,
    title: "Clientes",
    // ... más configuración
  }
]
```

#### Cambiar características:
Edita `components/landing/FeaturesGrid.tsx`:
```typescript
const features = [
  {
    icon: Cloud,
    title: "100% en la Nube",
    description: "...",
  }
]
```

### Screenshots

Los placeholders de screenshots están en:
- `HeroSection.tsx` (línea ~144): Dashboard preview
- `DemoSection.tsx` (línea ~236): Screenshots por módulo

Para agregar screenshots reales:

1. Toma screenshots de la app en resolución 1920x1080
2. Optimiza las imágenes (usa tinypng.com o similar)
3. Guárdalas en `public/screenshots/`
4. Reemplaza los placeholders:

```tsx
// En HeroSection.tsx
<Image
  src="/screenshots/dashboard.png"
  alt="Dashboard"
  width={1920}
  height={1080}
  className="rounded-2xl"
/>

// En DemoSection.tsx
<Image
  src={`/screenshots/${activeFeature.id}.png`}
  alt={activeFeature.title}
  width={1280}
  height={720}
  className="rounded-lg"
/>
```

### Animaciones

Las animaciones están controladas por Framer Motion:

- **Entrada de secciones**: `whileInView` con delay escalonado
- **Hover effects**: `whileHover` con scale y color changes
- **Background orbs**: `animate` con loop infinito

Para ajustar velocidad de animaciones, modifica los `transition`:

```tsx
transition={{
  duration: 0.5,  // Velocidad (segundos)
  delay: 0.1,     // Delay antes de iniciar
  ease: "easeInOut" // Curva de animación
}}
```

## Metadata y SEO

Actualiza el metadata en `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "TallerApp - Sistema de Gestión para Talleres",
  description: "Software completo para gestionar tu taller: clientes, vehículos, turnos, trabajos y más. Prueba gratis 14 días.",
  keywords: ["taller", "gestión", "software", "automotriz"],
  openGraph: {
    title: "TallerApp",
    description: "...",
    images: ["/og-image.png"],
  },
}
```

## Testing Local

```bash
npm run dev
```

Visita `http://localhost:3000` para ver la landing page.

## Deploy

La landing page se deploya junto con la aplicación principal:

```bash
npm run build
```

No requiere configuración adicional en Vercel.

## Mejoras Futuras Sugeridas

### Screenshots Reales
- [ ] Dashboard principal
- [ ] Módulo de clientes
- [ ] Módulo de vehículos
- [ ] Agenda/turnos
- [ ] Órdenes de trabajo
- [ ] Inventario

### Contenido
- [ ] Video demo del producto
- [ ] Testimonios de clientes
- [ ] Casos de éxito
- [ ] FAQ section
- [ ] Blog/artículos

### Funcionalidades
- [ ] Formulario de contacto funcional
- [ ] Newsletter signup
- [ ] Chat en vivo (Intercom, Crisp, etc.)
- [ ] Analytics (Google Analytics, Mixpanel)
- [ ] A/B testing para CTAs

### Optimizaciones
- [ ] Lazy loading de imágenes
- [ ] Optimización de bundle size
- [ ] Precarga de rutas críticas
- [ ] Service Worker para offline

## Notas Técnicas

- **Responsiveness**: Todos los componentes son fully responsive
- **Accessibility**: Usa semantic HTML y ARIA labels
- **Performance**: Build optimizado, components con lazy load
- **SEO**: Metadata completo, sitemap, robots.txt

## Contacto y Soporte

Para preguntas sobre personalización:
- Email: contacto@tallerapp.com
- Docs: [Link a documentación]
