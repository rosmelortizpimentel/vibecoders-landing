
## Resumen

Implementar un sistema interactivo de seguidores/siguiendo en los perfiles públicos que permita:
- Ver la lista de seguidores/siguiendo en lugar de las apps
- Seguir usuarios con un solo clic
- Dejar de seguir con confirmación personalizada
- Navegar entre perfiles sin recargar la página completa

---

## Comportamiento del Usuario

```text
┌─────────────────────────────────────────────────────────────┐
│ Perfil de @rosmelortiz                                      │
│                                                             │
│  [Avatar]  Rosmel Ortiz                                     │
│            1 siguiendo  2 seguidores  ·  @rosmelortiz       │
│                   ↑            ↑                            │
│              CLICKEABLE    CLICKEABLE                       │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │ Si hace clic en "siguiendo" o     │
        │ "seguidores", la sección APPS     │
        │ cambia a mostrar esa lista        │
        └───────────────────────────────────┘
```

---

## Nueva Sección de Seguidores/Siguiendo

Cuando el usuario hace clic en los contadores, la sección de apps se reemplaza por:

```text
┌─────────────────────────────────────────────────────────────┐
│  ← Volver a Apps                          SIGUIENDO (5)     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  [Avatar]  Juan López                      [Siguiendo ▼]│ │
│ │            @juanlopez                                    │ │
│ │            Frontend developer & indie hacker             │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  [Avatar]  María García                    [Seguir]      │ │
│ │            @mariagarcia                                  │ │
│ │            Building cool stuff with AI                   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Lógica de Botones

| Acción | Comportamiento |
|--------|----------------|
| **Seguir** | Se ejecuta inmediatamente sin confirmación |
| **Dejar de Seguir** | Muestra popup de confirmación con tarjeta del usuario |

### Popup de Confirmación (Dejar de Seguir)

```text
┌─────────────────────────────────────────┐
│                                         │
│        [Avatar grande]                  │
│        Juan López                       │
│        @juanlopez                       │
│                                         │
│   ¿Dejar de seguir a @juanlopez?        │
│                                         │
│   [Cancelar]      [Dejar de Seguir]     │
│                                         │
└─────────────────────────────────────────┘
```

---

## Navegación Entre Perfiles

Al hacer clic en un usuario de la lista:
- El contenido del perfil se reemplaza por el nuevo perfil
- El header y footer NO se recargan
- Se añade un botón de "← Atrás" en el header para navegar hacia atrás
- Se mantiene un historial interno de perfiles visitados

### Flujo de Navegación

```text
@rosmel → click en @juan → click en @maria → click ← Atrás
    │                                              │
    └──────────────────────────────────────────────┘
                    vuelve a @juan
```

---

## Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `src/components/profile/FollowersList.tsx` | Lista de seguidores/siguiendo con botón de seguir |
| `src/components/profile/FollowerCard.tsx` | Tarjeta individual de un seguidor |
| `src/components/profile/UnfollowConfirmDialog.tsx` | Popup de confirmación para dejar de seguir |
| `src/components/profile/ProfileNavigator.tsx` | Wrapper que maneja navegación entre perfiles |
| `src/hooks/useFollowList.ts` | Hook para obtener lista de seguidores/siguiendo con sus perfiles |
| `src/hooks/useFollowAction.ts` | Hook para seguir/dejar de seguir con estado optimista |

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/PublicProfileCard.tsx` | - Hacer los contadores clickeables<br>- Agregar estado para mostrar apps vs. lista<br>- Integrar `FollowersList` |
| `src/pages/PublicProfile.tsx` | - Integrar `ProfileNavigator` para manejar historial de navegación |
| `src/hooks/usePublicProfile.ts` | - Agregar método de refetch para actualizar datos |

---

## Detalles Técnicos

### 1. Estado del Perfil Público

```typescript
// Nuevo estado en PublicProfileCard
type ViewMode = 'apps' | 'followers' | 'following';
const [viewMode, setViewMode] = useState<ViewMode>('apps');
```

### 2. Hook useFollowList

```typescript
interface FollowerProfile {
  id: string;
  username: string;
  name: string | null;
  avatar_url: string | null;
  tagline: string | null;
  isFollowing: boolean; // Si el usuario actual sigue a este perfil
}

function useFollowList(
  profileId: string,
  type: 'followers' | 'following'
): {
  profiles: FollowerProfile[];
  loading: boolean;
  refetch: () => void;
}
```

### 3. Navegación Sin Recarga

```typescript
// ProfileNavigator mantiene un stack de perfiles
const [profileStack, setProfileStack] = useState<string[]>([initialUsername]);

// Navegar a nuevo perfil
const pushProfile = (username: string) => {
  setProfileStack(prev => [...prev, username]);
};

// Volver atrás
const popProfile = () => {
  setProfileStack(prev => prev.slice(0, -1));
};

// El perfil actual es el último del stack
const currentUsername = profileStack[profileStack.length - 1];
```

### 4. Optimización del Botón Seguir

```typescript
// Usar estado optimista para respuesta inmediata
const handleFollow = async () => {
  setIsFollowingOptimistic(true); // Inmediato
  try {
    await supabase.from('follows').insert({...});
  } catch {
    setIsFollowingOptimistic(false); // Revertir si falla
  }
};
```

---

## Diseño Visual

### Tarjeta de Seguidor

- Avatar circular (40x40px) a la izquierda
- Nombre en negrita, username debajo en gris
- Tagline en texto más pequeño (line-clamp-2)
- Botón de seguir/siguiendo a la derecha
- Hacer clic en la tarjeta (excepto botón) navega al perfil

### Botón de Seguir

| Estado | Estilo |
|--------|--------|
| No siguiendo | Fondo negro (#1c1c1c), texto blanco, "Seguir" |
| Siguiendo | Borde gris, fondo blanco, "Siguiendo" |
| Hover en Siguiendo | Cambia a "Dejar de seguir" en rojo |

---

## Flujo Completo

1. Usuario visita `/@rosmel`
2. Ve el perfil con apps
3. Hace clic en "5 seguidores"
4. La sección de apps cambia a mostrar la lista de seguidores
5. Ve los 5 usuarios con sus fotos, nombres y botones
6. Hace clic en "Seguir" → Se sigue inmediatamente
7. Hace clic en "Siguiendo" (otro usuario) → Popup de confirmación
8. Confirma → Se deja de seguir
9. Hace clic en una tarjeta de usuario → Se carga ese perfil en la misma página
10. Aparece botón "← Atrás" en el header
11. Hace clic en "← Atrás" → Vuelve al perfil de @rosmel
