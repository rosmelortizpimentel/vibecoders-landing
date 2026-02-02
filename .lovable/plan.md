
# Plan: Añadir Logo de App y Badge "Creador" al Showcase

## Resumen

Este plan implementa dos mejoras visuales para las tarjetas de Showcase, transformándolas en un directorio profesional estilo Product Hunt:

1. **Logo del proyecto** junto al título
2. **Badge "Creador"** en el footer junto al nombre del autor

---

## Cambios Requeridos

### 1. Base de Datos (Supabase)

Añadir una nueva columna a la tabla `showcase_gallery`:

```sql
ALTER TABLE showcase_gallery
ADD COLUMN project_logo_url text;
```

Esta columna es nullable, permitiendo que proyectos existentes funcionen sin logo.

---

### 2. Componente ShowcaseCard.tsx

**Estructura visual actualizada:**

```text
┌─────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              THUMBNAIL (16:9)                           │    │
│  │              object-cover, sin distorsión               │    │
│  └─────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│  [Logo]  Título del Proyecto                                    │
│   40x40  Tagline del proyecto en una o dos líneas...            │
├─────────────────────────────────────────────────────────────────┤
│  [Avatar] Nombre del Autor [Creador]        [in] [X] [🌐]       │
└─────────────────────────────────────────────────────────────────┘
```

**Cambios en el Body (sección del título):**

- Layout: `flex items-start gap-3`
- Logo a la izquierda:
  - Tamaño: `w-10 h-10` (40px)
  - Estilo: `rounded-lg`, `object-cover`, borde sutil
  - Si no hay logo: No mostrar nada (el título ocupa todo el ancho)
- Título y tagline a la derecha en un contenedor flex-1

**Cambios en el Footer (badge Creador):**

- Añadir Badge después del nombre del autor
- Estilos del badge:
  - `text-[10px]` o `text-xs`
  - `bg-gray-100`
  - `text-gray-500`
  - `rounded-full`
  - `px-2 py-0.5`

---

### 3. Hook useShowcase.ts

Añadir `project_logo_url` a la interface `ShowcaseProject`:

```typescript
export interface ShowcaseProject {
  // ... campos existentes
  project_logo_url: string | null;  // NUEVO
}
```

---

### 4. Formulario Admin (ShowcaseForm.tsx)

Añadir campo para subir el logo del proyecto:

- Nuevo input de archivo junto al thumbnail
- Mismo patrón de upload que thumbnail pero con dimensiones cuadradas
- Preview de 40x40 con bordes redondeados

---

### 5. ShowcaseManager.tsx

Actualizar la interface del formulario para incluir `project_logo_url`.

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| **Migración SQL** | Añadir columna `project_logo_url` |
| `src/hooks/useShowcase.ts` | Añadir `project_logo_url` al tipo |
| `src/components/showcase/ShowcaseCard.tsx` | Logo + Badge "Creador" |
| `src/components/admin/ShowcaseForm.tsx` | Campo para subir logo |
| `src/components/admin/ShowcaseManager.tsx` | Incluir logo en el formulario |

---

## Sección Técnica

### Código del Badge "Creador"

```tsx
<Badge className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-normal">
  Creador
</Badge>
```

### Código del Logo en el Body

```tsx
<div className="p-4">
  <a href={project.project_url} className="flex items-start gap-3 group/title">
    {/* Logo */}
    {project.project_logo_url && (
      <img
        src={project.project_logo_url}
        alt={`Logo de ${project.project_title}`}
        className="w-10 h-10 rounded-lg object-cover border border-stone-200 flex-shrink-0"
      />
    )}
    
    {/* Title & Tagline */}
    <div className="flex-1 min-w-0">
      <h3 className="text-lg font-semibold text-[#1c1c1c] group-hover/title:text-[#3D5AFE] line-clamp-1">
        {project.project_title}
      </h3>
      <p className="mt-1 text-sm text-stone-600 line-clamp-2">
        {project.project_tagline}
      </p>
    </div>
  </a>
</div>
```

### Responsividad

La página ya es 100% responsive:
- **Móvil**: 1 columna (`grid-cols-1`)
- **Tablet**: 2 columnas (`md:grid-cols-2`)
- **Desktop**: 3 columnas (`lg:grid-cols-3`)

Los componentes internos usan Flexbox con `flex-wrap` y `min-w-0` para evitar desbordamientos en pantallas pequeñas.

### Migración SQL

```sql
-- Añadir columna para el logo del proyecto
ALTER TABLE showcase_gallery
ADD COLUMN project_logo_url text;

-- Comentario descriptivo
COMMENT ON COLUMN showcase_gallery.project_logo_url IS 
  'URL del logo cuadrado del proyecto (opcional)';
```
