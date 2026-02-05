
## Modificar el Menú Superior del Header

### Objetivo
Mejorar el menú de usuario en el header de perfiles publicos para:
1. Mostrar el nombre y foto correctos (con fallback a datos de Google si el perfil no tiene nombre/foto)
2. Cambiar dinamicamente las opciones del menu segun donde este el usuario

---

### Logica de Nombre y Foto (Fallback)

```text
Nombre a mostrar:
  1. profile.name (de la tabla profiles)
  2. user.user_metadata.full_name (de Google OAuth)
  3. "Usuario" (fallback final)

Foto a mostrar:
  1. profile.avatar_url (de la tabla profiles)
  2. user.user_metadata.avatar_url (de Google OAuth)
  3. Inicial del nombre (fallback final)
```

---

### Logica Condicional del Menu

```text
Ruta actual                 | Opciones del menu
----------------------------|----------------------------------------
/@miUsername (propio)       | "Editar Mi Perfil" + "Cerrar Sesion"
/me/* (edicion)             | "Ver Perfil Publico" + "Cerrar Sesion"
Cualquier otra pagina       | "Editar Mi Perfil" + "Ver Perfil Publico" + "Cerrar Sesion"
```

**Deteccion de "perfil propio":**
- Comparar `profileUsername` (el username del perfil que se esta viendo, pasado como prop) con `profile.username` (el username del usuario logueado)

---

### Cambios en `PublicProfileHeader.tsx`

1. **Obtener `user` de `useAuth`** para acceder a los metadatos de Google

2. **Modificar `getDisplayName()`**:
   ```text
   Prioridad:
   1. profile?.name
   2. user?.user_metadata?.full_name
   3. "Usuario"
   ```

3. **Modificar avatar**:
   ```text
   src = profile?.avatar_url || user?.user_metadata?.avatar_url || ''
   ```

4. **Agregar `useLocation()`** para detectar la ruta actual

5. **Calcular variables de estado**:
   ```text
   isOnOwnPublicProfile = profileUsername && profile?.username === profileUsername
   isOnEditPage = pathname.startsWith('/me')
   ```

6. **Renderizar opciones del menu condicionalmente**:
   - Si `isOnOwnPublicProfile`: Solo "Editar Mi Perfil" (icono Pencil o User)
   - Si `isOnEditPage`: Solo "Ver Perfil Publico"
   - Si ninguno: Ambas opciones

---

### Iconos y Textos

| Contexto | Opcion | Icono | Texto |
|----------|--------|-------|-------|
| Perfil propio | Editar | `Pencil` o `User` | "Editar Mi Perfil" |
| Pagina /me/* | Ver publico | `ExternalLink` | "Ver Perfil Publico" |
| Otras paginas | Editar | `User` | "Editar Mi Perfil" |
| Otras paginas | Ver publico | `ExternalLink` | "Ver Perfil Publico" |
| Siempre | Cerrar sesion | `LogOut` | "Cerrar Sesion" |

---

### Codigo de la Logica Principal

```typescript
// En PublicProfileHeader.tsx
const { user, signOut, signInWithGoogle } = useAuth();
const { profile } = useProfile();
const location = useLocation();

// Detectar contexto
const isOnOwnPublicProfile = profileUsername && profile?.username === profileUsername;
const isOnEditPage = location.pathname.startsWith('/me');

// Nombre con fallback a Google
const getDisplayName = () => {
  const name = profile?.name || user?.user_metadata?.full_name;
  if (!name) return 'Usuario';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].charAt(0)}.`;
};

// Avatar con fallback a Google
const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || '';
```

---

### Archivo a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/PublicProfileHeader.tsx` | Agregar logica de fallback y menu condicional |

---

### Flujo Visual del Menu

```text
Usuario ve /@rosmelortiz (su propio perfil)
    Menu: [Editar Mi Perfil] [Cerrar Sesion]

Usuario esta en /me/profile (editando)
    Menu: [Ver Perfil Publico] [Cerrar Sesion]

Usuario ve /@otrousuario o esta en /startups
    Menu: [Editar Mi Perfil] [Ver Perfil Publico] [Cerrar Sesion]
```
