

## Plan: Crear Pagina Publica "Beta Squads" y Actualizar Navegacion

### Resumen

Crearemos una nueva pagina publica `/beta-squads` que funcione como directorio exclusivo para apps con programas beta activos. Incluiremos un nuevo enlace en la navegacion principal con un badge "New" para destacar la seccion.

---

## 1. Actualizar Navegacion (Header)

### 1.1 Modificar `src/components/AuthenticatedHeader.tsx`

Agregar nuevo enlace en el array `navLinks`:

```typescript
const navLinks = [
  { path: '/me', label: t.navigation.myProfile, icon: User, premium: false },
  { path: '/startups', label: t.navigation.startups, icon: Rocket, premium: false },
  { path: '/beta-squads', label: t.navigation.betaSquads, icon: FlaskConical, premium: false, isNew: true },
  { path: '/tools', label: t.navigation.tools, icon: Wrench, premium: false },
  { path: '/hablemos', label: t.navigation.feedback, icon: MessageCircle, premium: false },
  // ...buildlog condicional
];
```

Renderizado del badge "New":
- Agregar propiedad `isNew?: boolean` al tipo de navLinks
- En desktop: mostrar pequeño badge junto al texto
- En mobile: mostrar badge junto al enlace

### 1.2 Actualizar Traducciones de Navegacion

**`src/i18n/es/common.json`**:
```json
{
  "navigation": {
    "betaSquads": "Betas"
  }
}
```

**`src/i18n/en/common.json`**:
```json
{
  "navigation": {
    "betaSquads": "Betas"
  }
}
```

---

## 2. Nueva Pagina `/beta-squads`

### 2.1 Crear `src/pages/BetaSquads.tsx`

**Estructura de la pagina**:

```
+------------------------------------------+
|              Hero Section                |
|  "Unete a un Beta Squad" + subtitulo     |
+------------------------------------------+
|                                          |
|    [BetaCard] [BetaCard] [BetaCard]      |
|    [BetaCard] [BetaCard] [BetaCard]      |
|                                          |
|    --- o Estado Vacio si no hay ---      |
|                                          |
+------------------------------------------+
```

**Logica de datos**:
- Query a la tabla `apps` donde `beta_active = true` e `is_visible = true`
- Incluir join con `profiles` para obtener info del owner
- Incluir conteo de testers actuales via `beta_testers`
- Ordenar por: apps con mas cupos disponibles primero (urgencia)

### 2.2 Agregar Ruta en `src/App.tsx`

```tsx
<Route element={<AuthenticatedLayout />}>
  <Route path="/beta-squads" element={<BetaSquads />} />
  // ... otras rutas
</Route>
```

---

## 3. Nuevo Hook `useBetaSquadsPublic`

### 3.1 Crear `src/hooks/useBetaSquadsPublic.ts`

Query optimizada para el directorio publico:

```typescript
interface BetaSquadApp {
  id: string;
  name: string;
  logo_url: string | null;
  tagline: string | null;
  beta_instructions: string | null;
  beta_limit: number;
  testers_count: number;
  owner: {
    username: string | null;
    name: string | null;
    avatar_url: string | null;
  };
}

export function useBetaSquadsPublic() {
  return useQuery({
    queryKey: ['beta-squads-public'],
    queryFn: async () => {
      // 1. Get apps with beta_active = true
      const { data: apps } = await supabase
        .from('apps')
        .select(`
          id, name, logo_url, tagline, beta_instructions, 
          beta_limit, created_at,
          profiles:user_id(username, name, avatar_url)
        `)
        .eq('beta_active', true)
        .eq('is_visible', true);

      // 2. Get testers count per app
      const { data: testerCounts } = await supabase
        .from('beta_testers')
        .select('app_id')
        .eq('status', 'accepted');

      // 3. Merge and calculate spots remaining
      // 4. Sort by spots available (ascending = urgency)
    }
  });
}
```

---

## 4. Nuevo Componente `BetaSquadPublicCard`

### 4.1 Crear `src/components/beta/BetaSquadPublicCard.tsx`

Diseño enfocado en la oportunidad de testear (diferente a ShowcaseCard):

```
+---------------------------------------+
|  [Logo 48x48]  App Name               |
|                @username              |
+---------------------------------------+
|                                       |
|  "Buscamos gente para probar el..."   |
|  (beta_instructions truncadas)        |
|                                       |
+---------------------------------------+
|  [======----]  4/10 disponibles       |
|                                       |
|  [    Unirme al Squad    ]            |
+---------------------------------------+
```

**Caracteristicas clave**:
- Progress bar con cupos (como en BetaSquadCard actual)
- Color naranja/rojo si quedan menos de 3 cupos
- Instrucciones truncadas (2-3 lineas max)
- Boton CTA que lleva a `/app/:appId`

### 4.2 Crear Skeleton `BetaSquadCardSkeleton.tsx`

