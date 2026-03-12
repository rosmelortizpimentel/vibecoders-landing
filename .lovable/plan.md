

# Plan: Sistema de Ponentes y Talleres

## Base de datos (migración SQL)

### Tabla `speakers`
- `id` uuid PK default gen_random_uuid()
- `user_id` uuid **nullable** (opcional, solo para vincular con un perfil existente)
- `display_name` text NOT NULL
- `tagline` text
- `photo_url` text
- `created_at` timestamptz default now()

### Tabla `workshops`
- `id` uuid PK default gen_random_uuid()
- `title` text NOT NULL
- `description` text
- `banner_url` text
- `scheduled_at` timestamptz NOT NULL
- `duration_minutes` integer
- `status` text NOT NULL default 'draft' (draft/published/cancelled)
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

### Tabla `workshop_speakers`
- `workshop_id` uuid FK → workshops ON DELETE CASCADE
- `speaker_id` uuid FK → speakers ON DELETE CASCADE
- PK compuesto (workshop_id, speaker_id)

### RLS — solo admins (las 3 tablas)
- SELECT/INSERT/UPDATE/DELETE: `has_role(auth.uid(), 'admin')`

### Storage
- Bucket `workshop-assets` (público) para banners
- Policy: solo admins pueden subir/eliminar

## Frontend

### Nuevos archivos
1. **`src/components/admin/SpeakersManager.tsx`** — Lista de ponentes con foto, nombre, tagline. Botón para agregar ponente: Dialog con buscador de usuarios (query a profiles). Al seleccionar, clona name/tagline/avatar_url a los campos del speaker. Campos editables post-clonación. Botón eliminar.

2. **`src/components/admin/WorkshopsManager.tsx`** — Lista de talleres con título, fecha, estado, ponentes. Formulario crear/editar: título, descripción, datetime-local, banner upload a `workshop-assets`, estado select (draft/published/cancelled), multi-select de ponentes desde tabla speakers.

### Archivos a modificar
3. **`src/components/admin/AdminSidebar.tsx`** — Agregar 2 items: "Ponentes" (icon: `Mic`) y "Talleres" (icon: `Calendar`)

4. **`src/pages/Admin.tsx`** — Agregar rutas `/admin/speakers` y `/admin/workshops` con imports de los nuevos componentes

