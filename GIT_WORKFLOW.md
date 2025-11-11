# 🌿 Flujo de Trabajo con Git - Taller App

## Estrategia de Ramas

### **main** (Producción)
- ✅ Código estable y probado
- ✅ Desplegado automáticamente en Vercel (producción)
- ⚠️ **NO trabajar directamente aquí**
- Solo recibe merges desde `dev` mediante Pull Requests

### **dev** (Desarrollo)
- 🚧 Rama activa de desarrollo
- ✅ Aquí se trabaja día a día
- ✅ Vercel hace preview deployments automáticos
- Cuando esté listo y probado → merge a `main`

---

## 📋 Flujo de Trabajo Diario

### 1. Verificar que estás en dev
```bash
git branch
# Debe mostrar: * dev
```

### 2. Antes de empezar a trabajar
```bash
# Asegúrate de tener lo último de dev
git pull origin dev
```

### 3. Trabajar en tu código
Haz los cambios que necesites...

### 4. Guardar cambios
```bash
# Ver qué archivos cambiaron
git status

# Agregar archivos modificados
git add .

# O agregar archivos específicos
git add archivo1.tsx archivo2.ts

# Hacer commit con mensaje descriptivo
git commit -m "Feat: Agregar módulo de presupuestos"
```

### 5. Subir a GitHub
```bash
git push origin dev
```

✅ **Vercel detectará el push y creará un preview deployment automáticamente**

---

## 🔄 Cuando quieras actualizar Producción

### Opción A: Merge directo (para cambios pequeños)
```bash
# Cambiar a main
git checkout main

# Traer últimos cambios
git pull origin main

# Mergear dev a main
git merge dev

# Subir a GitHub (dispara deploy en Vercel)
git push origin main

# Volver a dev para seguir trabajando
git checkout dev
```

### Opción B: Pull Request en GitHub (RECOMENDADO)
1. Ve a tu repo en GitHub
2. Haz clic en **"Pull requests"**
3. Clic en **"New pull request"**
4. **Base:** `main` ← **Compare:** `dev`
5. Revisa los cambios
6. Crea el PR
7. Haz merge del PR
8. ✅ Vercel desplegará automáticamente a producción

---

## 🎨 Convenciones de Commits (Opcional pero recomendado)

```bash
# Nuevas funcionalidades
git commit -m "Feat: Agregar módulo de presupuestos"

# Correcciones de bugs
git commit -m "Fix: Corregir error en cálculo de total"

# Mejoras de código
git commit -m "Refactor: Optimizar queries de Firestore"

# Actualizaciones de documentación
git commit -m "Docs: Actualizar README con instrucciones"

# Cambios de estilos/UI
git commit -m "Style: Mejorar diseño de sidebar"

# Tests
git commit -m "Test: Agregar tests para módulo clientes"
```

---

## 🚨 Comandos Útiles

### Ver estado actual
```bash
git status
```

### Ver historial de commits
```bash
git log --oneline
```

### Ver diferencias antes de commit
```bash
git diff
```

### Deshacer cambios no commiteados
```bash
# Deshacer cambios en un archivo específico
git checkout -- archivo.tsx

# Deshacer TODOS los cambios
git reset --hard
```

### Cambiar entre ramas
```bash
# Ir a main
git checkout main

# Volver a dev
git checkout dev
```

### Actualizar dev con cambios de main
```bash
git checkout dev
git pull origin main
```

---

## 🎯 Estado Actual

- ✅ **Rama actual:** `dev`
- ✅ **Rama de producción:** `main`
- ✅ **Vercel monitoreando:** ambas ramas
  - `main` → Producción (tu-app.vercel.app)
  - `dev` → Preview deployments automáticos

---

## 📊 Configuración de Vercel

Vercel está configurado para:
1. **main** → Deploy a producción automáticamente
2. **dev** → Preview deployment con URL única para probar
3. **Pull Requests** → Preview deployment para revisión

Puedes ver todos los deployments en: [vercel.com/dashboard](https://vercel.com/dashboard)

---

## 💡 Tips

1. **Siempre trabaja en `dev`**, nunca directo en `main`
2. **Commitea frecuentemente** con mensajes claros
3. **Prueba en preview de dev** antes de mergear a main
4. **Haz Pull Requests** para cambios importantes (mejor trazabilidad)
5. **Mantén main estable** - solo código probado

---

## 🆘 ¿Problemas?

### "Estoy en main por error"
```bash
git checkout dev
```

### "Subí cambios a main por error"
Contacta y revisamos cómo revertir

### "Conflictos al mergear"
```bash
# Git te mostrará los archivos en conflicto
# Ábrelos y resuelve manualmente
# Luego:
git add .
git commit -m "Resolve merge conflicts"
```

---

¡Estás listo para trabajar con un flujo profesional de Git! 🚀
