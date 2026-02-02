
# Plan: Redisenar Pagina Publica de Perfil

## Resumen
Transformar la pagina publica de perfil (/@username) para que luzca identica a la vista previa del dashboard, con ajustes responsivos para desktop y simplificacion del header en movil.

## Estado Actual vs Objetivo

**Actual**: Tarjeta "Founder Pass" centrada con gradiente azul, informacion muy basica
**Objetivo**: Diseño estilo perfil de red social con banner, avatar, nombre, tagline, redes sociales y apps - similar a la imagen de referencia (ProductHunt/X style)

## Arquitectura de Cambios

### 1. Ampliar Edge Function `get-public-profile`

Actualmente solo devuelve:
- username, avatar_url, first_name, member_number, is_pioneer

Debe devolver adicionalmente:
- name (nombre completo)
- tagline
- location
- website
- banner_url
- accent_color (para borde del avatar)
- font_family
- show_pioneer_badge
- Redes sociales: lovable, twitter, github, linkedin, instagram, youtube, tiktok, email_public
- Apps visibles del usuario (con sus stacks y statuses)

### 2. Actualizar Interface `PublicProfile`

Expandir el tipo en `usePublicProfile.ts` para incluir todos los nuevos campos.

### 3. Crear Nuevo Componente `PublicProfileView`

Basado en `ProfilePreview.tsx` pero adaptado para datos publicos:

```
+--------------------------------------------------+
| [Logo Vibecoders]                                | <- En movil: solo logo, enlace a /
+--------------------------------------------------+
| [Banner Image o Gradiente Default]               |
|   [Avatar]                                        |
+--------------------------------------------------+
| Nombre [Pioneer Badge]                            |
| Tagline (italic)                                  |
| [Iconos redes sociales]                           |
| Ubicacion | Website                               |
+--------------------------------------------------+
| APPS                                              |
| [App Card 1]                                      |
| [App Card 2]                                      |
| [App Card 3]                                      |
+--------------------------------------------------+
| vibecoders.la/@username                           |
+--------------------------------------------------+
```

### 4. Ajustes Desktop vs Movil

**Desktop (>= 768px)**:
- Ancho maximo: max-w-2xl o max-w-3xl (mas amplio que preview)
- Banner mas alto: h-40 o h-48
- Avatar mas grande: h-28 w-28
- Apps en grid de 2 o 3 columnas (como imagen referencia)

**Movil (< 768px)**:
- Header: Solo logo vibecoders (sin hamburguesa), clickeable lleva a /
- Ancho completo con padding
- Apps en columna unica
- Banner h-24
- Avatar h-20 w-20

### 5. Componente AppCard para Perfil Publico

Reutilizar/adaptar `PreviewAppCard.tsx` para el contexto publico:
- Necesita obtener statuses y stacks desde la Edge Function o como datos adicionales

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/get-public-profile/index.ts` | Expandir query para incluir todos los campos del perfil + apps |
| `src/hooks/usePublicProfile.ts` | Actualizar interface PublicProfile con nuevos campos |
| `src/components/PublicProfileCard.tsx` | Reemplazar completamente por nuevo diseño tipo ProfilePreview |
| `src/pages/PublicProfile.tsx` | Actualizar skeleton loader para coincidir con nuevo diseño |

## Seccion Tecnica

### Edge Function - Datos adicionales

```typescript
// Query expandida
const { data: profile } = await supabaseAdmin
  .from('profiles')
  .select(`
    id, username, member_number, is_pioneer, show_pioneer_badge,
    name, tagline, location, website, banner_url, avatar_url,
    accent_color, font_family,
    lovable, twitter, github, linkedin, instagram, youtube, tiktok, email_public
  `)
  .eq('username', username.toLowerCase())
  .maybeSingle()

// Query de apps visibles
const { data: apps } = await supabaseAdmin
  .from('apps')
  .select(`
    id, url, name, tagline, logo_url, status_id, is_visible, display_order,
    app_stacks(stack_id)
  `)
  .eq('user_id', profile.id)
  .eq('is_visible', true)
  .order('display_order', { ascending: true })
  .limit(6)

// Query de statuses y stacks (para resolver IDs)
const { data: statuses } = await supabaseAdmin.from('app_statuses').select('*')
const { data: stacks } = await supabaseAdmin.from('tech_stacks').select('*')
```

### Interface PublicProfile Expandida

```typescript
export interface PublicProfile {
  username: string;
  avatar_url: string | null;
  banner_url: string | null;
  name: string | null;
  tagline: string | null;
  location: string | null;
  website: string | null;
  accent_color: string | null;
  font_family: string | null;
  member_number: number;
  is_pioneer: boolean;
  show_pioneer_badge: boolean;
  // Sociales
  lovable: string | null;
  twitter: string | null;
  github: string | null;
  linkedin: string | null;
  instagram: string | null;
  youtube: string | null;
  tiktok: string | null;
  email_public: string | null;
  // Apps con datos resueltos
  apps: Array<{
    id: string;
    url: string;
    name: string | null;
    tagline: string | null;
    logo_url: string | null;
    status: { name: string; slug: string } | null;
    stacks: Array<{ id: string; name: string; logo_url: string }>;
  }>;
}
```

### Componente Header Responsivo

```tsx
// Header simplificado para movil
<header className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-100">
  <Link to="/">
    <img 
      src={vibecodersLogo} 
      alt="Vibecoders" 
      className="h-10 w-10 rounded-full border-2 border-gray-200 hover:border-blue-500 transition-colors"
    />
  </Link>
  {/* Menu hamburguesa solo visible en desktop si se necesita navegacion */}
</header>
```

## Consideraciones de Seguridad

- La Edge Function sigue usando service_role, exponiendo SOLO datos marcados como publicos
- El email del usuario NUNCA se expone (email_public es diferente - es opcional y controlado por el usuario)
- Las apps solo se muestran si is_visible = true
