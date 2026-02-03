
# Plan: Navegación Fluida sin Parpadeo del Header

## Problema Identificado

Cada vez que navegas entre `/projects` y `/tools`, toda la página se desmonta y vuelve a montar, incluyendo el header y footer. Esto causa el efecto de "carga" visible porque:

1. **Cada página es independiente**: `Tools.tsx` y `Projects.tsx` renderizan su propio `AuthenticatedHeader` y `Footer`
2. **Estado de carga reinicia**: Los hooks `useAuth()` y `useProfile()` inician con `loading: true` en cada montaje
3. **Loader de pantalla completa**: Mientras `authLoading` es `true`, se muestra un spinner de pantalla completa que oculta TODO

---

## Solución: Layout Compartido

Crear un componente de layout que envuelva las rutas autenticadas y mantenga el Header/Footer siempre montados.

### Arquitectura Propuesta

```text
┌─────────────────────────────────────────────────────┐
│  AuthenticatedLayout (siempre montado)              │
│  ┌───────────────────────────────────────────────┐  │
│  │  AuthenticatedHeader                          │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  <Outlet /> ← Solo esto cambia                │  │
│  │  (Projects, Tools, Me content)                │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Footer                                       │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Archivos a Crear/Modificar

### 1. Crear: `src/layouts/AuthenticatedLayout.tsx`

Nuevo componente que:
- Verifica autenticación una sola vez
- Renderiza Header y Footer de forma persistente
- Usa `<Outlet />` para el contenido de las rutas hijas
- El loader solo aparece en el área de contenido, no en todo el viewport

### 2. Modificar: `src/App.tsx`

Restructurar las rutas para usar layout anidado:

```tsx
<Route element={<AuthenticatedLayout />}>
  <Route path="/projects" element={<ProjectsContent />} />
  <Route path="/tools" element={<ToolsContent />} />
  <Route path="/me/*" element={<MeContent />} />
</Route>
```

### 3. Simplificar: `src/pages/Projects.tsx`

- Eliminar AuthenticatedHeader y Footer (ya están en el layout)
- Eliminar verificación de auth (ya está en el layout)
- Mantener solo el contenido específico de la página

### 4. Simplificar: `src/pages/Tools.tsx`

- Mismos cambios que Projects.tsx

### 5. Adaptar: `src/pages/Me.tsx` y `src/components/me/MeLayout.tsx`

- Usar el layout compartido en lugar de su propio header
- Mantener la lógica específica del editor de perfil

---

## Detalles Técnicos

### AuthenticatedLayout.tsx

```tsx
import { Outlet, Navigate } from 'react-router-dom';
import { AuthenticatedHeader } from '@/components/AuthenticatedHeader';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Loader2 } from 'lucide-react';

export function AuthenticatedLayout() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile } = useProfile();

  // Redirect si no autenticado (después de cargar)
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header siempre visible */}
      <AuthenticatedHeader 
        profile={profile || null}
        onSignOut={signOut}
      />

      {/* Contenido: loader o página */}
      {authLoading ? (
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      ) : (
        <Outlet />
      )}

      {/* Footer siempre visible */}
      <Footer />
    </div>
  );
}
```

### App.tsx (Rutas Reestructuradas)

```tsx
import { AuthenticatedLayout } from './layouts/AuthenticatedLayout';

<Routes>
  {/* Rutas públicas */}
  <Route path="/" element={<Index />} />
  <Route path="/privacy" element={<Privacy />} />
  <Route path="/terms" element={<Terms />} />
  <Route path="/:handle" element={<PublicProfile />} />

  {/* Rutas autenticadas con layout compartido */}
  <Route element={<AuthenticatedLayout />}>
    <Route path="/projects" element={<Projects />} />
    <Route path="/tools" element={<Tools />} />
    <Route path="/me" element={<Navigate to="/me/profile" replace />} />
    <Route path="/me/profile" element={<Me />} />
    <Route path="/me/apps" element={<Me />} />
    <Route path="/me/branding" element={<Me />} />
  </Route>
  
  {/* Admin */}
  <Route path="/admin/*" element={<Admin />} />
</Routes>
```

---

## Resultado Esperado

| Antes | Después |
|-------|---------|
| Al navegar: toda la página parpadea | Solo el contenido central cambia |
| Header y Footer se recargan | Header y Footer permanecen estables |
| Spinner de pantalla completa | Spinner solo en el área de contenido |
| Múltiples llamadas a useAuth/useProfile | Una sola instancia compartida |

---

## Consideraciones Especiales para /me

El MeLayout tiene lógica adicional (estado de guardado, tabs). Se integrará de la siguiente manera:
- El layout compartido provee Header con props básicas
- MeLayout pasa props adicionales (isSaving, lastSaved) al header cuando está en esas rutas
- Alternativa: MeLayout puede seguir teniendo su propio header especializado y no usar el layout compartido para /me/*
