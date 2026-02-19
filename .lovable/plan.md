

## Mover titulo de pagina al Header y eliminar redundancia

### Problema
Las paginas siguen mostrando titulos redundantes en el contenido (ej. "Mis Ideas" como h1) cuando el header ya muestra la ubicacion. El `MyAppHub` ya inyecta su detalle en el header via `usePageHeader()`, pero las demas paginas no lo hacen. Ademas, `navLinks` en el header tiene un bug: notifications usa `t.navigation.home` como label en vez de su propio label.

### Solucion

Cada pagina que use el `DashboardLayout` debe inyectar su contenido en el header via `usePageHeader()` y eliminar titulos h1 redundantes de su contenido.

---

### Cambios por archivo

#### 1. `src/components/AuthenticatedHeader.tsx`
- Corregir bug en navLinks: notifications label debe ser `t.navigation.notifications` (o el key correcto)
- Agregar entry para `/apps/:appId` match (actualmente `/apps/xyz` no matchea nada en navLinks porque usa exact match)
- En mobile, cuando NO hay `header.element` custom, mostrar el nombre de pagina actual (icon + label) en vez del logo de vibecoders, para que siempre se sepa donde estas

#### 2. `src/pages/Ideas.tsx`
- Agregar `usePageHeader()` + `useEffect` para inyectar icono + "Mis Ideas" en el header
- Eliminar el `<p>` de descripcion redundante (o moverlo debajo del contenido si se quiere conservar)

#### 3. `src/pages/Notifications.tsx` (NotificationsPage)
- Agregar `usePageHeader()` para inyectar icono + titulo + boton "Marcar todo como leido"
- Eliminar el bloque `<div className="mb-8">` con titulo/subtitulo redundante

#### 4. `src/pages/MyApps.tsx`
- Agregar `usePageHeader()` para inyectar icono + "Mis Apps"
- Eliminar la `<p>` de hint redundante

#### 5. `src/pages/Feedback.tsx`
- Agregar `usePageHeader()` para inyectar icono + "Hablemos"
- Eliminar el header interno con subtitle redundante

#### 6. `src/pages/Vibers.tsx`
- Agregar `usePageHeader()` para inyectar icono + "Mi Red"
- Eliminar el `<p>` de subtitle redundante

#### 7. `src/pages/Home.tsx`
- Agregar `usePageHeader()` para inyectar icono + "Inicio"

#### 8. `src/pages/Me.tsx`
- Agregar `usePageHeader()` para inyectar icono + "Mi Perfil"

#### 9. `src/pages/Tools.tsx`
- Agregar `usePageHeader()` para inyectar icono + "Tools"
- Eliminar el h1 + subtitle redundante

---

### Patron de implementacion para cada pagina

Cada pagina seguira este patron (mismo que ya usa `MyAppHub.tsx`):

```typescript
import { usePageHeader } from '@/contexts/PageHeaderContext';
import { useEffect } from 'react';
import { Lightbulb } from 'lucide-react'; // icono de la pagina

// Dentro del componente:
const { setHeaderContent } = usePageHeader();

useEffect(() => {
  setHeaderContent(
    <div className="flex items-center gap-2 min-w-0">
      <Lightbulb className="h-4 w-4 text-primary shrink-0" />
      <span className="font-semibold text-foreground truncate">Mis Ideas</span>
    </div>
  );
  return () => setHeaderContent(null);
}, [setHeaderContent]);
```

### Responsive
- En desktop: el header muestra "Home | [icono] Nombre de Pagina" (ya funciona con el breadcrumb existente cuando `header.element` esta presente)
- En mobile: el header muestra directamente el contenido custom (icono + nombre) en lugar del logo de vibecoders, asi siempre se sabe en que pagina estas
- En el caso de MyAppHub, se muestra el logo de la app + nombre + badges + boton "Ver pagina" (ya implementado)

### Archivos a modificar (10 archivos)

| Archivo | Cambio |
|---------|--------|
| `AuthenticatedHeader.tsx` | Fix notifications label bug, mejorar mobile fallback |
| `Ideas.tsx` | Inyectar header, eliminar titulo redundante |
| `Notifications.tsx` | Inyectar header, eliminar titulo redundante |
| `MyApps.tsx` | Inyectar header, eliminar hint redundante |
| `Feedback.tsx` | Inyectar header, eliminar header interno |
| `Vibers.tsx` | Inyectar header, eliminar subtitle |
| `Home.tsx` | Inyectar header |
| `Me.tsx` | Inyectar header |
| `Tools.tsx` | Inyectar header, eliminar h1 |
| `MyAppHub.tsx` | Ya implementado - sin cambios |

