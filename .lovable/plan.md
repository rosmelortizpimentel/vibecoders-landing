
# Plan: Sección de Inspiración / Community Showcase

## Resumen

Crear una nueva página `/inspiration` que muestre una galería de proyectos destacados de la comunidad Vibecoders. Esta sección servirá como fuente de inspiración y prueba social del potencial de la comunidad.

---

## 1. Estructura de Base de Datos

### Tabla: `showcase_gallery`

```sql
CREATE TABLE public.showcase_gallery (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  project_title text NOT NULL,
  project_tagline text NOT NULL,
  project_url text NOT NULL,
  project_thumbnail text NOT NULL,
  author_name text NOT NULL,
  author_avatar text,
  author_linkedin text,
  author_twitter text,
  author_website text,
  display_order numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  PRIMARY KEY (id)
);

-- Habilitar RLS con política de lectura pública
ALTER TABLE public.showcase_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view" ON public.showcase_gallery FOR SELECT USING (is_active = true);
```

---

## 2. Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `src/pages/Inspiration.tsx` | Página principal de la galería |
| `src/components/showcase/ShowcaseCard.tsx` | Componente de tarjeta individual |
| `src/components/showcase/ShowcaseCardSkeleton.tsx` | Skeleton loading para las tarjetas |
| `src/hooks/useShowcase.ts` | Hook para obtener datos de Supabase |

---

## 3. Diseño de Componentes

### 3.1 Página `Inspiration.tsx`

```text
┌─────────────────────────────────────────────────────────────┐
│                         NAVBAR                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│              Community Showcase                              │
│     Proyectos reales creados por vibecoders como tú         │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Card 1    │  │   Card 2    │  │   Card 3    │         │
│  │             │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Card 4    │  │   Card 5    │  │   Card 6    │         │
│  │             │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                         FOOTER                               │
└─────────────────────────────────────────────────────────────┘
```

**Layout:**
- Grid responsive: 1 col (mobile) / 2 cols (tablet) / 3 cols (desktop)
- `gap-6` o `gap-8` para espaciado

### 3.2 Componente `ShowcaseCard.tsx`

```text
┌────────────────────────────────────┐
│  ┌──────────────────────────────┐  │
│  │                              │  │
│  │    Imagen 16:9               │  │  ← Zoom sutil en hover
│  │    (project_thumbnail)       │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│                                    │
│  Título del Proyecto               │  ← font-semibold
│  Tagline corto limitado a dos      │  ← text-muted-foreground
│  líneas máximo...                  │     line-clamp-2
│                                    │
│  ─────────────────────────────────  │  ← Separador sutil
│                                    │
│  ┌──────┐                   🔗 🐦  │
│  │Avatar│ Nombre Autor      🌐 in  │  ← Iconos sociales
│  └──────┘                          │
└────────────────────────────────────┘
```

**Anatomía:**
- **Imagen**: Aspect ratio 16:9, bordes redondeados superiores, efecto scale en hover
- **Cuerpo**: Título (semibold), tagline (muted, line-clamp-2)
- **Footer**: Avatar + nombre a la izquierda, iconos sociales a la derecha

### 3.3 Skeleton Loading

Rectángulos animados con `animate-pulse` que replican la estructura de la tarjeta mientras cargan los datos.

---

## 4. Comportamiento e Interacciones

| Elemento | Comportamiento |
|----------|----------------|
| Imagen + Título | Link clickeable que abre `project_url` en nueva pestaña |
| Iconos sociales | Cada icono abre su respectiva URL del autor |
| Hover en tarjeta | `shadow-md` sutil + escala en imagen |
| Estado vacío | Mensaje invitando a construir algo si no hay proyectos |

---

## 5. Integración con Router

**Modificar `src/App.tsx`:**

```tsx
import Inspiration from "./pages/Inspiration";

// Agregar ruta antes de /:handle
<Route path="/inspiration" element={<Inspiration />} />
```

---

## 6. Hook `useShowcase.ts`

```tsx
// Fetch de showcase_gallery ordenado por display_order
// Filtrar solo is_active = true
// Retorna { projects, loading, error }
```

---

## 7. Estilos y Consistencia Visual

Siguiendo los patrones existentes del proyecto:

| Elemento | Estilos |
|----------|---------|
| Fondo página | `bg-[#F6F5F4]` (mismo que BentoGrid) |
| Tarjeta | `bg-white border border-stone-200 rounded-2xl` |
| Hover tarjeta | `hover:shadow-lg hover:-translate-y-1` |
| Color primario | `#3D5AFE` (azul de la marca) |
| Color texto | `#1c1c1c` (títulos), `text-stone-600` (body) |
| Iconos | Lucide React (Linkedin, Twitter, Globe, ExternalLink) |

---

## 8. Empty State

Cuando no hay proyectos:

```text
┌─────────────────────────────────────┐
│                                     │
│        [Icono de Cohete]            │
│                                     │
│    Aún no hay proyectos             │
│                                     │
│   Se el primero en construir        │
│   algo increíble con Vibecoders     │
│                                     │
└─────────────────────────────────────┘
```

---

## Sección Técnica

### Estructura de Datos TypeScript

```typescript
interface ShowcaseProject {
  id: string;
  project_title: string;
  project_tagline: string;
  project_url: string;
  project_thumbnail: string;
  author_name: string;
  author_avatar: string | null;
  author_linkedin: string | null;
  author_twitter: string | null;
  author_website: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}
```

### Query Supabase

```typescript
const { data, error } = await supabase
  .from('showcase_gallery')
  .select('*')
  .eq('is_active', true)
  .order('display_order', { ascending: true });
```

### Aspectos de Accesibilidad

- Imágenes con `alt` descriptivo
- Links con `aria-label` apropiados
- `target="_blank"` con `rel="noopener noreferrer"`
- Fallback para imágenes que no cargan

### Orden de Implementación

1. Crear migración SQL para tabla `showcase_gallery`
2. Crear hook `useShowcase.ts`
3. Crear componente `ShowcaseCardSkeleton.tsx`
4. Crear componente `ShowcaseCard.tsx`
5. Crear página `Inspiration.tsx`
6. Agregar ruta en `App.tsx`
7. Agregar link en navegación/footer (opcional)
