

## Mejoras al Sistema de Estadísticas de Perfiles

### Cambios Solicitados

1. **Quitar botón "Quiero aparecer aquí"** de `/p/startups`
2. **No contar visitas/clicks propios** - Excluir cuando el usuario visita su propio perfil o hace click en sus propias apps
3. **Mover estadísticas de visitas** al header (junto a seguidores, estilo minimalista)
4. **Mostrar likes y clicks en cada app** de manera elegante estilo LinkedIn

---

### Diseño Visual Propuesto

**Header del perfil (solo para el dueño):**
```text
15 siguiendo  2 seguidores  ·  @rosmelortiz  ·  👁 442 visitas
```

**Tarjeta de App con métricas (solo dueño ve números):**
```text
┌─────────────────────────────────────────────────────────┐
│  [Logo]  Vibecoders  ● Building...              [🔗]    │
│          The Official Home for Vibe Coders.             │
│  ─────────────────────────────────────────────────────  │
│  🛠️ Lovable  📦 Supabase       ♥ 12  ·  🖱️ 45 clicks   │
└─────────────────────────────────────────────────────────┘
```

---

### Cambios Técnicos

#### 1. Página Projects.tsx
Eliminar el botón "Quiero aparecer aquí" de la sección hero.

#### 2. Edge Functions - Excluir visitas propias

**track-profile-view/index.ts**
- Verificar si `visitor_id === profile_id`
- Si son iguales, retornar sin insertar registro

**track-app-click/index.ts**
- Obtener el `user_id` de la app
- Verificar si el visitante es el dueño de la app
- Si son iguales, retornar sin insertar registro

#### 3. Edge Function get-profile-stats
- Agregar estadísticas de clicks por app individual
- Retornar `app_clicks_by_app: Record<string, number>` además del total

#### 4. Componente PublicProfileCard.tsx

**Mover stats al header:**
- Eliminar `ProfileStatsCard` de la posición actual
- Agregar las visitas inline junto a los seguidores (solo visible para el dueño)
- Formato: `· 👁 {visitas} visitas` después del username

**Actualizar PublicAppCard:**
- Recibir `ownerClickCount` además de `ownerLikeCount`
- Mostrar ambas métricas en el footer de la tarjeta (solo para el dueño)
- Estilo minimalista: `♥ 12 · 🖱️ 45` en gris suave

#### 5. Componente AppLikeButton.tsx
- Mostrar siempre el contador si `isOwner`
- Agregar soporte para mostrar clicks junto a likes

#### 6. Hook useProfileStats.ts
- Agregar `appClicksByApp: Record<string, number>` al estado
- Parsear la nueva respuesta del edge function

---

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Projects.tsx` | Eliminar botón CTA |
| `supabase/functions/track-profile-view/index.ts` | Excluir visitas propias |
| `supabase/functions/track-app-click/index.ts` | Excluir clicks propios |
| `supabase/functions/get-profile-stats/index.ts` | Agregar clicks por app |
| `src/hooks/useProfileStats.ts` | Agregar clicks por app al estado |
| `src/components/PublicProfileCard.tsx` | Mover stats al header, mostrar clicks por app |
| `src/components/profile/ProfileStatsCard.tsx` | Eliminar (ya no se usa) |
| `src/components/profile/AppLikeButton.tsx` | Refactorizar para incluir clicks |

---

### Flujo de Implementación

1. Modificar Edge Functions para excluir visitas/clicks propios
2. Actualizar `get-profile-stats` para retornar clicks por app
3. Eliminar botón de Projects.tsx
4. Actualizar hook useProfileStats
5. Refactorizar PublicProfileCard con nuevo diseño de stats
6. Actualizar AppLikeButton para mostrar métricas de forma elegante
