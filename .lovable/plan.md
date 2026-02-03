

# Plan: Header Unificado para Páginas Autenticadas

## Resumen

Crear un header unificado con navegación central para todas las páginas autenticadas del sitio. Este header incluirá enlaces a "Proyectos" y "Herramientas", además de actualizar las rutas de `/inspiration` → `/projects` y `/stack` → `/tools`.

---

## Diseño Visual

```text
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]          Proyectos    Herramientas           [Avatar ▼]    │
│   (←/)                                                (menú)       │
└─────────────────────────────────────────────────────────────────────┘

- Izquierda: Logo VibeCoders (enlaza a /)
- Centro: Enlaces de navegación con indicador activo (azul/bold)
- Derecha: Avatar con menú desplegable
- Estilo: glassmorphism (fondo blanco semi-transparente + blur)
```

---

## Cambios de Rutas

| Ruta Actual     | Nueva Ruta   | Descripción                    |
|-----------------|--------------|--------------------------------|
| `/inspiration`  | `/projects`  | Galería de proyectos           |
| `/stack`        | `/tools`     | Directorio de herramientas     |

---

## Archivos a Crear/Modificar

### 1. Nuevo: `src/components/AuthenticatedHeader.tsx`
- Componente header reutilizable para todas las páginas autenticadas
- Props opcionales para mostrar indicador de guardado (solo en `/me`)
- Navegación central con "Proyectos" y "Herramientas"
- Estado activo basado en `useLocation()` de react-router
- Estilo glassmorphism: `bg-white/80 backdrop-blur-md`

### 2. Modificar: `src/App.tsx`
- Cambiar ruta `/inspiration` → `/projects`
- Cambiar ruta `/stack` → `/tools`
- Añadir redirects de las rutas antiguas a las nuevas (compatibilidad)

### 3. Modificar: `src/pages/Inspiration.tsx` → Renombrar a `src/pages/Projects.tsx`
- Cambiar nombre del archivo
- Usar `AuthenticatedHeader` en lugar de `PublicHeader`
- Actualizar imports

### 4. Modificar: `src/pages/Stack.tsx` → Renombrar a `src/pages/Tools.tsx`
- Cambiar nombre del archivo  
- Usar `AuthenticatedHeader` en lugar de `Navbar`
- Actualizar imports

### 5. Modificar: `src/components/me/MeHeader.tsx`
- Delegar la UI al nuevo `AuthenticatedHeader`
- Solo pasar las props específicas de `/me` (isSaving, lastSaved, error)

### 6. Modificar: `src/components/me/MeLayout.tsx`
- Actualizar uso del header si es necesario

### 7. Modificar: `src/components/admin/AdminLayout.tsx`
- Usar `AuthenticatedHeader` para mantener consistencia

### 8. Actualizar referencias internas
- Buscar y reemplazar `/inspiration` → `/projects` en botones/links
- Buscar y reemplazar `/stack` → `/tools` en botones/links

---

## Detalles Técnicos

### Estructura del AuthenticatedHeader

```typescript
interface AuthenticatedHeaderProps {
  // Props opcionales para el indicador de guardado (solo /me)
  isSaving?: boolean;
  lastSaved?: Date | null;
  error?: Error | null;
  onSignOut: () => void;
  profile: ProfileData | null;
}
```

### Navegación Central

```tsx
const navLinks = [
  { path: '/projects', label: 'Proyectos' },
  { path: '/tools', label: 'Herramientas' },
];

// Estado activo detectado con useLocation
const location = useLocation();
const isActive = (path: string) => location.pathname === path;
```

### Estilo Glassmorphism

```tsx
<header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md">
```

### Indicador de Estado Activo

```tsx
<NavLink
  to={link.path}
  className={cn(
    "text-sm font-medium transition-colors",
    isActive(link.path) 
      ? "text-[#3D5AFE] font-semibold" 
      : "text-gray-600 hover:text-[#3D5AFE]"
  )}
>
```

---

## Lista de Archivos

| Archivo | Acción |
|---------|--------|
| `src/components/AuthenticatedHeader.tsx` | Crear |
| `src/pages/Projects.tsx` | Crear (basado en Inspiration.tsx) |
| `src/pages/Tools.tsx` | Crear (basado en Stack.tsx) |
| `src/pages/Inspiration.tsx` | Eliminar |
| `src/pages/Stack.tsx` | Eliminar |
| `src/App.tsx` | Modificar rutas |
| `src/components/me/MeHeader.tsx` | Simplificar, usar AuthenticatedHeader |
| `src/components/me/MeLayout.tsx` | Actualizar si necesario |
| `src/components/admin/AdminLayout.tsx` | Usar AuthenticatedHeader |
| Varios componentes | Actualizar enlaces internos |

---

## Comportamiento Esperado

1. **Usuario autenticado** en cualquier página (`/me`, `/projects`, `/tools`, `/admin`):
   - Ve header con logo, navegación central, y su avatar con menú

2. **Estado activo**:
   - En `/projects`: "Proyectos" aparece en azul (#3D5AFE) y negrita
   - En `/tools`: "Herramientas" aparece en azul (#3D5AFE) y negrita

3. **Usuario no autenticado** que visita `/projects` o `/tools`:
   - Si se requiere autenticación: redirige a `/`
   - Si son páginas públicas: muestra header simplificado solo con logo

4. **Redirects de compatibilidad**:
   - `/inspiration` → `/projects`
   - `/stack` → `/tools`

