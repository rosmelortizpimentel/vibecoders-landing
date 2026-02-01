

# Plan: Badge de Founding Member con Imagen Personalizada

## Resumen

Reemplazaremos el badge "PIONEER" actual (texto + icono de estrella) por una imagen personalizada que subirás. La imagen se almacenará en Supabase Storage y se gestionará desde una nueva tabla `general_settings` para configuraciones globales del sistema.

## Diseño Visual

- **Forma**: Imagen circular con bordes redondeados
- **Tamaño**: 30px x 30px
- **Posición**: Al costado derecho del nombre del usuario
- **Interacción**: Tooltip al hover mostrando "Early Founding Member"

## Arquitectura de Datos

### Nueva Tabla: `general_settings`

Tabla para almacenar configuraciones globales del sistema (badges, logos, configuraciones, etc.):

```text
┌─────────────────────────────────────────────────────────┐
│                    general_settings                      │
├─────────────────────────────────────────────────────────┤
│ id          │ uuid (PK)      │ Identificador único      │
│ key         │ text (UNIQUE)  │ Clave de configuración   │
│ value       │ text           │ Valor (URL, texto, etc.) │
│ description │ text           │ Descripción del setting  │
│ created_at  │ timestamptz    │ Fecha de creación        │
│ updated_at  │ timestamptz    │ Fecha de actualización   │
└─────────────────────────────────────────────────────────┘
```

### Registro Inicial

```text
key: "pioneer_badge_url"
value: [URL de la imagen en Supabase Storage]
description: "URL de la imagen del badge para Founding Members"
```

## Archivos a Modificar

### 1. Base de Datos (Migración SQL)

- Crear tabla `general_settings` con políticas RLS (lectura pública, escritura restringida)
- Insertar registro inicial con la URL del badge de pioneer

### 2. Supabase Storage

- Subir la imagen proporcionada al bucket `profile-assets` en la carpeta `badges/`
- La imagen será pública para que pueda mostrarse en todos los perfiles

### 3. Hook para Settings

**Nuevo: `src/hooks/useGeneralSettings.ts`**

- Hook para obtener configuraciones globales
- Función específica para obtener el `pioneer_badge_url`
- Cache de configuraciones para evitar múltiples consultas

### 4. Componente PioneerBadge

**Modificar: `src/components/PioneerBadge.tsx`**

- Cambiar de icono + texto a imagen circular
- Obtener la URL de la imagen desde `general_settings`
- Mantener el Tooltip con "Early Founding Member"
- Estilos: `w-[30px] h-[30px] rounded-full object-cover`

### 5. Vistas de Perfil (sin cambios estructurales)

Los componentes `ProfilePreview.tsx` y `PublicProfileCard.tsx` ya importan y usan `PioneerBadge`, solo necesitan ajustes menores de alineación.

## Detalles Técnicos

### Migración SQL

```sql
-- Crear tabla general_settings
CREATE TABLE public.general_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS: Lectura pública, sin escritura desde frontend
ALTER TABLE public.general_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
  ON public.general_settings FOR SELECT
  USING (true);

-- Insertar badge URL (después de subir imagen)
INSERT INTO public.general_settings (key, value, description)
VALUES (
  'pioneer_badge_url',
  'https://zkotnnmrehzqonlyeorv.supabase.co/storage/v1/object/public/profile-assets/badges/pioneer-badge.png',
  'URL de la imagen del badge para Founding Members'
);
```

### Componente PioneerBadge Actualizado

```tsx
// Antes: Icono + Texto
<span className="...">
  <Star className="..." />
  PIONEER
</span>

// Después: Imagen circular
<img 
  src={pioneerBadgeUrl}
  alt="Pioneer Badge"
  className="w-[30px] h-[30px] rounded-full object-cover"
/>
```

### Ubicación Visual

**ProfilePreview (editor):**
```text
[Nombre del Usuario] [🏅 30x30]
```

**PublicProfileCard (perfil público):**
```text
        Nombre  [🏅 30x30]
       @username
```

## Flujo de Implementación

1. Crear tabla `general_settings` (migración)
2. Subir imagen al bucket `profile-assets/badges/`
3. Insertar URL en `general_settings`
4. Crear hook `useGeneralSettings`
5. Actualizar `PioneerBadge.tsx` para usar imagen
6. Ajustar alineación en `ProfilePreview.tsx` y `PublicProfileCard.tsx`

## Resultado Esperado

Los usuarios con `is_pioneer = true` verán tu imagen personalizada como badge circular de 30x30px junto a su nombre, con tooltip explicativo al hacer hover.

