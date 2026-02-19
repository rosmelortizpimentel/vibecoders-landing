

## Refactorizar Ideas: Vista de Sticky Notes en Grid

### Resumen

Reemplazar el layout actual (lista lateral + detalle a la derecha) por un grid de cards estilo "sticky notes" que muestren titulo, descripcion (max 5 lineas, solo texto plano con saltos de linea), y un tag de antiguedad. Al pasar el mouse sobre cada card, aparecen botones de editar y eliminar. Al hacer clic en editar (o crear nueva), se navega a `/ideas/:id` donde se muestra el formulario de edicion. La vista por defecto `/ideas` muestra solo el grid.

---

### Cambios por archivo

#### 1. `src/components/me/IdeasTab.tsx` -- Refactorizacion completa

**Layout**: Reemplazar el grid de 2 columnas (lista + detalle) por una unica vista que alterna entre:
- **Grid view** (ruta `/ideas`): Cards en grid responsive (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`)
- **Detail view** (ruta `/ideas/:id` o `/ideas/new`): Formulario de edicion (componente `IdeaDetail` existente)

**Card sticky note**:
- Fondo suave tipo nota (`bg-amber-50/50 dark:bg-amber-950/20` o similar, sutil)
- Borde fino `border border-border`
- Rounded `rounded-xl`
- Padding compacto `p-3`
- Titulo en `font-semibold text-sm line-clamp-1`
- Descripcion en `text-xs text-muted-foreground line-clamp-5 whitespace-pre-line` -- solo texto plano, se eliminan tags markdown/HTML
- Tag de dias como `Badge` en la esquina superior derecha: "Hace 2d", "hoy"
- Al hover: se muestran dos iconos (Pencil y Trash2) en la esquina inferior derecha con transicion de opacidad
- El circulo de completar (CheckCircle2/Circle) se mantiene visible en la esquina superior izquierda
- Cards completadas: fondo mas apagado, titulo con `line-through opacity-60`

**Tabs y busqueda**: Se mantienen arriba del grid (Pendientes/Completadas tabs + search + boton crear).

**Drag and drop**: Se elimina el drag-and-drop para simplificar la vista de cards en grid (no tiene sentido visual arrastrar cards en un grid 2D).

**Navegacion**:
- Click en card -> no hace nada (solo hover muestra acciones)
- Click en boton editar -> `navigate(/ideas/${id})`
- Click en boton eliminar -> abre dialog de confirmacion (ya existente)
- Click en boton "+" -> `navigate(/ideas/new)`

#### 2. `src/components/me/ideas/IdeaDetail.tsx` -- Ajustes menores

- Reemplazar `MarkdownEditor` por un `Textarea` simple (solo texto plano con saltos de linea)
- Agregar boton "Volver" arriba del formulario para regresar al grid (`navigate('/ideas')`)

#### 3. `src/i18n/es/profile.json`, `en/profile.json`, `fr/profile.json`, `pt/profile.json`
- Agregar clave `ideas.edit`: "Editar" / "Edit" / "Modifier" / "Editar"
- Agregar clave `ideas.daysAgo`: "Hace" (para el tag "Hace 2d")
- Opcional: `ideas.noPendingIdeas`, `ideas.noCompletedIdeas` para estados vacios por tab

---

### Detalle tecnico

**Estructura del card**:

```text
+-----------------------------+
| [O] Titulo...     [Hace 2d] |
|                              |
| Descripcion en texto plano   |
| con saltos de linea, maximo  |
| 5 lineas visibles antes de   |
| truncar con line-clamp-5     |
|                              |
|              [edit] [delete]  |  <-- solo visible en hover
+-----------------------------+
```

**Limpieza de descripcion**: Para mostrar solo texto plano, se usara una funcion `stripMarkdown(text)` que elimine sintaxis markdown (`**`, `#`, `- `, etc.) y solo deje el texto con saltos de linea.

**Grid responsive**:
- Mobile: 1 columna
- sm: 2 columnas
- lg: 3 columnas
- xl: 4 columnas

### Archivos a modificar (6 archivos)

| Archivo | Cambio |
|---------|--------|
| `src/components/me/IdeasTab.tsx` | Refactorizar a grid de cards sticky notes, eliminar drag-and-drop |
| `src/components/me/ideas/IdeaDetail.tsx` | Textarea simple en vez de MarkdownEditor, boton volver |
| `src/i18n/es/profile.json` | Agregar claves `ideas.edit`, `ideas.daysAgo` |
| `src/i18n/en/profile.json` | Agregar claves `ideas.edit`, `ideas.daysAgo` |
| `src/i18n/fr/profile.json` | Agregar claves `ideas.edit`, `ideas.daysAgo` |
| `src/i18n/pt/profile.json` | Agregar claves `ideas.edit`, `ideas.daysAgo` |

