

## Mejoras en Vista Previa del Perfil

### 1. Nuevo tab "Vista Previa" en MeTabs

Agregar un tercer tab a la derecha en `MeTabs.tsx` con el icono `ExternalLink` y el label traducido (`t.preview`). Este tab no navega a una ruta nueva, sino que hace scroll hacia la vista previa en desktop o abre el Sheet en mobile/tablet.

**Comportamiento**:
- En pantallas grandes (>=1280px): es un enlace que abre el perfil publico en nueva pestana (`/@username`), actuando como acceso directo visual.
- En pantallas pequenas (<1280px): abre el Sheet de vista previa (reutiliza la logica existente).

Para lograr esto, `MeTabs` recibira dos nuevas props opcionales:
- `onPreviewClick`: callback para abrir el Sheet en mobile
- `username`: para construir la URL del perfil publico

### 2. Quitar header con logo de Vibecoders en ProfilePreview

Eliminar el bloque del "App-style Header" (lineas 142-149 en `ProfilePreview.tsx`) que muestra el logo de vibecoders.la. La vista previa comenzara directamente con el banner + avatar.

### 3. Status en mayusculas en PreviewAppCard

En `PreviewAppCard.tsx`, cambiar `{status.name}` a `{status.name.toUpperCase()}` para que el texto del status se muestre en mayusculas, consistente con el estilo de la pagina `/apps`.

---

### Archivos a modificar (4 archivos)

| Archivo | Cambio |
|---------|--------|
| `src/components/me/MeTabs.tsx` | Agregar tab "Vista Previa" con icono ExternalLink, recibir props `onPreviewClick` y `username` |
| `src/pages/Me.tsx` | Pasar `onPreviewClick` y `username` a MeTabs |
| `src/components/me/ProfilePreview.tsx` | Eliminar header con logo vibecoders |
| `src/components/me/PreviewAppCard.tsx` | Status text en uppercase |

### Detalle tecnico

**MeTabs - nuevo tab**:
```tsx
// Despues de los tabs normales, agregar un tab especial "Vista Previa"
<button
  onClick={isLargeScreen ? () => window.open(`/@${username}`, '_blank') : onPreviewClick}
  className="flex items-center gap-2 px-3 sm:px-5 py-2 rounded-full text-sm text-slate-500 hover:text-slate-700 ml-auto"
>
  <ExternalLink className="h-4 w-4 text-slate-400" />
  <span className="hidden min-[420px]:inline">{t.preview}</span>
</button>
```

**PreviewAppCard - status uppercase**:
```tsx
{status.name.toUpperCase()}
```

**ProfilePreview - eliminar header**:
Se elimina el bloque `<div className="flex items-center justify-start px-4 py-2 bg-white border-b border-gray-100">...</div>` que contiene el logo.
