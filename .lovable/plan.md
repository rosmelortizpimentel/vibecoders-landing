
## Ideas: Drag-and-Drop en Grid + Header Responsivo Profesional

### Resumen

Tres mejoras principales en la seccion de Ideas:

1. **Drag-and-drop en el grid de cards**: Las cards se pueden reordenar arrastrando. El cursor de arrastre (GripVertical) aparece al pasar el mouse.
2. **Tabs con iconos profesionales**: Agregar iconos `Circle` y `CheckCircle2` a los tabs de Pendientes y Completadas, con color primario.
3. **Busqueda responsiva en mobile**: En mobile, solo se muestra un icono de lupa. Al hacer clic, se expande el input de busqueda ocultando los tabs. Al cerrar (X), vuelve a los tabs.

---

### Cambios en `src/components/me/IdeasTab.tsx`

#### 1. Drag-and-drop con @dnd-kit

- Importar `DndContext`, `closestCenter`, `PointerSensor`, `KeyboardSensor`, `useSensors`, `useSensor`, `DragEndEvent` de `@dnd-kit/core`.
- Importar `SortableContext`, `rectSortingStrategy`, `useSortable`, `arrayMove` de `@dnd-kit/sortable`.
- Importar `CSS` de `@dnd-kit/utilities`.
- Importar `GripVertical` de `lucide-react`.

**Sensor config**: PointerSensor con `activationConstraint: { distance: 8 }` para evitar conflictos con clics.

**Cada card** se envuelve con `useSortable` usando el `id` de la idea. El drag handle (GripVertical) aparece solo en hover, posicionado en la esquina superior izquierda, reemplazando el checkbox que se mueve ligeramente.

**onDragEnd**: Reordena el array local con `arrayMove` y persiste el nuevo `display_order` en Supabase para cada idea afectada.

**Nota**: Solo el tab "Pendientes" soporta drag-and-drop (las completadas no necesitan orden).

#### 2. Tabs con iconos

- Tab "Pendientes": icono `Circle` (tamano 14px) con `text-primary` antes del texto.
- Tab "Completadas": icono `CheckCircle2` (tamano 14px) con `text-primary` antes del texto.

#### 3. Header responsivo (mobile)

Agregar estado `isSearchOpen: boolean`.

**En mobile** (`isMobile === true`):
- Por defecto: se muestran los Tabs + boton de busqueda (icono Search) + boton crear (+).
- Al hacer clic en el icono Search: los tabs se ocultan y aparece el Input de busqueda expandido con un boton X para cerrar.
- Al hacer clic en X: se cierra el input, se limpia el query, y vuelven los tabs.

**En desktop**: Se mantiene el layout actual (input de busqueda siempre visible + tabs + boton crear).

**Orden de elementos en el header**:

```text
Desktop: [Tabs con iconos] [------Search input------] [+]
Mobile default: [Tabs con iconos] [Search icon] [+]  
Mobile search open: [X] [------Search input------] [+]
```

#### 4. Card con drag handle

Estructura actualizada de cada card:

```text
+------------------------------------------+
| [drag handle on hover] Titulo... [Xd tag] |
|                                            |
| Descripcion texto plano...                 |
| max 5 lineas                               |
|                                            |
|   [checkbox]        [edit] [delete]        |  <-- hover
+------------------------------------------+
```

- El `GripVertical` aparece a la izquierda del titulo solo en hover, con `cursor-grab`.
- El checkbox (toggle done) se mueve a la esquina inferior izquierda, visible en hover junto con edit/delete.

### Persistencia del reorden

Al soltar una card en nueva posicion:
1. `arrayMove` en el estado local para feedback instantaneo.
2. Loop por las ideas reordenadas y actualizar `display_order` en Supabase.
3. En caso de error, revertir al estado anterior.

---

### Archivos a modificar (1 archivo)

| Archivo | Cambio |
|---------|--------|
| `src/components/me/IdeasTab.tsx` | Drag-and-drop, header responsivo, tabs con iconos, drag handle en hover |
