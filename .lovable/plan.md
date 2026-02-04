

## Resumen

Se creará una nueva sección "Usuarios" en el panel de administración que mostrará todos los usuarios registrados con sus datos básicos y estadísticas de seguimiento. Al hacer clic en los contadores de seguidores/siguiendo, se mostrará una lista simple con los perfiles correspondientes.

---

## Vista General

La nueva sección mostrará:
- Foto de perfil (avatar)
- Nombre y username
- Link al perfil público (`/@username`)
- Contador de seguidores (clickeable)
- Contador de siguiendo (clickeable)

---

## Archivos a Crear/Modificar

| Archivo | Acción |
|---------|--------|
| `src/components/admin/UsersManager.tsx` | **Crear** - Componente principal de gestión de usuarios |
| `src/components/admin/FollowListDialog.tsx` | **Crear** - Dialog para mostrar lista de seguidores/siguiendo |
| `src/components/admin/AdminSidebar.tsx` | **Modificar** - Agregar entrada "Usuarios" al menú |
| `src/pages/Admin.tsx` | **Modificar** - Agregar ruta para `/admin/users` |

---

## Diseño de la Interfaz

### Lista de Usuarios (UsersManager)

```text
┌─────────────────────────────────────────────────────────────┐
│  Gestión de Usuarios                                        │
│  Ver todos los usuarios registrados en la plataforma        │
├─────────────────────────────────────────────────────────────┤
│ ┌──────┬────────────────────┬──────────┬──────────┬───────┐ │
│ │ 📷   │ Rosmel Cabrera     │ Seguidor │ Siguien. │ Link  │ │
│ │      │ @rosmel            │    12    │    5     │  ↗    │ │
│ ├──────┼────────────────────┼──────────┼──────────┼───────┤ │
│ │ 📷   │ Juan López         │ Seguidor │ Siguien. │ Link  │ │
│ │      │ @juanlopez         │    8     │    15    │  ↗    │ │
│ └──────┴────────────────────┴──────────┴──────────┴───────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Dialog de Seguidores/Siguiendo

Al hacer clic en un número, se abre un dialog mostrando:
- Lista simple con avatar + nombre + username
- Link para ver cada perfil público

---

## Implementación Técnica

### 1. UsersManager.tsx

```text
Query principal:
- Consultar tabla `profiles` (SELECT público disponible por RLS)
- Para cada perfil, obtener conteo de followers y following

Información mostrada:
- avatar_url → Foto circular
- name → Nombre completo
- username → Username con @
- Link externo → Abre /@username
- Contadores → Clicleables para abrir dialog
```

### 2. FollowListDialog.tsx

```text
Props:
- isOpen: boolean
- onClose: () => void
- userId: string
- type: 'followers' | 'following'

Query según tipo:
- followers: SELECT profiles WHERE id IN (SELECT follower_id FROM follows WHERE following_id = userId)
- following: SELECT profiles WHERE id IN (SELECT following_id FROM follows WHERE follower_id = userId)
```

### 3. AdminSidebar.tsx

Agregar nueva entrada al menú:
```typescript
{
  title: 'Usuarios',
  href: '/admin/users',
  icon: Users,
}
```

### 4. Admin.tsx

Agregar nueva ruta:
```typescript
<Route path="users" element={<UsersManager />} />
```

---

## Flujo de Datos

```text
1. Admin navega a /admin/users
2. UsersManager carga todos los profiles
3. Para cada profile, se consultan los conteos de follows
4. Al hacer clic en un contador:
   - Se abre FollowListDialog
   - Se consultan los profiles relacionados (followers o following)
   - Se muestran en una lista scrolleable
```

---

## Consideraciones de Seguridad

- La tabla `profiles` tiene RLS que permite SELECT público
- La tabla `follows` tiene RLS que permite SELECT público
- No se requieren cambios en las políticas de seguridad
- Solo se muestra información ya pública (perfiles y relaciones de seguimiento)

