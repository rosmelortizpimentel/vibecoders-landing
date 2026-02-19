

## Mejoras UX en el Editor de Roadmap

### Cambios solicitados (7 items)

---

### 1. Sidebar: mantener colapsado al entrar a Roadmap

**Problema**: Al seleccionar Roadmap el sidebar se colapsa, pero al cambiar de tab vuelve a expandirse.

**Solucion** en `MyAppHub.tsx`: Modificar el `useEffect` (lineas 46-59) para que cuando se entra a roadmap y se colapsa el sidebar, al salir de roadmap NO restaure el estado anterior. Solo colapsa al entrar, nunca re-expande automaticamente.

---

### 2. Drag & Drop: permitir reordenar dentro del mismo carril

**Problema**: El DnD actual permite mover tarjetas entre carriles pero la logica en `handleDragEnd` (lineas 306-312) detecta si source y target son el mismo carril y en ese caso sale sin hacer nada si `oldIndex === targetIndex`, pero no ejecuta `arrayMove` para reordenar.

**Solucion** en `RoadmapEditor.tsx`: Corregir `handleDragEnd` para que cuando source y target son el mismo carril, ejecute la reordenacion con `roadmap.moveCard` usando el nuevo indice calculado.

---

### 3. Nombre del carril editable inline

**Solucion**: En la cabecera del carril (desktop, linea 512-516), reemplazar el `<h3>` por un `<input>` con estilo transparente que permita editar el nombre directamente. Al hacer blur o presionar Enter, guarda con `roadmap.updateLane(lane.id, { name })`.

---

### 4. Color del carril: selector inline con cuadrado redondeado

**Solucion**: Reemplazar el circulo de color (`w-3 h-3 rounded-full`, linea 514) por un cuadrado con bordes redondeados (`w-4 h-4 rounded-md`). Envolver en un `Popover` que al hacer click abra directamente el `HexColorPicker` de react-colorful SIN colores predefinidos (solo el picker + input hex).

---

### 5. Eliminar menu de 3 puntos del carril, dejar solo icono eliminar

**Solucion**: Quitar el `DropdownMenu` del carril (lineas 530-547) y reemplazarlo por un solo boton `Trash2` que dispara `setDeletingLane(lane.id)`.

---

### 6. Icono drag del carril solo visible al hover

**Solucion** en `SortableLaneWrapper`: Agregar clase `opacity-0 group-hover:opacity-100` al `GripVertical` y agregar `group` a la columna contenedora.

---

### 7. Tarjetas: ajustes visuales menores

- **Titulo y descripcion mismo tamano**: Cambiar titulo de `font-medium text-sm` a `text-sm font-bold` (mantener mismo `text-sm` que la descripcion)
- **Boton "Agregar Tarjeta"**: Quitar texto, dejar solo icono `<Plus>`
- **Texto "Sin tarjetas aun"**: Eliminar el bloque que muestra `t('editor.noCards')`

---

### Archivos a modificar (2 archivos)

| Archivo | Cambios |
|---------|---------|
| `src/pages/MyAppHub.tsx` | Sidebar: no restaurar al salir de roadmap |
| `src/pages/RoadmapEditor.tsx` | Items 2-7: DnD reorder, inline name/color, quitar menu 3 puntos, drag hover, ajustes tarjetas |

### Detalle tecnico

**Inline lane name edit (desktop header)**:
```tsx
<input
  className="font-semibold text-sm bg-transparent border-none outline-none focus:ring-1 focus:ring-primary rounded px-1 w-24"
  defaultValue={lane.name}
  onBlur={(e) => roadmap.updateLane(lane.id, { name: e.target.value })}
  onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
/>
```

**Inline color picker (sin presets)**:
```tsx
<Popover>
  <PopoverTrigger asChild>
    <button className="w-4 h-4 rounded-md border border-border shrink-0" style={{ backgroundColor: lane.color }} />
  </PopoverTrigger>
  <PopoverContent className="w-auto p-3">
    <HexColorPicker color={lane.color} onChange={(c) => roadmap.updateLane(lane.id, { color: c })} />
    {/* hex input only, no presets */}
  </PopoverContent>
</Popover>
```

**DnD same-lane reorder fix**:
```tsx
if (sourceLaneId === targetLaneId) {
  // Allow reordering within same lane
  try {
    await roadmap.moveCard(activeCardId, targetLaneId, targetIndex);
  } catch { toast.error(t('editor.errorMovingCard')); }
  return;
}
```

