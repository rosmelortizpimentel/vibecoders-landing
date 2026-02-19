

## Mejoras en Feedback Publico y Panel de Mantenimiento

### 1. Idioma en pagina publica de feedback (PublicRoadmap.tsx)

**Problema**: El idioma del browser se aplica antes de que carguen los settings, pisando el `default_language` configurado.

**Solucion**: Inicializar `lang` como `'en'` sin aplicar browser language, y solo setear el idioma final cuando `default_language` llega de la DB. Si no hay `default_language`, entonces usar browser language como fallback. Actualmente el `useEffect` de browser language corre aunque `langResolved` sea false al inicio, y se aplica antes de que el fetch de settings complete.

**Archivo**: `src/pages/PublicRoadmap.tsx`
- Mover la deteccion del browser language al bloque del fetch de settings como fallback (solo si `default_language` no esta definido).
- Eliminar el `useEffect` separado de deteccion de browser language.

---

### 2. Attachments: imagenes como miniaturas, PDFs como icono de descarga (PublicRoadmap.tsx)

**Problema actual**: Todos los attachments se muestran como links de texto con icono de clip.

**Solucion**:
- **Imagenes** (file_type starts with `image/`): Mostrar como miniaturas (thumbnails) de ~80px debajo de la descripcion.
- **PDFs** (file_type = `application/pdf`): Mostrar con icono de descarga/PDF.
- **Al hacer click en imagen**: Abrir un dialog/drawer fullscreen (mobile) o modal (desktop) con navegacion izquierda/derecha entre todas las imagenes del feedback item.

**Componente nuevo**: `ImageGalleryDialog` dentro de `src/pages/PublicRoadmap.tsx` (inline, no necesita archivo separado).
- Estado: `selectedFeedbackImages` (array de attachments de imagen) y `currentImageIndex`.
- En mobile: usar `DialogContent` con `className="max-w-full h-full"` para fullscreen.
- Botones de navegacion (ChevronLeft/ChevronRight) para recorrer imagenes.
- Soporte de swipe en mobile via touch events.

---

### 3. Panel de mantenimiento: filtro de estado + cambio de estado + bugs + switch de visibilidad (UnifiedFeedbackList.tsx)

**3a. Filtro adicional de Estado**
- Agregar un segundo `Select` para filtrar por status: `all`, `new`, `reviewed`, `planned`, `in_progress`, `done`, `declined`, `open`, `closed`.

**3b. Cambio de estado desde el panel**
- Cada item tendra un dropdown para cambiar su status.
- Para items `public` (roadmap_feedback): actualizar `roadmap_feedback.status`.
- Para items `beta`/`bug` (beta_feedback): actualizar `beta_feedback.status`.
- Refrescar la lista despues del cambio.

**3c. Registrar Bugs**
- Agregar boton "Reportar Bug" que abre un dialog simple con titulo + descripcion.
- Inserta en `beta_feedback` con `type: 'bug'` y el `app_id` actual.

**3d. Switch de visibilidad publica**
- Agregar columna `is_hidden` a `roadmap_feedback` (nueva migracion SQL).
- Cada item publico tendra un switch (Eye/EyeOff) para ocultarlo del roadmap publico.
- En `PublicRoadmap.tsx`, filtrar los feedback con `is_hidden = true`.

**Nota sobre la columna `is_hidden`**: Se necesita agregar esta columna a la tabla `roadmap_feedback` via migracion SQL:
```sql
ALTER TABLE roadmap_feedback ADD COLUMN is_hidden boolean NOT NULL DEFAULT false;
```

---

### 4. Traducciones

Agregar keys nuevas a los archivos de traduccion `src/i18n/{es,en}/apps.json`:
- `hub.statusFilter`, `hub.allStatuses`, `hub.reportBug`, `hub.bugTitle`, `hub.bugDescription`, `hub.visibility`, `hub.hidden`, `hub.visible`

---

### Archivos a modificar

| Archivo | Cambios |
|---------|---------|
| `src/pages/PublicRoadmap.tsx` | Fix idioma, attachments como thumbnails/PDF icons, galeria de imagenes fullscreen |
| `src/components/beta/UnifiedFeedbackList.tsx` | Filtro de estado, cambio de estado, boton de bugs, switch de visibilidad |
| `src/i18n/es/apps.json` | Nuevas traducciones para feedback management |
| `src/i18n/en/apps.json` | Nuevas traducciones para feedback management |
| Migracion SQL | Agregar columna `is_hidden` a `roadmap_feedback` |

