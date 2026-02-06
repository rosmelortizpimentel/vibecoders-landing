

## Análisis Sincero del Estado Actual

### Problemas Identificados

1. **Diseño Grid No Transmite Comunidad**: El diseño actual de 3 columnas se siente como un "catálogo de productos", no como un espacio donde personas reales están buscando colaboradores.

2. **Falta Contexto Humano**: No se ve quién publicó, cuándo lo hizo, ni la urgencia real. Las beta_instructions están truncadas y pierden contexto.

3. **No Hay Prueba Social**: No se pueden ver los testers ya inscritos. Sin saber quién más se unió, hay menos motivación para participar.

4. **Las Instrucciones No Soportan Formato**: El campo `beta_instructions` es texto plano, cuando los founders necesitan negritas, listas, etc. para ser claros.

5. **Carga de Todo de Golpe**: Sin paginación, si crecen las betas, la página se vuelve lenta.

---

## Plan: Rediseño Feed LinkedIn-Style para Beta Squads

### Concepto Visual Propuesto

```
+--------------------------------------------------+
|                 HERO (mismo actual)               |
+--------------------------------------------------+

    +----------------------------------------+
    |  [Avatar Autor] María García           |
    |                 @maria · hace 2 horas  |
    +----------------------------------------+
    |                                        |
    |  "Estamos buscando 5 personas para     |
    |  probar la nueva versión del checkout  |
    |  antes del lanzamiento..."             |
    |                                        |
    |  +----------------------------------+  |
    |  |  [Logo]  Nombre de la App       |  |
    |  |          tagline de la app      |  |
    |  |                                 |  |
    |  |  **Instrucciones (formateadas):**|  |
    |  |  - Probar flujo de pago         |  |
    |  |  - Verificar en móvil           |  |
    |  |  - Reportar bugs en el form     |  |
    |  |                                 |  |
    |  +----------------------------------+  |
    |                                        |
    |  [===-----] 2/5 inscritos (clickeable)|
    |                                        |
    |  [ Unirme al Squad ]                  |
    +----------------------------------------+

    +----------------------------------------+
    |  ... siguiente post ...                |
    +----------------------------------------+
```

---

## Cambios Técnicos Detallados

### 1. Actualizar Hook `useBetaSquadsPublic`

**Archivo**: `src/hooks/useBetaSquadsPublic.ts`

Cambios:
- Usar `useInfiniteQuery` en lugar de `useQuery` para scroll infinito
- Añadir paginación (10 items por página)
- Ordenar por `updated_at DESC` (más reciente primero)
- Traer `user_id` del owner para el popup de testers
- Traer lista de testers (id, username, name, avatar_url) por cada app

```typescript
// Nuevo interface con más datos
export interface BetaSquadApp {
  id: string;
  name: string | null;
  logo_url: string | null;
  tagline: string | null;
  beta_instructions: string | null;
  beta_limit: number;
  testers_count: number;
  spots_remaining: number;
  updated_at: string; // Para mostrar fecha
  owner: {
    id: string;        // Nuevo: para follow
    username: string | null;
    name: string | null;
    avatar_url: string | null;
  };
  testers: Array<{     // Nuevo: lista de testers
    id: string;
    username: string | null;
    name: string | null;
    avatar_url: string | null;
  }>;
}
```

### 2. Mejorar Markdown Parser

**Archivo**: `src/lib/markdown.ts`

Añadir soporte para:
- Listas numeradas (1. item, 2. item)
- Subrayado (~~texto~~ → `<u>`)

```typescript
// Añadir a parseMarkdown:

// Underline: ~~text~~
html = html.replace(/~~(.+?)~~/g, '<u>$1</u>');

// Numbered lists: 1. item
const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
if (numberedMatch) {
  // Similar a unordered pero con <ol>
}
```

### 3. Nuevo Componente `BetaSquadFeedCard`

**Archivo**: `src/components/beta/BetaSquadFeedCard.tsx`

Estructura:
- Header tipo post (avatar autor, nombre, @username, fecha relativa)
- Texto introductorio (descripción corta)
- Card interna con logo de app + instrucciones formateadas
- Indicador de cupos clickeable
- Botón CTA

```typescript
interface BetaSquadFeedCardProps {
  app: BetaSquadApp;
  onShowTesters: (testers: Tester[]) => void;
}
```

### 4. Nuevo Dialog `TesterListDialog`

