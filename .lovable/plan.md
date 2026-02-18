

## Mejoras a la Sección "Mis Ideas"

### Problemas Detectados
- El encabezado de la página está en inglés hardcodeado ("My Ideas", "Capture your next big thing...")
- No hay forma de reordenar las ideas (falta drag and drop)
- No existe opción para marcar ideas como "Done"
- No se muestra la antigüedad de cada idea (días)
- Falta scroll propio en la sección

---

### Cambios Propuestos

#### 1. Migración de Base de Datos
Agregar dos columnas nuevas a la tabla `user_ideas`:
- `display_order` (integer, default 0) -- para el orden drag and drop
- `is_done` (boolean, default false) -- para marcar como completada

#### 2. Traducciones en los 4 Idiomas
Agregar claves nuevas al archivo `profile.json` de cada idioma (es, en, fr, pt):
- `ideas.pageTitle` -- Título de la página
- `ideas.pageDescription` -- Descripción de la página
- `ideas.daysAgo` -- "hace X días" / "X days ago"
- `ideas.today` -- "hoy" / "today"
- `ideas.markDone` -- "Marcar como hecha"
- `ideas.markPending` -- "Reactivar"
- `ideas.done` -- "Hecha"
- `ideas.search` -- "Buscar..."

#### 3. Página Ideas.tsx
- Reemplazar textos hardcodeados por traducciones usando `useTranslation('profile')`
- La página ocupará el alto completo con scroll propio

#### 4. Componente IdeasTab.tsx -- Mejoras Principales

**Drag and Drop (con @dnd-kit)**:
- Cada idea en la lista tendrá un handle de arrastre
- Al soltar, se actualiza `display_order` en la base de datos
- El orden se respeta al cargar (ORDER BY display_order ASC)

**Marcar como "Done"**:
- Botón/checkbox en cada idea de la lista para alternar `is_done`
- Las ideas completadas aparecen con estilo tachado/opaco al final de la lista
- Actualización optimista + persistencia en BD

**Tag de antigüedad**:
- Badge en cada idea mostrando cuántos días tiene desde su creación
- Ejemplo: "hoy", "3d", "15d", "30d+"

**Scroll propio**:
- El contenedor principal usa `h-[calc(100vh-theme-spacing)]` con overflow
- La lista de ideas y el detalle tienen scroll independiente

**Responsive (móvil)**:
- Layout de columna única en móvil
- Touch-friendly drag handles
- Botones y badges adaptados a pantallas pequeñas
- El detalle ocupa pantalla completa en móvil

---

### Detalles Técnicos

#### Migración SQL

```sql
ALTER TABLE public.user_ideas 
  ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN is_done BOOLEAN NOT NULL DEFAULT false;
```

#### Archivos a Modificar/Crear

| Archivo | Acción |
|---------|--------|
| Migración SQL | Crear -- agregar columnas |
| `src/pages/Ideas.tsx` | Modificar -- usar traducciones |
| `src/components/me/IdeasTab.tsx` | Modificar -- drag & drop, done, tags, scroll |
| `src/components/me/ideas/IdeaDetail.tsx` | Modificar -- actualizar interfaz Idea |
| `src/i18n/es/profile.json` | Modificar -- agregar claves nuevas |
| `src/i18n/en/profile.json` | Modificar -- agregar claves nuevas |
| `src/i18n/fr/profile.json` | Modificar -- agregar claves nuevas |
| `src/i18n/pt/profile.json` | Modificar -- agregar claves nuevas |

#### Lógica de Drag and Drop

Se reutilizará `@dnd-kit` (ya instalado) con `SortableContext` y `verticalListSortingStrategy`. Al finalizar el drag:

```typescript
// Recalcular display_order para todos los items visibles
const reorderedIds = arrayMove(ideaIds, oldIndex, newIndex);
// Actualizar en batch: UPDATE user_ideas SET display_order = X WHERE id = Y
```

#### Tag de Antigüedad

```typescript
const getDaysTag = (createdAt: string): string => {
  const days = differenceInDays(new Date(), new Date(createdAt));
  if (days === 0) return t('ideas.today');
  return `${days}d`;
};
```

#### Consulta Ordenada

```typescript
const { data } = await supabase
  .from('user_ideas')
  .select('*')
  .order('is_done', { ascending: true })    // Activas primero
  .order('display_order', { ascending: true }) // Luego por orden manual
  .order('created_at', { ascending: false });  // Fallback por fecha
```
