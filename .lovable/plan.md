

## Boveda de Prompts (Prompt Vault)

Feature completa para que los usuarios gestionen, organicen y compartan prompts de IA con soporte para archivos adjuntos, tags personalizados y preparada para un futuro marketplace.

### 1. Base de Datos

**Tabla `prompts`:**
- `id` UUID PK
- `user_id` UUID FK a auth.users
- `title` text NOT NULL
- `description` text (Markdown)
- `tags` text[] default '{}'
- `tool_used` text (Lovable, Cursor, Windsurf, ChatGPT, etc.)
- `is_public` boolean default false
- `price` decimal nullable (futuro, oculto)
- `is_for_sale` boolean default false (futuro, oculto)
- `created_at`, `updated_at` timestamps

**RLS:**
- SELECT: publicos para todos OR propios del owner
- INSERT/UPDATE/DELETE: solo owner

**Tabla `prompt_files`:**
- `id` UUID PK
- `prompt_id` UUID FK a prompts ON DELETE CASCADE
- `file_url` text NOT NULL
- `file_name` text NOT NULL
- `file_size` integer NOT NULL
- `file_type` text NOT NULL
- `created_at` timestamp

**RLS:**
- SELECT: si el prompt es publico o es el owner
- INSERT: si el prompt es del owner
- DELETE: si el prompt es del owner

**Storage bucket:** `prompt-attachments` (publico, RLS para subida solo por usuarios autenticados en su propia carpeta)

### 2. Ruta y Navegacion

- Nueva ruta `/prompts` dentro del `DashboardLayout`
- Nuevo item en el Sidebar con icono `BookOpen` entre "My Ideas" y "My Connections"
- Traducciones en `common.json` (en/es/fr/pt): `navigation.prompts: "Prompt Vault"`

### 3. UI - Pagina /prompts

**Layout con Tabs:**
- **Tab "Explorar"**: Grid de prompts publicos de toda la comunidad
  - Barra de busqueda + filtros por tag y herramienta
  - Cards con: titulo, tags, herramienta, avatar del autor, boton "Copy"
  - Click abre modal de detalle con contenido completo, boton "Copiar al portapapeles" y lista de archivos adjuntos con descarga
- **Tab "Mis Prompts"**: Lista/grid de prompts propios
  - Badge de visibilidad (privado/publico)
  - Acciones: Editar, Eliminar, Toggle visibilidad
  - Boton "Nuevo Prompt" abre modal de creacion/edicion

### 4. Modal Crear/Editar Prompt

- **Title**: Input texto
- **Tool Used**: Select con opciones (Lovable, Cursor, Windsurf, ChatGPT, Claude, Bolt, v0, Replit, Other)
- **Content/Description**: MarkdownEditor (reutilizando componente existente)
- **Tags**: Input con Enter para agregar tags como chips, X para eliminar
- **Attachments**: Zona drag & drop, validacion max 10MB por archivo, multiples archivos, lista con boton X para remover, progress de subida
- **Privacy Toggle**: Switch "Hacer Publico"

### 5. Vista de Detalle (Modal)

- Contenido renderizado como Markdown (reutilizando `parseMarkdown`)
- Boton "Copiar al portapapeles" para el contenido
- Lista de archivos adjuntos con iconos de descarga
- Info del autor (avatar, username) con link al perfil

### 6. Archivos a crear/modificar

| Archivo | Accion |
|---------|--------|
| Nueva migration SQL | Tablas `prompts`, `prompt_files`, bucket `prompt-attachments` |
| `src/pages/Prompts.tsx` | Pagina principal con tabs |
| `src/hooks/usePrompts.ts` | Hook para CRUD de prompts |
| `src/components/prompts/PromptCard.tsx` | Card para grid |
| `src/components/prompts/PromptDetailModal.tsx` | Modal de detalle |
| `src/components/prompts/PromptFormModal.tsx` | Modal crear/editar |
| `src/components/prompts/TagInput.tsx` | Componente de tags con chips |
| `src/components/prompts/FileUploader.tsx` | Zona de upload con drag & drop |
| `src/App.tsx` | Agregar ruta `/prompts` |
| `src/components/layout/Sidebar.tsx` | Agregar link en navegacion |
| `src/integrations/supabase/types.ts` | Tipos de las nuevas tablas |
| `src/i18n/en/prompts.json` | Traducciones ingles |
| `src/i18n/es/prompts.json` | Traducciones espanol |
| `src/i18n/en/common.json` | Key de navegacion |
| `src/i18n/es/common.json` | Key de navegacion |

### 7. Patrones a seguir

- Hook con `useQuery`/`useMutation` de TanStack (como `useToolsStack`, `useApps`)
- Supabase client directo (como en `IdeasTab`)
- Layout master-detail similar a Ideas pero con tabs
- Componentes UI existentes: Dialog, Tabs, Input, Button, Badge, Switch, Avatar, ScrollArea
- Markdown: reutilizar `parseMarkdown` de `src/lib/markdown.ts` y `MarkdownEditor`
- Storage upload pattern igual que `feedback-attachments`

### 8. Nota sobre build errors existentes

Los errores de build actuales (en `types.ts`, `useApps`, `useDashboardStats`, etc.) son preexistentes y no estan relacionados con esta feature. Se corregiran como parte de la actualizacion de `types.ts` al agregar las nuevas tablas.

