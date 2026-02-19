
## Cambios en Cards del Roadmap y Links Inteligentes de Vista Previa

### 1. Descripcion de cards: 5 lineas max y letra mas pequena

**Archivo**: `src/pages/RoadmapEditor.tsx`

En las 3 ubicaciones donde se muestra `card.description` con `line-clamp-2`, cambiar a:
- `line-clamp-5` (maximo 5 lineas)
- `text-xs` en lugar de `text-sm` (1px mas pequeno)

Esto aplica a:
- Linea 129: Card del Kanban desktop (SortableCard)
- Linea 680: Card del listado mobile (Collapsible)
- Linea 746: Card del overlay de drag (ya usa `text-xs`, solo cambiar `line-clamp-2` a `line-clamp-5`)

En la pagina publica (`PublicRoadmap.tsx`) y en los formularios de edicion, la descripcion se mantiene completa sin truncar.

---

### 2. Links inteligentes segun entorno

**Archivo**: `src/pages/MyAppHub.tsx`

Reemplazar la logica de generacion de URLs (lineas 66-69) con deteccion del hostname actual:

```
const isProduction = window.location.hostname.endsWith('vibecoders.la');

if (isProduction) {
  // Subdominio: appslug.vibecoders.la/roadmap
  publicPath = `https://${appSlug}.vibecoders.la`
} else {
  // Entorno de pruebas: /@username/appslug/roadmap
  publicPath = `/@${ownerUsername}/${appSlug}/roadmap`
  // Como URL relativa, se abre en el mismo host de preview
}
```

La logica construye URLs relativas en entorno de pruebas (usando el preview host actual) y absolutas con subdominio solo en produccion. Ambos links (Roadmap y Feedback) siguen siendo independientes segun sus switches de visibilidad.

---

### Archivos a modificar

| Archivo | Cambios |
|---------|---------|
| `src/pages/RoadmapEditor.tsx` | `line-clamp-2` a `line-clamp-5`, `text-sm` a `text-xs` en descriptions de cards (3 ubicaciones) |
| `src/pages/MyAppHub.tsx` | Logica inteligente de URLs segun hostname (subdominio en prod, path en pruebas) |