Skeleton para estado de carga, similar a ShowcaseCardSkeleton.

---

## 5. Traducciones Nuevas

### 5.1 Actualizar `src/i18n/es/beta.json`

Agregar traducciones para la pagina publica:

```json
{
  "directoryTitle": "Unete a un Beta Squad",
  "directorySubtitle": "Prueba productos antes que nadie, envia feedback directo a los fundadores y gana insignias exclusivas.",
  "emptyTitle": "No hay betas activas",
  "emptyMessage": "¿Tienes una App? Se el primero en abrir tu Beta Squad.",
  "emptyButton": "Ir a Mis Apps",
  "spotsLow": "Ultimos cupos",
  "joinSquad": "Unirme al Squad",
  "missionPreview": "Mision"
}
```

### 5.2 Actualizar `src/i18n/en/beta.json`

```json
{
  "directoryTitle": "Join a Beta Squad",
  "directorySubtitle": "Test products before anyone else, send feedback directly to founders and earn exclusive badges.",
  "emptyTitle": "No active betas",
  "emptyMessage": "Got an App? Be the first to open your Beta Squad.",
  "emptyButton": "Go to My Apps",
  "spotsLow": "Last spots",
  "joinSquad": "Join the Squad",
  "missionPreview": "Mission"
}
```

---

## 6. Estado Vacio (Empty State)

Cuando no hay betas activas:

```
+------------------------------------------+
|                                          |
|     [FlaskConical Icon - grande]         |
|                                          |
|     "No hay betas activas"               |
|                                          |
|  "¿Tienes una App? Se el primero en..."  |
|                                          |
|     [  Ir a Mis Apps  ]                  |
|                                          |
+------------------------------------------+
```

- Icono FlaskConical en color muted (64x64)
- Boton que navega a `/me/apps`

---

## 7. Resumen de Archivos

### Archivos a Crear

| Archivo | Descripcion |
|---------|-------------|
| `src/pages/BetaSquads.tsx` | Pagina principal del directorio |
| `src/hooks/useBetaSquadsPublic.ts` | Hook para fetch de apps con beta activo |
| `src/components/beta/BetaSquadPublicCard.tsx` | Card para el directorio |
| `src/components/beta/BetaSquadCardSkeleton.tsx` | Skeleton de carga |

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/App.tsx` | Agregar ruta `/beta-squads` |
| `src/components/AuthenticatedHeader.tsx` | Agregar enlace + badge "New" |
| `src/i18n/es/common.json` | Agregar `navigation.betaSquads` |
| `src/i18n/en/common.json` | Agregar `navigation.betaSquads` |
| `src/i18n/es/beta.json` | Agregar traducciones de directorio |
| `src/i18n/en/beta.json` | Agregar traducciones de directorio |

---

## 8. Detalles Tecnicos

### 8.1 Query Optimizada

```typescript
// Obtener apps con beta activo + conteo de testers
const { data } = await supabase
  .from('apps')
  .select(`
    id, name, logo_url, tagline, beta_instructions, beta_limit,
    profiles:user_id (username, name, avatar_url)
  `)
  .eq('beta_active', true)
  .eq('is_visible', true)
  .order('created_at', { ascending: false });

// Contar testers por app en query separada
const appIds = data.map(a => a.id);
const { data: testerData } = await supabase
  .from('beta_testers')
  .select('app_id')
  .eq('status', 'accepted')
  .in('app_id', appIds);

// Calcular conteos y ordenar por urgencia
const countsByApp = testerData.reduce((acc, t) => {
  acc[t.app_id] = (acc[t.app_id] || 0) + 1;
  return acc;
}, {});

const appsWithCounts = data.map(app => ({
  ...app,
  testers_count: countsByApp[app.id] || 0,
  spots_remaining: app.beta_limit - (countsByApp[app.id] || 0)
}));

// Ordenar: menos cupos disponibles primero (urgencia)
appsWithCounts.sort((a, b) => a.spots_remaining - b.spots_remaining);
```

### 8.2 Badge "New" en Header

```tsx
// En AuthenticatedHeader.tsx
{link.isNew && (
  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full">
    New
  </span>
)}
```

### 8.3 Indicador de Urgencia en Card

```tsx
const isUrgent = spotsRemaining <= 3 && spotsRemaining > 0;

<span className={cn(
  "text-sm font-medium",
  isUrgent ? "text-orange-500" : "text-muted-foreground"
)}>
  {spotsRemaining}/{betaLimit} disponibles
</span>
```

---

## 9. Orden de Implementacion

1. Traducciones (common.json + beta.json en ES/EN)
2. Hook `useBetaSquadsPublic`
3. Componente `BetaSquadPublicCard` + Skeleton
4. Pagina `BetaSquads.tsx`
5. Ruta en `App.tsx`
6. Navegacion en `AuthenticatedHeader.tsx` con badge "New"
7. Pruebas end-to-end

