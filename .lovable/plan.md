

## Botón de Login en Header de Perfiles Públicos

### Objetivo
Agregar un botón "Continuar con Google" en el lado derecho del header cuando el usuario visita un perfil público sin estar logueado. Este botón debe iniciar sesión y mantener al usuario en la misma página.

---

### Cambio en `src/components/PublicProfileHeader.tsx`

**Estado actual:**
- Línea 50-103: Solo renderiza el menú de usuario si `user` existe
- Si no hay usuario, el lado derecho del header queda vacío

**Cambio propuesto:**
Agregar un bloque `else` que muestre el botón de Google cuando no hay usuario:

```text
{user ? (
  // ... menú de usuario existente (DropdownMenu)
) : (
  <Button
    onClick={handleGoogleSignIn}
    variant="outline"
    className="flex items-center gap-2 ..."
  >
    <GoogleIcon />
    <span>Continuar con Google</span>
  </Button>
)}
```

---

### Detalles de Implementación

1. **Importar Button** del UI components

2. **Agregar función `handleGoogleSignIn`:**
   - Guardar `authReturnUrl` en localStorage con la ruta actual
   - Llamar `signInWithGoogle(window.location.href)`

3. **Crear/usar ícono de Google:**
   - SVG inline del logo de Google (colores oficiales)
   - Tamaño pequeño (16x16px)

4. **Estilo del botón:**
   - Variante `outline` con borde gris
   - Fondo blanco con hover suave
   - Texto oscuro
   - Gap entre ícono y texto

---

### Código del botón

```tsx
// Función de login
const handleGoogleSignIn = async () => {
  try {
    localStorage.setItem('authReturnUrl', window.location.pathname);
    await signInWithGoogle(window.location.href);
  } catch (error) {
    console.error('Error signing in:', error);
  }
};

// Logo de Google SVG
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);
```

---

### Flujo de Usuario

```text
Usuario anónimo visita /@rosmelortiz
         │
         ▼
   Ve header con logo izquierda
   y botón "Continuar con Google" derecha
         │
         ▼
   Click en el botón
         │
         ▼
   localStorage.set('authReturnUrl', '/@rosmelortiz')
   signInWithGoogle(currentUrl)
         │
         ▼
   ─── Google OAuth ───
         │
         ▼
   useAuth detecta SIGNED_IN
   Lee authReturnUrl de localStorage
   Redirige a /@rosmelortiz (no a /me/profile)
```

---

### Archivo a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/PublicProfileHeader.tsx` | Agregar botón de Google para usuarios no autenticados |

