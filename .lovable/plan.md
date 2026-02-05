

## Plan: Corregir Fresh Drops para mostrar Apps de Usuarios

### Problema Identificado

El hook `useFreshDrops` consulta la tabla equivocada:
- **Actual**: `showcase_gallery` (proyectos curados por admin)
- **Correcto**: `apps` (apps registradas por usuarios en sus perfiles)

### Datos Reales en la Tabla `apps`

```text
App                | Usuario                      | Fecha
-------------------|------------------------------|------------------
PymesGEO           | @gotaluism                   | 2026-02-03
Vibecoders         | @rosmelortiz                 | 2026-01-31
HubMenu            | @rosmelortiz                 | 2026-01-31
ToggleUp           | @rosmelortiz                 | 2026-01-31
```

---

### Cambios Necesarios

#### 1. Modificar `useFreshDrops.ts`

Cambiar la consulta para obtener apps de la tabla `apps` con datos del perfil del autor:

```typescript
// Consulta corregida
const { data, error } = await supabase
  .from('apps')
  .select(`
    id,
    name,
    tagline,
    url,
    logo_url,
    created_at,
    profiles:user_id (
      username,
      name,
      avatar_url
    )
  `)
  .eq('is_visible', true)
  .order('created_at', { ascending: false })
  .limit(freshDropsCount);
```

Nueva interfaz para el tipo de dato:

```typescript
export interface FreshDropApp {
  id: string;
  name: string | null;
  tagline: string | null;
  url: string;
  logo_url: string | null;
  created_at: string;
  profiles: {
    username: string | null;
    name: string | null;
    avatar_url: string | null;
  };
}
```

---

#### 2. Modificar `FreshDropsCarousel.tsx`

Actualizar para usar la nueva estructura de datos:

| Campo Actual (ShowcaseProject) | Campo Nuevo (FreshDropApp) |
|-------------------------------|----------------------------|
| `project.project_title`       | `app.name`                 |
| `project.project_tagline`     | `app.tagline`              |
| `project.project_url`         | `app.url`                  |
| `project.project_logo_url`    | `app.logo_url`             |

Tambien mostrar el autor con link a su perfil:

```text
+---------------------------------------------------+
|  +--------+                                       |
|  |  Logo  |   Nombre de la App                    |
|  |  96px  |   Tagline                             |
|  +--------+   por @username                       |
|               [Ver Proyecto ->]                   |
+---------------------------------------------------+
```

---

#### 3. Modificar `Home.tsx`

- Eliminar la seccion "Explorar Todo" completamente
- Remover el import y uso de `useShowcase`
- Actualizar el tipo de datos pasados al carousel

---

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useFreshDrops.ts` | Cambiar consulta de `showcase_gallery` a `apps` con join a `profiles` |
| `src/components/home/FreshDropsCarousel.tsx` | Actualizar interfaz y campos a la nueva estructura |
| `src/pages/Home.tsx` | Eliminar seccion "Explorar Todo" |

---

### Resultado Esperado

El carousel "Acaba de salir del horno" mostrara:
1. PymesGEO por @gotaluism
2. Vibecoders por @rosmelortiz
3. HubMenu por @rosmelortiz
4. ToggleUp por @rosmelortiz

Ordenados por fecha de creacion (mas recientes primero), con cantidad configurable desde `general_settings.fresh_drops_count`.

