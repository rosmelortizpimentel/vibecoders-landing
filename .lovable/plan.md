
## Resumen

Corregir dos problemas en el sistema de perfiles públicos:
1. **Header duplicado**: El componente `PublicProfileHeader` se renderiza dos veces
2. **Estado incorrecto del botón Seguir**: El botón muestra "Seguir" incluso para usuarios que ya se están siguiendo

---

## Problema 1: Header Duplicado

### Causa
El header se renderiza en dos lugares diferentes:
- `ProfileNavigator.tsx` (línea 61): `<PublicProfileHeader profileUsername={profile.username} />`
- `PublicProfileCard.tsx` (línea 233): `<PublicProfileHeader profileUsername={profile.username} />`

### Solución
Eliminar el `PublicProfileHeader` de `PublicProfileCard.tsx` ya que `ProfileNavigator` es el componente padre que debe manejar el layout general (header + contenido).

### Archivo a modificar
`src/components/PublicProfileCard.tsx`
- Eliminar la importación de `PublicProfileHeader` (línea 6)
- Eliminar la línea que renderiza el header (línea 233)

---

## Problema 2: Estado Incorrecto del Botón "Seguir"

### Causa
El hook `useFollowList` tiene una condición de carrera (race condition). La consulta para verificar `isFollowing` depende del `user` del hook `useAuth`, pero el `user` puede no estar disponible inmediatamente cuando el componente se monta.

Cuando `user` es `null` (aún cargando), la línea 78 del hook no entra al bloque `if (user)` y por lo tanto `currentUserFollowing` queda como un array vacío, resultando en `isFollowing: false` para todos los perfiles.

### Solución
1. Agregar `loading` del `useAuth` como dependencia
2. Esperar a que `user` esté disponible antes de marcar `loading: false`
3. Refetch automático cuando `user` cambie de `null` a un valor válido

### Archivo a modificar
`src/hooks/useFollowList.ts`
- Importar el estado `loading` desde `useAuth`
- No completar la carga hasta que `user` esté disponible (si el usuario está autenticado)
- Asegurar que el `useEffect` se re-ejecute cuando el usuario cambie

---

## Cambios Detallados

### 1. src/components/PublicProfileCard.tsx

```diff
- import { PublicProfileHeader } from '@/components/PublicProfileHeader';

  return (
    <div 
      className="w-full min-h-screen bg-white"
      style={{ fontFamily }}
    >
-     {/* Header - Shows user menu if logged in */}
-     <PublicProfileHeader profileUsername={profile.username} />

      {/* Content container - centered on desktop */}
      <div className="w-full max-w-4xl mx-auto">
```

### 2. src/hooks/useFollowList.ts

Modificar el hook para manejar correctamente el estado de autenticación:

```typescript
export function useFollowList(
  profileId: string | undefined,
  type: 'followers' | 'following'
): UseFollowListResult {
  const { user, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<FollowerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    // Wait for auth to finish loading before fetching
    if (authLoading) {
      return;
    }
    
    if (!profileId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // ... resto del código
  }, [profileId, type, user, authLoading]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);
```

---

## Flujo Corregido

```text
Usuario visita /@rosmelortiz
         │
         ▼
ProfileNavigator renderiza:
  ├─ PublicProfileHeader (ÚNICO header)
  └─ PublicProfileCard (sin header)
         │
         ▼
Usuario hace clic en "2 siguiendo"
         │
         ▼
useFollowList espera a que authLoading = false
         │
         ▼
Consulta qué perfiles sigue el usuario actual
         │
         ▼
Cada FollowerCard recibe isFollowing correcto
         │
         ▼
Botón muestra "Siguiendo" para perfiles que ya sigue
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/PublicProfileCard.tsx` | Eliminar importación y uso de `PublicProfileHeader` |
| `src/hooks/useFollowList.ts` | Esperar `authLoading` antes de hacer consultas |

---

## Resultado Esperado

1. **Header único**: Solo aparece un header en la parte superior de la página
2. **Botones correctos**: 
   - Si ya sigues a alguien → muestra "Siguiendo"
   - Si no lo sigues → muestra "Seguir"
   - En tu propio perfil, viendo tu lista de "siguiendo" → todos muestran "Siguiendo"
