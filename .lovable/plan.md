

## Mejoras UX en Tarjetas y Espaciado del Roadmap

### Cambios (3 items)

---

### 1. Reducir padding lateral a la mitad

El layout principal (`DashboardLayout.tsx`) aplica `md:px-8` (32px). Para el roadmap, necesitamos compensar esto. Se agregara un margen negativo al contenedor del editor para reducir el espacio lateral a la mitad.

En `RoadmapEditor.tsx`, cambiar el contenedor raiz:
```tsx
// Antes:
<div className="space-y-4 md:space-y-6">

// Despues:
<div className="space-y-4 md:space-y-6 md:-mx-4">
```

Esto reduce el padding efectivo de 32px a 16px en cada lado.

---

### 2. Icono de arrastre de tarjetas solo visible al hover

En el componente `SortableCard`, agregar `group` al Card y `opacity-0 group-hover:opacity-100 transition-opacity` al `GripVertical`.

---

### 3. Reemplazar menu 3 puntos de tarjetas por iconos directos al hover

Eliminar el `DropdownMenu` completo de las tarjetas. En su lugar, mostrar iconos de `Pencil` y `Trash2` que solo aparecen al hover (usando `opacity-0 group-hover:opacity-100`). Se elimina la opcion "Mover" ya que el drag-and-drop ya cumple esa funcion.

---

### Archivos a modificar (1 archivo)

| Archivo | Cambios |
|---------|---------|
| `src/pages/RoadmapEditor.tsx` | Padding negativo, drag icon hover en cards, reemplazar 3-dot menu por iconos directos |

### Detalle tecnico

**SortableCard actualizado**:
```tsx
<Card className="cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow border group" ...>
  <CardContent className="p-3">
    <div className="flex justify-between items-start gap-2">
      <div className="flex items-start gap-2 flex-1 min-w-0" {...attributes} {...listeners}>
        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex-1 min-w-0">
          {/* titulo, descripcion, fecha */}
        </div>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
          <Pencil className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={onDelete}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
```

