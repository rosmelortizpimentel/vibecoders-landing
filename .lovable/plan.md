

## Limpieza del Toolbar y Links de Vista Previa con Subdominio

### Resumen

Se eliminan los indicadores de estado (puntos verdes de Roadmap/Feedback y badge de modo auth) y el boton "Ver Pagina Publica" del toolbar. Los links de vista previa pasan a usar el formato de subdominio (`appname.vibecoders.la/roadmap` y `appname.vibecoders.la/feedback`) y son independientes segun los switches de visibilidad.

---

### 1. Eliminar indicadores de estado del toolbar

**Archivo**: `src/pages/MyAppHub.tsx`

Quitar del toolbar (lineas 211-234):
- El indicador verde "Roadmap" / "Roadmap (off)"
- El separador vertical
- El indicador verde "Feedback" / "Feedback (off)"
- El badge de auth mode (Lock Login / User Anon)

Todo el bloque `{/* Left: Status indicators */}` se elimina.

---

### 2. Eliminar boton "Ver Pagina Publica"

**Archivo**: `src/pages/MyAppHub.tsx`

Quitar los dos bloques de links "Ver Pagina Publica" (lineas 261-277) que condicionaban la visibilidad al tab activo.

---

### 3. Links de subdominio independientes

Reemplazar la generacion de `publicRoadmapPath` y `publicFeedbackPath` (lineas 66-68) para usar el formato de subdominio:

```
const publicBasePath = `https://${appSlug}.vibecoders.la`;
const publicRoadmapPath = roadmap.settings?.is_public ? `${publicBasePath}/roadmap` : null;
const publicFeedbackPath = roadmap.settings?.is_feedback_public ? `${publicBasePath}/feedback` : null;
```

Ya no depende de `ownerUsername` para construir la URL.

---

### 4. Toolbar simplificado

El toolbar quedara solo con los botones a la derecha:
- **Branding** (solo en tab Roadmap)
- **Configuracion**

Sin indicadores de estado, sin link de vista previa. Los links de subdominio quedan disponibles en otro lugar si se necesitan (por ejemplo, dentro del Sheet de Configuracion).

---

### Archivos a modificar

| Archivo | Cambios |
|---------|---------|
| `src/pages/MyAppHub.tsx` | Eliminar indicadores de estado, eliminar boton Ver Pagina Publica, actualizar URLs a formato subdominio, simplificar toolbar |

