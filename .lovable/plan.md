

## Mejoras al Sistema de Follow y Likes

### Objetivo
1. **Popup de login para seguir**: Centrar texto, permanecer en la página actual tras login, y auto-seguir
2. **Sistema de likes en apps**: Permitir dar/quitar corazones y detectar estado al visitar un perfil

---

### Cambio 1: Centrar texto "Únete a Vibecoders"

En `FollowButton.tsx`, el `DialogTitle` necesita clase de centrado:

```text
Antes:  <DialogTitle className="text-xl text-white">
Después: <DialogTitle className="text-xl text-white text-center">
```

---

### Cambio 2: Permanecer en la misma página tras login

**Problema actual:**
- `signInWithGoogle()` redirige siempre a `/me`

**Solución:**
- Crear versión de `signInWithGoogle` que acepte URL de retorno
- Usar `window.location.href` como redirect para volver a la página actual

**Archivo: `src/hooks/useAuth.ts`**
- Modificar `signInWithGoogle` para aceptar `redirectTo?: string` opcional
- Si no se pasa, usar la URL actual como fallback

**Archivo: `src/components/FollowButton.tsx`**
- Pasar `window.location.href` al llamar `signInWithGoogle`

---

### Cambio 3: Auto-seguir tras login

**Estrategia:**
1. Guardar en `localStorage` el `profile_id` a seguir antes del login
2. Después del login, detectar si hay un "pending follow" y ejecutarlo automáticamente

**Archivo: `src/components/FollowButton.tsx`**
- Antes de llamar `signInWithGoogle`, guardar en `localStorage`:
  - `pendingFollow`: profile ID a seguir

**Archivo: `src/hooks/useFollow.ts`**
- Agregar lógica para detectar `pendingFollow` al montar
- Si existe y usuario está logueado, ejecutar follow automáticamente
- Limpiar `localStorage` después de ejecutar

---

### Cambio 4: Sistema de likes visible para visitantes

**Estado actual:**
- `AppLikeButton` solo muestra botón si `isAuthenticated`
- `useAppLike` ya detecta si usuario dio like (`checkLikeStatus`)

**El sistema ya funciona correctamente:**
1. `useAppLike` verifica si el usuario actual dio like a cada app
2. `toggleLike` llama a Edge Function para agregar/quitar like
3. El corazón muestra estado `filled` si `isLiked` es true

**Lo que falta revisar:**
- Confirmar que el botón de corazón aparece para usuarios logueados (no dueños)
- El corazón debe mostrarse clickeable y cambiar su estado visual

---

### Flujo de auto-follow propuesto

```text
Usuario anónimo en /@vibecoder
         │
         ▼
    Click "Seguir"
         │
         ▼
   Popup de login aparece
         │
         ▼
  localStorage.set('pendingFollow', profileId)
  localStorage.set('pendingFollowPath', currentPath)
         │
         ▼
  signInWithGoogle(currentUrl)
         │
         ▼
  ─── Google OAuth ───
         │
         ▼
  Regresa a /@vibecoder
         │
         ▼
  useFollow detecta pendingFollow
         │
         ▼
  Ejecuta toggleFollow automáticamente
         │
         ▼
  Limpia localStorage
```

---

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useAuth.ts` | Agregar parámetro `redirectTo` a `signInWithGoogle` |
| `src/components/FollowButton.tsx` | Centrar título, guardar pending follow, pasar redirect URL |
| `src/hooks/useFollow.ts` | Detectar y ejecutar pending follow tras login |

---

### Detalles de Implementación

#### useAuth.ts
```typescript
const signInWithGoogle = async (redirectTo?: string) => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo || `${window.location.origin}/me`,
    },
  });
  // ...
};
```

#### FollowButton.tsx
```typescript
const handleSignIn = async () => {
  // Guardar intención de follow
  localStorage.setItem('pendingFollow', profileId);
  
  // Redirigir a la página actual después del login
  await signInWithGoogle(window.location.href);
};
```

#### useFollow.ts
```typescript
useEffect(() => {
  if (!user || !profileId) return;
  
  const pendingFollow = localStorage.getItem('pendingFollow');
  if (pendingFollow === profileId && !isFollowing) {
    localStorage.removeItem('pendingFollow');
    // Ejecutar follow automáticamente
    toggleFollow();
  }
}, [user, profileId, isFollowing]);
```

---

### Sobre el sistema de likes (ya implementado)

El código actual ya soporta:
- Detectar si usuario dio like (`checkLikeStatus` en useAppLike)
- Toggle de like/unlike (`toggleLike`)
- Mostrar corazón relleno si `isLiked`
- Ocultar para no-autenticados (line 43 de AppLikeButton)

El flujo funciona porque:
1. Al visitar un perfil, cada `AppLikeButton` ejecuta `useAppLike(appId)`
2. `useAppLike` consulta `app_likes` para ver si existe registro con `user_id` actual
3. Si existe, `isLiked = true` y el corazón se muestra relleno
4. Al hacer click, `toggleLike` agrega o elimina el registro

