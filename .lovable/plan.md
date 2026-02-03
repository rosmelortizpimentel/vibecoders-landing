
# Plan: Sección de Imagen OG en Branding

## Resumen
Agregar una sección completa en la pestaña de Branding que permita a los usuarios subir una imagen OG personalizada (1200x630px) para mejorar las previsualizaciones de su perfil en redes sociales, con mocks visuales de cómo aparecerá en LinkedIn, WhatsApp y X/Twitter.

---

## Vista Previa del Diseño

La nueva sección incluirá:
- Uploader de imagen con ratio 1.91:1 (1200x630px)
- Grid de 3 mocks mostrando cómo se verá en cada plataforma
- Enlaces a herramientas de debug (Facebook, LinkedIn)
- Nota sobre caché con estilo informativo

---

## Cambios a Realizar

### 1. Base de Datos
**Agregar campo `og_image_url` a la tabla `profiles`**

```sql
ALTER TABLE profiles 
ADD COLUMN og_image_url text;
```

### 2. Backend - Edge Function
**Archivo:** `supabase/functions/og-profile-meta/index.ts`

Modificar para:
- Incluir `og_image_url` en la consulta del perfil
- Usar `og_image_url` como imagen OG principal si existe
- Fallback a `avatar_url` si no hay og_image_url
- Fallback a `default_og_image` si no hay ninguna

### 3. Tipos TypeScript
**Archivo:** `src/hooks/useProfileEditor.ts`

- Agregar `og_image_url: string | null` a la interfaz `ProfileData`
- Agregar al objeto de update en `saveProfile`
- Crear función `uploadOgImage` similar a `uploadBanner`

### 4. Componente Principal
**Nuevo archivo:** `src/components/me/OgImageSection.tsx`

Contendrá:
- **Uploader de imagen OG**
  - Área de drop/click con ratio 1.91:1
  - Overlay con icono de cámara y tamaño recomendado
  - Botón de eliminar imagen
  
- **Grid de previews (3 columnas en desktop, 1 en móvil)**
  - Mock de LinkedIn (fondo blanco, borde gris, tipografía característica)
  - Mock de WhatsApp (fondo verde claro, burbuja de mensaje)
  - Mock de X/Twitter (fondo oscuro, bordes redondeados)

- **Sección de herramientas y notas**
  - Links externos a Facebook Debug y LinkedIn Post Inspector
  - Nota informativa sobre caché en un box con borde gris claro

### 5. Integración en BrandingTab
**Archivo:** `src/components/me/BrandingTab.tsx`

- Agregar nueva sección debajo de "Colores"
- Pasar props necesarias (profile, onUpdate, uploadOgImage)

---

## Diseño Visual

### Especificaciones de Estilo
- Fondo blanco (#FFFFFF)
- Bordes gris claro (#E5E7EB)
- Texto oscuro (#1C1C1C)
- Color primario para enlaces (#3D5AFE)
- Sin emojis, iconos Lucide únicamente
- Bordes redondeados (rounded-lg)

### Mocks de Redes Sociales

**LinkedIn Mock:**
```text
┌─────────────────────────────┐
│  [Imagen OG 1.91:1]         │
├─────────────────────────────┤
│  vibecoders.la              │
│  Nombre del Usuario         │
│  Tagline del perfil...      │
└─────────────────────────────┘
```

**WhatsApp Mock:**
```text
     ┌─────────────────────────┐
     │  [Imagen OG]            │
     │  ─────────────────────  │
     │  Nombre | vibecoders.la │
     │  Tagline del perfil     │
     └─────────────────────────┘
```

**X/Twitter Mock:**
```text
┌─────────────────────────────┐
│  [Imagen OG 1.91:1]         │
│  ─────────────────────────  │
│  Nombre del Usuario         │
│  Tagline del perfil...      │
│  vibecoders.la/@username    │
└─────────────────────────────┘
```

### Nota de Caché
```text
┌──────────────────────────────────────────────────┐
│ ℹ  Los cambios pueden tardar en reflejarse en   │
│    estas plataformas debido a su sistema de     │
│    caché. Usa las herramientas de arriba para   │
│    forzar una actualización.                    │
└──────────────────────────────────────────────────┘
```

---

## Responsividad

| Breakpoint | Comportamiento |
|------------|----------------|
| Mobile (<640px) | Mocks apilados verticalmente, uploader full-width |
| Tablet (640-1024px) | Grid 2 columnas para mocks |
| Desktop (>1024px) | Grid 3 columnas para mocks |

---

## Detalles Técnicos

### Flujo de Subida de Imagen
1. Usuario hace click en el área de subida
2. Selecciona imagen de su dispositivo
3. Imagen se sube a Supabase Storage (`profile-assets/{user_id}/og_image_{timestamp}.ext`)
4. URL pública se guarda en `profiles.og_image_url`
5. Auto-save actualiza la base de datos
6. Edge function usará esta imagen para metadatos OG

### Jerarquía de Imágenes OG
```text
1. og_image_url (imagen personalizada del usuario)
   ↓ si no existe
2. avatar_url (foto de perfil)
   ↓ si no existe  
3. default_og_image (de general_settings)
```

---

## Archivos a Crear/Modificar

| Archivo | Acción |
|---------|--------|
| `supabase/migrations/xxx_add_og_image_url.sql` | Crear |
| `src/components/me/OgImageSection.tsx` | Crear |
| `src/components/me/BrandingTab.tsx` | Modificar |
| `src/hooks/useProfileEditor.ts` | Modificar |
| `supabase/functions/og-profile-meta/index.ts` | Modificar |
