

# Plan: Página /me - Dashboard de Configuración de Perfil

## Resumen Ejecutivo

Crear una página de dashboard completa en `/me` para que los usuarios autenticados configuren su perfil, gestionen sus apps y personalicen el branding de su perfil publico. La pagina incluira:

- **3 tabs principales**: Perfil, Apps, Branding
- **Vista previa en tiempo real** del perfil publico en barra lateral derecha
- **Auto-guardado** de todos los cambios
- **Diseño minimalista** manteniendo paleta existente (#3D5AFE, #1c1c1c, blanco)

---

## Estructura de Base de Datos

### Tablas Nuevas

```text
┌─────────────────────────────────────────────────────────────────┐
│                          profiles                                │
│  (MODIFICAR tabla existente - agregar campos)                   │
├─────────────────────────────────────────────────────────────────┤
│ + name          TEXT         ← Nombre completo (requerido)      │
│ + tagline       TEXT (100)   ← Frase corta                      │
│ + bio           TEXT (500)   ← Descripcion con markdown         │
│ + location      TEXT         ← Ciudad/Pais                      │
│ + website       TEXT         ← URL personal                     │
│ + avatar_url    TEXT         ← URL de Supabase Storage          │
│                                                                  │
│ REDES SOCIALES:                                                  │
│ + twitter       TEXT         ← @usuario                         │
│ + github        TEXT         ← username                         │
│ + tiktok        TEXT         ← @usuario                         │
│ + instagram     TEXT         ← @usuario                         │
│ + youtube       TEXT         ← @canal o URL                     │
│ + linkedin      TEXT         ← URL perfil                       │
│ + email_public  TEXT         ← Email de contacto publico        │
│                                                                  │
│ BRANDING:                                                        │
│ + font_family   TEXT         ← Nombre Google Font               │
│ + primary_color TEXT         ← Hex color primario               │
│ + accent_color  TEXT         ← Hex color secundario             │
│ + card_style    TEXT         ← Estilo de tarjetas               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         app_categories                           │
│  (tabla de referencia)                                           │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ name            TEXT         ← "Artificial Intelligence"        │
│ slug            TEXT UNIQUE  ← "ai"                             │
│ icon            TEXT         ← Nombre icono Lucide              │
│ display_order   INTEGER                                          │
└─────────────────────────────────────────────────────────────────┘

Datos iniciales:
- Artificial Intelligence (brain)
- Productivity (zap)
- Education (graduation-cap)
- No Code (blocks)
- Social Media (share-2)
- E-Commerce (shopping-cart)
- Analytics (bar-chart-2)
- Web 3 (coins)
- Design Tools (palette)
- Developer Tools (code-2)
- Marketing (megaphone)
- Finance (dollar-sign)
- Others (grid-3x3)

┌─────────────────────────────────────────────────────────────────┐
│                          app_statuses                            │
│  (tabla de referencia)                                           │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ name            TEXT         ← "Building..."                    │
│ slug            TEXT UNIQUE  ← "building"                       │
│ color           TEXT         ← "#FFA500"                        │
│ icon            TEXT         ← Nombre icono Lucide              │
│ display_order   INTEGER                                          │
└─────────────────────────────────────────────────────────────────┘

Datos iniciales:
- Building... (construction, #FFA500)
- Active (circle-dot, #22C55E)
- On Hold (pause-circle, #9CA3AF)
- For Sale (hand-coins, #F59E0B)
- Acquired (badge-dollar-sign, #10B981)
- Discontinued (x-circle, #EF4444)

┌─────────────────────────────────────────────────────────────────┐
│                          tech_stacks                             │
│  (tabla para tecnologias)                                        │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ name            TEXT         ← "React"                          │
│ logo_url        TEXT         ← URL al logo                      │
│ tags            JSONB        ← ["frontend", "framework"]        │
│ display_order   INTEGER                                          │
└─────────────────────────────────────────────────────────────────┘

Datos iniciales (cargados de CDN publico):
Frontend: React, Vue, Angular, Svelte, Next.js, Remix, Astro
Backend: Node.js, Python, Go, Rust, Java, PHP, Ruby
Database: PostgreSQL, MySQL, MongoDB, Redis, Supabase
Cloud: AWS, GCP, Azure, Vercel, Netlify, Railway
Mobile: React Native, Flutter, Swift, Kotlin
AI/ML: OpenAI, Anthropic, Hugging Face, LangChain
Vibe Coding: Lovable, Cursor, Bolt, v0, Replit

┌─────────────────────────────────────────────────────────────────┐
│                            apps                                  │
│  (apps del usuario)                                              │
├─────────────────────────────────────────────────────────────────┤
│ id              UUID PK                                          │
│ user_id         UUID FK → profiles.id                           │
│ url             TEXT NOT NULL  ← URL de la app                  │
│ name            TEXT           ← Nombre opcional                │
│ tagline         TEXT (100)     ← Frase corta                    │
│ description     TEXT (500)     ← Descripcion markdown           │
│ logo_url        TEXT           ← URL en Storage                 │
│ category_id     UUID FK → app_categories.id                     │
│ status_id       UUID FK → app_statuses.id                       │
│ hours_ideation  INTEGER        ← Horas concebir/analizar        │
│ hours_building  INTEGER        ← Horas construyendo             │
│ is_visible      BOOLEAN        ← Toggle mostrar/ocultar         │
│ display_order   INTEGER        ← Orden en perfil                │
│ created_at      TIMESTAMPTZ                                      │
│ updated_at      TIMESTAMPTZ                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          app_stacks                              │
│  (relacion muchos a muchos: apps ↔ tech_stacks)                 │
├─────────────────────────────────────────────────────────────────┤
│ app_id          UUID FK → apps.id                               │
│ stack_id        UUID FK → tech_stacks.id                        │
│ PRIMARY KEY (app_id, stack_id)                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Storage Bucket

```text
┌─────────────────────────────────────────────────────────────────┐
│                      profile-assets                              │
│  (bucket publico)                                                │
├─────────────────────────────────────────────────────────────────┤
│ Estructura de carpetas:                                          │
│ /{user_id}/avatar.{ext}     ← Foto de perfil                    │
│ /{user_id}/apps/{app_id}.{ext} ← Logos de apps                  │
│                                                                  │
│ RLS Policies:                                                    │
│ - SELECT: publico (todos pueden ver)                            │
│ - INSERT/UPDATE/DELETE: solo el owner (auth.uid() = user_id)   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Arquitectura de Componentes

```text
src/
├── pages/
│   └── Me.tsx                    ← Pagina principal /me
│
├── components/
│   └── me/
│       ├── MeLayout.tsx          ← Layout con tabs + preview lateral
│       ├── MeTabs.tsx            ← Componente de tabs
│       │
│       ├── ProfileTab.tsx        ← Tab Perfil
│       │   ├── ProfileBasicInfo.tsx    ← Nombre, tagline, bio
│       │   ├── ProfileLocation.tsx     ← Ubicacion, website
│       │   └── ProfileSocials.tsx      ← Redes sociales
│       │
│       ├── AppsTab.tsx           ← Tab Apps
│       │   ├── AppsList.tsx            ← Lista de apps con drag
│       │   ├── AppCard.tsx             ← Tarjeta individual
│       │   └── AppEditor.tsx           ← Editor inline/modal
│       │
│       ├── BrandingTab.tsx       ← Tab Branding
│       │   ├── FontSelector.tsx        ← Selector Google Fonts
│       │   ├── ColorPicker.tsx         ← Selector de colores
│       │   └── CardStyleSelector.tsx   ← Estilos de tarjeta
│       │
│       └── ProfilePreview.tsx    ← Vista previa del perfil publico
│
├── hooks/
│   ├── useProfileEditor.ts       ← Hook para edicion de perfil
│   ├── useApps.ts                ← Hook CRUD de apps
│   ├── useCategories.ts          ← Hook para categorias
│   ├── useStatuses.ts            ← Hook para statuses
│   ├── useTechStacks.ts          ← Hook para tech stacks
│   └── useAutoSave.ts            ← Hook para auto-guardado
│
└── lib/
    └── markdown.ts               ← Parser markdown basico
```

---

## Flujo de UI - Tab Perfil

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  PERFIL          APPS          BRANDING                              │
├────────────────────────────────────────────┬────────────────────────────────┤
│                                            │                                │
│  ┌─────────────┐                           │    ┌──────────────────────┐   │
│  │   Avatar    │  Nombre*                  │    │                      │   │
│  │   [foto]    │  ┌──────────────────┐     │    │   PREVIEW            │   │
│  └─────────────┘  │ Rosmel Ortiz     │     │    │   EN TIEMPO REAL     │   │
│                   └──────────────────┘     │    │                      │   │
│                                            │    │   [Perfil Publico]   │   │
│  Tagline (100)                             │    │                      │   │
│  ┌──────────────────────────────────┐      │    │                      │   │
│  │ Vibecoder desde 2024             │      │    │                      │   │
│  └──────────────────────────────────┘      │    │                      │   │
│                                            │    │                      │   │
│  Bio (500)                     [0/500]     │    │                      │   │
│  ┌──────────────────────────────────┐      │    │                      │   │
│  │ B  I  •  ─                       │      │    │                      │   │
│  │ ────────────────────────────     │      │    │                      │   │
│  │ Construyo productos digitales... │      │    │                      │   │
│  │                                  │      │    │                      │   │
│  └──────────────────────────────────┘      │    │                      │   │
│                                            │    │                      │   │
│  ─────────────────────────────────────     │    │                      │   │
│                                            │    │                      │   │
│  Ubicacion           Website               │    │                      │   │
│  ┌──────────────┐    ┌──────────────┐      │    │                      │   │
│  │ Toronto, CA  │    │ rosmel.dev   │      │    │                      │   │
│  └──────────────┘    └──────────────┘      │    │                      │   │
│                                            │    │                      │   │
│  ─────────────────────────────────────     │    └──────────────────────┘   │
│                                            │                                │
│  Redes Sociales                            │                                │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │                                │
│  │ tw  │ │ gh  │ │ tk  │ │ ig  │ ...      │                                │
│  └─────┘ └─────┘ └─────┘ └─────┘          │                                │
│                                            │                                │
└────────────────────────────────────────────┴────────────────────────────────┘
```

---

## Flujo de UI - Tab Apps

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  PERFIL          APPS          BRANDING                              │
├────────────────────────────────────────────┬────────────────────────────────┤
│                                            │                                │
│  ┌──────────────────────────────────────┐  │    ┌──────────────────────┐   │
│  │      + AGREGAR APP                   │  │    │                      │   │
│  └──────────────────────────────────────┘  │    │   PREVIEW            │   │
│                                            │    │                      │   │
│  ┌──────────────────────────────────────┐  │    │   [Lista de apps     │   │
│  │ ⋮⋮ [logo] HubMenu                   ○│  │    │    del usuario]      │   │
│  │      Menus digitales para...        │  │    │                      │   │
│  │      ┌────┐ ┌────┐ ┌────┐ ┌────┐    │  │    │                      │   │
│  │      │ 🔗 │ │ 🏷️ │ │ 📊 │ │ 🗑️ │    │  │    │                      │   │
│  │      └────┘ └────┘ └────┘ └────┘    │  │    │                      │   │
│  └──────────────────────────────────────┘  │    │                      │   │
│                                            │    │                      │   │
│  ┌──────────────────────────────────────┐  │    │                      │   │
│  │ ⋮⋮ [logo] Toggleup                  ●│  │    │                      │   │
│  │      Feature flags para...           │  │    │                      │   │
│  │      ...                             │  │    │                      │   │
│  └──────────────────────────────────────┘  │    │                      │   │
│                                            │    └──────────────────────┘   │
│                                            │                                │
└────────────────────────────────────────────┴────────────────────────────────┘

Campos al expandir/editar app:
- Logo (upload)
- Nombre
- URL* (requerido)
- Tagline (100)
- Descripcion (500) con markdown
- Categoria (select)
- Status (select)
- Tech Stack (multi-select con logos)
- Horas ideacion
- Horas construccion
- Toggle visible
- Boton eliminar
```

---

## Flujo de UI - Tab Branding

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  PERFIL          APPS          BRANDING                              │
├────────────────────────────────────────────┬────────────────────────────────┤
│                                            │                                │
│  Tipografia                                │    ┌──────────────────────┐   │
│  ┌──────────────────────────────────────┐  │    │                      │   │
│  │ ▼  Inter                             │  │    │   PREVIEW            │   │
│  └──────────────────────────────────────┘  │    │   CON FUENTE         │   │
│  Preview: "The quick brown fox..."         │    │   SELECCIONADA       │   │
│                                            │    │                      │   │
│  ─────────────────────────────────────     │    │                      │   │
│                                            │    │                      │   │
│  Color Primario        Color Acento        │    │                      │   │
│  ┌────────────┐        ┌────────────┐      │    │                      │   │
│  │ [#3D5AFE] │        │ [#1c1c1c] │      │    │                      │   │
│  └────────────┘        └────────────┘      │    │                      │   │
│                                            │    │                      │   │
│  ─────────────────────────────────────     │    │                      │   │
│                                            │    │                      │   │
│  Estilo de Tarjetas                        │    │                      │   │
│  ○ Clasico   ○ Moderno   ● Minimalista    │    │                      │   │
│                                            │    │                      │   │
│  [vista previa de cada estilo]             │    └──────────────────────┘   │
│                                            │                                │
└────────────────────────────────────────────┴────────────────────────────────┘
```

---

## Implementacion por Fases

### Fase 1: Base de Datos y Storage
1. Migracion SQL para modificar tabla `profiles`
2. Crear tablas `app_categories`, `app_statuses`, `tech_stacks`
3. Crear tabla `apps` y `app_stacks`
4. Crear bucket `profile-assets` con RLS
5. Insertar datos iniciales (categorias, statuses, tech stacks)

### Fase 2: Hooks y Logica
1. Hook `useProfileEditor` - CRUD perfil con auto-save
2. Hook `useApps` - CRUD apps
3. Hook `useAutoSave` - Debounce generico para guardar
4. Hooks de referencia: `useCategories`, `useStatuses`, `useTechStacks`
5. Parser markdown basico para descripciones

### Fase 3: Componentes UI - Tab Perfil
1. `MeLayout.tsx` - Layout principal con sidebar preview
2. `MeTabs.tsx` - Navegacion de tabs
3. `ProfileTab.tsx` - Formulario de perfil
4. `ProfileSocials.tsx` - Grid de iconos de redes
5. `ProfilePreview.tsx` - Vista previa en tiempo real

### Fase 4: Componentes UI - Tab Apps
1. `AppsTab.tsx` - Contenedor del tab
2. `AppCard.tsx` - Tarjeta compacta de app
3. `AppEditor.tsx` - Editor inline expandible
4. Selector de tech stacks con logos
5. Drag and drop para reordenar (opcional para v1)

### Fase 5: Componentes UI - Tab Branding
1. `BrandingTab.tsx` - Contenedor
2. `FontSelector.tsx` - Dropdown Google Fonts (top 20)
3. `ColorPicker.tsx` - Input color con preview
4. `CardStyleSelector.tsx` - Radio con previews

### Fase 6: Integracion y Pulido
1. Routing: Agregar `/me` en App.tsx
2. Proteger ruta para usuarios autenticados
3. Actualizar `PublicProfileCard` para usar branding
4. Edge function para cargar Google Fonts dinamicamente
5. Testing responsivo mobile/tablet/desktop

---

## Detalles Tecnicos

### Google Fonts (Top 20)
```javascript
const POPULAR_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Poppins', 'Raleway', 'Nunito', 'Source Sans Pro', 'PT Sans',
  'Oswald', 'Playfair Display', 'Merriweather', 'Ubuntu', 'Work Sans',
  'DM Sans', 'Space Grotesk', 'Outfit', 'Sora', 'Plus Jakarta Sans'
];
```

### Auto-guardado
- Debounce de 1.5 segundos despues de cada cambio
- Indicador visual sutil "Guardando..." / "Guardado"
- No mostrar toast en cada guardado (solo en errores)

### Markdown Basico
Soportar:
- `**texto**` → negritas
- `*texto*` o `_texto_` → italica
- `- item` → listas
- Sanitizar HTML para prevenir XSS

### Responsive Design
- **Mobile**: Preview oculto, tabs en sticky top
- **Tablet**: Preview como drawer lateral colapsable
- **Desktop**: Layout side-by-side 60/40

---

## Archivos a Crear/Modificar

| Archivo | Accion |
|---------|--------|
| `src/pages/Me.tsx` | Crear |
| `src/components/me/MeLayout.tsx` | Crear |
| `src/components/me/MeTabs.tsx` | Crear |
| `src/components/me/ProfileTab.tsx` | Crear |
| `src/components/me/ProfileSocials.tsx` | Crear |
| `src/components/me/AppsTab.tsx` | Crear |
| `src/components/me/AppCard.tsx` | Crear |
| `src/components/me/AppEditor.tsx` | Crear |
| `src/components/me/BrandingTab.tsx` | Crear |
| `src/components/me/FontSelector.tsx` | Crear |
| `src/components/me/ColorPicker.tsx` | Crear |
| `src/components/me/ProfilePreview.tsx` | Crear |
| `src/hooks/useProfileEditor.ts` | Crear |
| `src/hooks/useApps.ts` | Crear |
| `src/hooks/useAutoSave.ts` | Crear |
| `src/hooks/useCategories.ts` | Crear |
| `src/hooks/useStatuses.ts` | Crear |
| `src/hooks/useTechStacks.ts` | Crear |
| `src/lib/markdown.ts` | Crear |
| `src/App.tsx` | Modificar (agregar ruta /me) |
| `src/components/PublicProfileCard.tsx` | Modificar (usar branding) |
| Migracion SQL | Crear (nuevas tablas + datos) |

---

## Consideraciones de Seguridad

- RLS en todas las tablas: solo owner puede editar su perfil/apps
- Storage: usuarios solo pueden subir a su carpeta `/{user_id}/`
- Validacion de URLs (evitar XSS)
- Sanitizacion de markdown en descripciones
- Rate limiting en uploads (max 5MB por imagen)

