

## Plan: Badge de "Verificado" en Tarjetas de Startup

### Objetivo

Mostrar un icono de verificación oficial (BadgeCheck de Lucide) al lado del nombre de la app en todas las tarjetas del sitio, solo cuando `is_verified` es `true`.

---

### Componentes a Actualizar

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| `PreviewAppCard` | `src/components/me/PreviewAppCard.tsx` | Vista previa en el dashboard /me |
| `PublicAppCard` | `src/components/PublicProfileCard.tsx` | Tarjetas en perfil público |
| `FreshDropsCarousel` | `src/components/home/FreshDropsCarousel.tsx` | Carrusel en homepage |
| `get-public-profile` | `supabase/functions/get-public-profile/index.ts` | Edge function que sirve datos públicos |

---

### Sección Tecnica

#### 1. Actualizar Edge Function: `get-public-profile`

Añadir `is_verified` a la consulta de apps y al objeto de respuesta:

```typescript
// En la query de apps (línea 102)
.select(`
  id, url, name, tagline, logo_url, status_id, display_order, is_verified,
  app_stacks(stack_id)
`)

// En el mapeo de apps (línea 151)
return {
  id: app.id,
  url: app.url,
  name: app.name,
  tagline: app.tagline,
  logo_url: app.logo_url,
  is_verified: app.is_verified || false,  // NUEVO
  status: status ? { name: status.name, slug: status.slug } : null,
  stacks: appStacks
}
```

#### 2. Actualizar Tipos: `usePublicProfile.ts`

Añadir `is_verified` a la interfaz `PublicApp`:

```typescript
export interface PublicApp {
  id: string;
  url: string;
  name: string | null;
  tagline: string | null;
  logo_url: string | null;
  is_verified: boolean;  // NUEVO
  status: { name: string; slug: string } | null;
  stacks: PublicAppStack[];
}
```

#### 3. Actualizar Tipos: `useFreshDrops.ts`

Añadir `is_verified` a la interfaz y a la query:

```typescript
export interface FreshDropApp {
  // ... campos existentes
  is_verified: boolean;  // NUEVO
}

// En la query:
.select(`
  id, name, tagline, url, logo_url, created_at, is_verified,
  profiles:user_id (...)
`)
```

#### 4. Actualizar `PreviewAppCard.tsx`

Añadir el badge junto al título:

```tsx
import { BadgeCheck } from 'lucide-react';

// En el título (línea 59-62):
<div className="flex items-center gap-1.5 flex-wrap">
  <h4 className="text-sm font-semibold text-gray-900 truncate">
    {app.name || new URL(app.url).hostname}
  </h4>
  
  {/* Verified Badge */}
  {app.is_verified && (
    <Tooltip>
      <TooltipTrigger asChild>
        <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        Propietario Verificado
      </TooltipContent>
    </Tooltip>
  )}
  
  {/* Status Badge existente */}
  {status && (...)}
</div>
```

#### 5. Actualizar `PublicAppCard` en `PublicProfileCard.tsx`

Mismo patrón de badge junto al título:

```tsx
import { BadgeCheck } from 'lucide-react';

// En el título (línea 117-121):
<div className="flex items-center gap-1.5 flex-wrap">
  <h4 className="text-sm font-semibold text-gray-900 truncate">
    {app.name || ...}
  </h4>
  
  {/* Verified Badge */}
  {app.is_verified && (
    <Tooltip>
      <TooltipTrigger asChild>
        <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        Propietario Verificado
      </TooltipContent>
    </Tooltip>
  )}
  
  {/* Status Badge existente */}
  {app.status && (...)}
</div>
```

#### 6. Actualizar `FreshDropsCarousel.tsx`

Añadir badge en el carrusel del homepage:

```tsx
import { BadgeCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// En el título (línea 71-73):
<div className="flex items-center gap-1.5">
  <h3 className="font-semibold text-foreground text-lg truncate">
    {app.name || 'Sin nombre'}
  </h3>
  
  {/* Verified Badge */}
  {app.is_verified && (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <BadgeCheck className="h-[18px] w-[18px] text-primary flex-shrink-0" />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          Propietario Verificado
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )}
</div>
```

---

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `supabase/functions/get-public-profile/index.ts` | Añadir `is_verified` a query y respuesta |
| `src/hooks/usePublicProfile.ts` | Añadir `is_verified` a interface `PublicApp` |
| `src/hooks/useFreshDrops.ts` | Añadir `is_verified` a interface y query |
| `src/components/me/PreviewAppCard.tsx` | Añadir badge con tooltip al título |
| `src/components/PublicProfileCard.tsx` | Añadir badge con tooltip al título |
| `src/components/home/FreshDropsCarousel.tsx` | Añadir badge con tooltip al título |

---

### Resultado Visual Esperado

```text
┌──────────────────────────────────────────┐
│  [Logo]  Mi App ✓  ● Live                │
│          Una app increíble               │
│  ────────────────────────────────        │
│  [tech icons]              [❤️] [→]      │
└──────────────────────────────────────────┘
          ^
          └── BadgeCheck azul (color primario)
              Tooltip: "Propietario Verificado"
```

---

### Especificaciones del Badge

- **Icono**: `BadgeCheck` de lucide-react
- **Color**: `text-primary` (azul de la marca #3D5AFE)
- **Tamaño**: `h-4 w-4` (16x16px) o `h-[18px] w-[18px]` para el carrusel
- **Tooltip**: "Propietario Verificado"
- **Posición**: Inmediatamente después del nombre, antes del status badge

