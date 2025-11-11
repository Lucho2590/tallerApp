# 🚀 Guía de Deploy - Taller App

## Deploy en Vercel (Recomendado)

Vercel es la plataforma oficial del equipo de Next.js y ofrece la mejor compatibilidad con todas las características de Next.js, incluyendo SSR y rutas dinámicas.

### Ventajas de Vercel
- ✅ Soporte completo de SSR, ISR y rutas dinámicas
- ✅ Deploy automático desde Git
- ✅ HTTPS gratuito
- ✅ Preview deployments para cada PR
- ✅ Edge Functions
- ✅ Analytics integrado
- ✅ Tier gratuito generoso
- ✅ Firebase funciona perfectamente (Auth, Firestore, Storage)

### Pasos para Deploy

#### 1. Crear cuenta en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "Sign Up"
3. Regístrate con tu cuenta de GitHub (recomendado)

#### 2. Subir el proyecto a GitHub
Si aún no lo has hecho:

```bash
cd /Users/lucianomartinlopez/projects/tallerApp
git init
git add .
git commit -m "Initial commit - Taller App MVP"
```

Luego crea un repositorio en GitHub y súbelo:

```bash
git remote add origin https://github.com/TU_USUARIO/taller-app.git
git branch -M main
git push -u origin main
```

#### 3. Importar proyecto en Vercel

1. En Vercel, haz clic en **"Add New..."** → **"Project"**
2. Selecciona **"Import Git Repository"**
3. Busca y selecciona tu repositorio `taller-app`
4. Haz clic en **"Import"**

#### 4. Configurar Variables de Entorno

En la configuración del proyecto en Vercel, agrega estas variables de entorno:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAN6L3HE3Wy4Vbfl_rDwN495wR3FvMFWd4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mdqapps-taller.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mdqapps-taller
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mdqapps-taller.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=388236611799
NEXT_PUBLIC_FIREBASE_APP_ID=1:388236611799:web:6404c1b3e24a0895eee092
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-EZPGT9L7KQ
```

#### 5. Deploy

1. Vercel detectará automáticamente que es un proyecto Next.js
2. Haz clic en **"Deploy"**
3. ¡Espera 2-3 minutos y listo! 🎉

#### 6. Configurar Dominio (Opcional)

Una vez desplegado:
- Vercel te dará una URL como `taller-app.vercel.app`
- Puedes configurar un dominio personalizado desde los settings

---

## 🔄 Deploys Automáticos

Una vez configurado:
- Cada `git push` a la rama `main` → Deploy automático a producción
- Cada PR → Preview deployment automático

---

## 🔧 Deploy Manual (Si prefieres)

Si no quieres usar GitHub, puedes usar Vercel CLI:

```bash
npm install -g vercel
vercel login
vercel
```

---

## 📝 Actualizar Dominio Autorizado en Firebase

Una vez que tengas tu URL de Vercel (ej: `taller-app.vercel.app`):

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `mdqapps-taller`
3. Ve a **Authentication** → **Settings** → **Authorized domains**
4. Haz clic en **"Add domain"**
5. Agrega tu dominio de Vercel: `taller-app.vercel.app`
6. Guarda los cambios

Esto es necesario para que el login con Google funcione desde tu dominio de producción.

---

## 🎯 Resultado Final

Tendrás:
- ✅ App desplegada en Vercel con SSR completo
- ✅ Rutas dinámicas funcionando perfectamente
- ✅ Firebase Auth/Firestore trabajando desde el backend
- ✅ HTTPS automático
- ✅ Deploy automático en cada push
- ✅ URLs amigables y rápidas

---

## 🆚 Comparación: Vercel vs Firebase Hosting

| Característica | Vercel | Firebase Hosting (Estático) |
|----------------|--------|----------------------------|
| SSR | ✅ Nativo | ❌ No soportado |
| Rutas dinámicas | ✅ Nativo | ❌ No soportado |
| Edge Functions | ✅ Sí | ⚠️ Solo con Cloud Functions |
| Deploy automático | ✅ Desde Git | ⚠️ Manual o CI/CD |
| Setup | ✅ 5 minutos | ⚠️ Más complejo |
| Precio | ✅ Gratis (hobby) | ✅ Gratis (límites) |

---

## 💡 Notas Importantes

- Firebase sigue siendo tu backend (Auth, Firestore, Storage)
- Solo el frontend de Next.js se aloja en Vercel
- Las credenciales de Firebase son las mismas
- El `.env.local` NO se sube a Git (está en .gitignore)
- Las variables de entorno se configuran en Vercel Dashboard

---

## 🐛 Troubleshooting

### Error: "Missing Environment Variables"
→ Asegúrate de agregar todas las variables de Firebase en Vercel

### Error: "Firebase Auth domain not authorized"
→ Agrega tu dominio de Vercel a los dominios autorizados en Firebase Console

### Build falla en Vercel
→ Revisa los logs en Vercel dashboard
→ Asegúrate de que el build funciona localmente (`npm run build`)

---

## 📞 Soporte

Si tienes problemas con el deploy, revisa:
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs/deployment)
