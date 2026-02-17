
## Plan: Centro de Monitoreo de Apps + Correccion de Errores de Build

### Objetivo
Crear una nueva seccion "Apps" en el panel de administracion que muestre todas las apps registradas (visibles e inactivas) en modo solo lectura, con filtros y ordenamiento. Ademas, corregir los errores de build existentes.

---

### Parte 1: Corregir errores de build existentes

**Edge Functions** - Corregir `error` is of type `unknown` en 5 archivos:
- `check-founder-status/index.ts`
- `create-checkout-session/index.ts`
- `get-landing-stats/index.ts`
- `set-free-tier/index.ts`
- `stripe-webhook/index.ts`

Solucion: cambiar `error.message` por `(error as Error).message` en cada catch.

**SurveyManager.tsx y SurveyStats.tsx** - Errores de tipos con tablas `surveys`, `survey_options`, `survey_responses`. Estas tablas existen en la BD pero no estan en el archivo de tipos generado (`types.ts`). Se usaran queries con `.from()` casteados o se reescribiran las queries con `supabase.rpc` o raw fetch para evitar los errores de tipo.

---

### Parte 2: Nuevo componente AppsMonitor

**Archivo nuevo:** `src/components/admin/AppsMonitor.tsx`

Columnas de la tabla:
| Columna | Fuente |
|---|---|
| Nombre de la app | `apps.name` |
| Tech stacks (debajo del nombre) | JOIN `app_stacks` + `tech_stacks` |
| Vistas (clics) | COUNT de `app_clicks` |
| Autor (con link al perfil) | JOIN `profiles` via `user_id` |
| Estado | JOIN `app_statuses` |
| Horas planificacion | `apps.hours_ideation` |
| Horas ejecucion | `apps.hours_building` |
| Beta activo | `apps.beta_active` |
| Visible/Inactiva | `apps.is_visible` |

**Filtros:**
- Busqueda por nombre de app o autor
- Filtro por estado (Building, Live, etc.)
- Filtro por visibilidad (todas, visibles, inactivas)
- Filtro por beta activo (si/no)

**Caracteristicas:**
- Solo lectura, sin botones de editar/eliminar
- Columnas ordenables usando el hook `useSortableData` existente
- El nombre del autor sera un link a su perfil publico (`/@username`)
- Mostrar badges para tech stacks debajo del nombre

**Nota tecnica:** Como el admin tiene acceso RLS solo a apps visibles (`is_visible = true`), necesitamos una RLS policy adicional para que admins puedan ver TODAS las apps.

---

### Parte 3: Migracion de base de datos

Agregar una policy RLS para que admins puedan ver todas las apps:
```sql
CREATE POLICY "Admins can view all apps"
ON apps FOR SELECT
USING (has_role(auth.uid(), 'admin'));
```

---

### Parte 4: Registrar la ruta

1. **AdminSidebar.tsx** - Agregar item "Apps" con icono `AppWindow` en el menu
2. **Admin.tsx** - Agregar ruta `apps` apuntando a `AppsMonitor`

---

### Secuencia de implementacion
1. Corregir errores de build en edge functions (cast `error as Error`)
2. Corregir SurveyManager/SurveyStats usando cast a `any` para las tablas no tipadas
3. Crear migracion RLS para acceso admin a todas las apps
4. Crear componente `AppsMonitor.tsx`
5. Registrar en sidebar y rutas