**Archivo**: `src/components/beta/TesterListDialog.tsx`

Reutilizar lógica de `FollowerCard`:
- Mostrar lista de testers inscritos
- Cada tester tiene botón follow/unfollow
- Click en el tester navega a su perfil

### 5. Actualizar Página `BetaSquads`

**Archivo**: `src/pages/BetaSquads.tsx`

Cambios:
- Layout single-column centrado (`max-w-2xl mx-auto`)
- Implementar infinite scroll con `IntersectionObserver`
- Mostrar "Load more" trigger al final
- Estado loading para nuevas páginas

### 6. Actualizar Traducciones

**Archivos**: `src/i18n/es/beta.json`, `src/i18n/en/beta.json`

Nuevas claves:
```json
{
  "lookingFor": "Buscando {count} testers",
  "enrolled": "{current} inscritos",
  "enrolledClickable": "{current}/{limit} inscritos",
  "viewTesters": "Ver testers",
  "timeAgo": "hace {time}",
  "justNow": "ahora mismo"
}
```

---

## Resumen de Archivos

### Archivos a Modificar
| Archivo | Cambios |
|---------|---------|
| `src/hooks/useBetaSquadsPublic.ts` | Cambiar a `useInfiniteQuery`, añadir testers array, ordenar por `updated_at` |
| `src/lib/markdown.ts` | Añadir listas numeradas y subrayado |
| `src/pages/BetaSquads.tsx` | Layout single-column, infinite scroll |
| `src/i18n/es/beta.json` | Nuevas traducciones |
| `src/i18n/en/beta.json` | Nuevas traducciones |

### Archivos a Crear
| Archivo | Descripción |
|---------|-------------|
| `src/components/beta/BetaSquadFeedCard.tsx` | Card estilo post con autor y app embebida |
| `src/components/beta/TesterListDialog.tsx` | Dialog para ver testers con opción follow |

---

## Detalles Técnicos

### Infinite Scroll con `useInfiniteQuery`

```typescript
export function useBetaSquadsPublic() {
  return useInfiniteQuery({
    queryKey: ['beta-squads-public'],
    queryFn: async ({ pageParam = 0 }) => {
      const pageSize = 10;
      const from = pageParam * pageSize;
      const to = from + pageSize - 1;
      
      const { data: apps } = await supabase
        .from('apps')
        .select(`...`)
        .eq('beta_active', true)
        .eq('is_visible', true)
        .order('updated_at', { ascending: false })
        .range(from, to);
      
      // ... procesar testers
      
      return {
        apps: processedApps,
        nextPage: apps.length === pageSize ? pageParam + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}
```

### Intersection Observer para Trigger

```typescript
// En BetaSquads.tsx
const loadMoreRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    { threshold: 0.1 }
  );
  
  if (loadMoreRef.current) {
    observer.observe(loadMoreRef.current);
  }
  
  return () => observer.disconnect();
}, [hasNextPage, isFetchingNextPage]);
```

### Fecha Relativa

```typescript
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

const timeAgo = formatDistanceToNow(new Date(app.updated_at), { 
  addSuffix: true,
  locale: language === 'es' ? es : enUS 
});
```

### Query para Testers por App

```typescript
// Obtener testers aceptados con perfil
const { data: testersData } = await supabase
  .from('beta_testers')
  .select('app_id, user_id, profiles:user_id(id, username, name, avatar_url)')
  .eq('status', 'accepted')
  .in('app_id', appIds);
```

---

## Orden de Implementación

1. **Markdown**: Extender parser con listas numeradas y subrayado
2. **Hook**: Refactorizar a infinite query + traer testers
3. **TesterListDialog**: Dialog reutilizando FollowerCard
4. **BetaSquadFeedCard**: Componente principal tipo post
5. **BetaSquads Page**: Layout single-column + infinite scroll
6. **Traducciones**: Nuevas claves ES/EN
7. **Testing**: Verificar scroll, formato, popup de testers

---

## Notas sobre Lógica de Cupos

Aclaración importante que mencionaste:
- `beta_limit = 5` significa "busco 5 testers"
- Si el modo es "requiere aprobación", puede haber más de 5 registrados pero solo contabilizamos los `status = 'accepted'`
- El owner puede aceptar hasta 5, pero no es restrictivo (podría aceptar más si quiere)
- En el UI mostramos: `2/5 inscritos` donde 2 = accepted, 5 = limit

