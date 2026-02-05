
## Sistema de Estadísticas de Perfiles

### Objetivo

Implementar un sistema de analytics para perfiles que rastree:
1. **Visitas al perfil** (Profile Views)
2. **Clicks en apps** (App Clicks) 
3. **Likes en apps** (App Likes - corazones)

### Diseño de Base de Datos

Se crearán 3 tablas optimizadas para alto volumen de registros:

| Tabla | Propósito | Campos Clave |
|-------|-----------|--------------|
| `profile_views` | Registrar visitas a perfiles | profile_id, visitor_id (nullable), device_fingerprint, timestamp |
| `app_clicks` | Registrar clicks en apps | app_id, profile_id, visitor_id (nullable), device_fingerprint, timestamp |
| `app_likes` | Likes de usuarios logueados | app_id, user_id, timestamp |

```text
profile_views                          app_clicks                           app_likes
┌──────────────────────┐              ┌──────────────────────┐              ┌──────────────────────┐
│ id (uuid PK)         │              │ id (uuid PK)         │              │ id (uuid PK)         │
│ profile_id (FK)      │              │ app_id (FK)          │              │ app_id (FK)          │
│ visitor_id (FK null) │              │ profile_id (FK)      │              │ user_id (FK)         │
│ device_fingerprint   │              │ visitor_id (FK null) │              │ created_at           │
│ device_type          │              │ device_fingerprint   │              └──────────────────────┘
│ referrer             │              │ created_at           │
│ created_at           │              └──────────────────────┘
└──────────────────────┘
```

### Identificación de Usuarios Anónimos

Para visitantes no logueados, se generará un **fingerprint** usando datos del dispositivo:
- User Agent + Timezone + Language + Screen Size
- Se almacenará como hash para anonimidad

### Arquitectura de Tracking

```text
Usuario visita /@username
        │
        ▼
┌───────────────────────────────┐
│  PublicProfileCard.tsx       │
│  (al montar el componente)   │
└───────────────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│  Edge Function:              │
│  track-profile-view          │
│  - Recibe profile_id         │
│  - Token JWT (si logueado)   │
│  - Device info               │
└───────────────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│  Inserta en profile_views    │
│  con visitor_id o fingerprint│
└───────────────────────────────┘
```

### Componentes del Sistema

| Componente | Función |
|------------|---------|
| `track-profile-view` | Edge Function para registrar visitas |
| `track-app-click` | Edge Function para registrar clicks |
| `toggle-app-like` | Edge Function para agregar/quitar likes |
| `get-profile-stats` | Edge Function para obtener estadísticas del dueño |
| `useProfileStats` | Hook React para consumir stats |
| `ProfileStatsCard` | Componente UI para mostrar stats |

### Visualización en Perfil Propio

Solo visible cuando el usuario está logueado viendo su propio perfil:

```text
┌─────────────────────────────────────────┐
│  ┌─────────────────┐ ┌───────────────┐  │
│  │ 👁️ 442          │ │ 🖱️ 78,941     │  │
│  │ Profile viewers │ │ Apps clicks   │  │
│  └─────────────────┘ └───────────────┘  │
└─────────────────────────────────────────┘
```

Ubicación: Al lado derecho del perfil (zona marcada en la imagen de referencia).

### Likes en Apps

Para cada app visible, usuarios logueados pueden dar "like" (corazón):

```text
┌─────────────────────────────────────────┐
│  Vibecoders  ● Building...         🔗   │
│  The Official Home for Vibe Coders.     │
│  ♥ 12  │  🛠️ Lovable  📦 Supabase      │
└─────────────────────────────────────────┘
```

- El corazón es clickeable para usuarios logueados
- El contador solo es visible para el dueño del perfil

### Políticas RLS

| Tabla | SELECT | INSERT | UPDATE/DELETE |
|-------|--------|--------|---------------|
| `profile_views` | Solo dueño del perfil | Público (via Edge Function) | No permitido |
| `app_clicks` | Solo dueño del perfil | Público (via Edge Function) | No permitido |
| `app_likes` | Público (para mostrar count) | Autenticado | Solo quien dio like |

### Archivos a Crear/Modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/migrations/` | Crear tablas de estadísticas |
| `supabase/functions/track-profile-view/` | Nueva Edge Function |
| `supabase/functions/track-app-click/` | Nueva Edge Function |
| `supabase/functions/toggle-app-like/` | Nueva Edge Function |
| `supabase/functions/get-profile-stats/` | Nueva Edge Function |
| `src/lib/deviceFingerprint.ts` | Generar fingerprint del dispositivo |
| `src/hooks/useProfileStats.ts` | Hook para obtener stats |
| `src/hooks/useAppLike.ts` | Hook para manejar likes |
| `src/components/profile/ProfileStatsCard.tsx` | UI de estadísticas |
| `src/components/PublicProfileCard.tsx` | Integrar tracking y stats |

### Detalles Técnicos

**Generación de Fingerprint**:
```text
hash(user_agent + timezone + language + screen_resolution)
```

**Prevención de spam**:
- Un mismo fingerprint no puede registrar más de 1 vista por perfil cada 24 horas
- Los clicks se registran sin límite (son acciones intencionales)

**Formato de números grandes**:
- 1,234 → "1,234"
- 78,941 → "78,941"
- 1,234,567 → "1.2M"

### Flujo de Implementación

1. Crear tablas en Supabase con índices optimizados
2. Implementar Edge Functions de tracking
3. Crear funciones de fingerprinting en cliente
4. Implementar hooks React
5. Integrar tracking en PublicProfileCard
6. Crear componente de visualización de stats
7. Agregar sistema de likes en apps
