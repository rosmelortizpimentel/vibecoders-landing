

## Cambios en App Hub y Mi Red

### 1. App Hub -- Eliminar header redundante del RoadmapEditor

**Problema**: Dentro del tab Roadmap, el `RoadmapEditor` muestra su propio header con back arrow, logo, nombre de app, switch Publico/Privado, toggle Roadmap/Feedback y boton Branding. Esto es redundante porque el header global ya muestra el detalle de la app y los tabs del Hub ya controlan la navegacion.

**Solucion**:
- Eliminar el bloque header interno del `RoadmapEditor` (lineas 495-557: back button, logo, nombre, switch publico/privado, toggle roadmap/feedback, boton branding)
- Mover el switch **Privado/Publico** al nivel del Hub, colocandolo al lado derecho del boton "Branding" en la fila de tabs (o justo despues)
- El toggle Roadmap/Feedback y el boton Branding ya no seran necesarios en ese header porque la navegacion se hace por tabs del Hub

**Nuevo layout de tabs en MyAppHub**:
```
[Info] [Roadmap] [Feedback] [Squad] ............ [Privado/Publico switch]
```

El switch controlara `roadmap_settings.is_public` y se mostrara solo cuando el tab activo sea `roadmap`.

### 2. Mi Red -- Layout compacto y tab Comunidad

**Problema**: El subtitulo "Tu circulo de codigo y colaboracion" ocupa espacio innecesario. Los tabs Seguidores/Siguiendo estan separados de la barra de busqueda.

**Cambios**:
- Eliminar el subtitulo descriptivo
- Poner tabs (Seguidores, Siguiendo, Comunidad) y la barra de busqueda en la misma fila
- Agregar un tercer tab **Comunidad** que muestre usuarios registrados que el usuario actual NO sigue, para descubrir nuevas conexiones

**Layout propuesto**:
```
[Seguidores 16] [Siguiendo 65] [Comunidad] .............. [Buscar conexion...]
```

### 3. Tab Comunidad -- Implementacion

- Crear una nueva query en `useDashboardStats` (o un hook separado) que traiga perfiles publicos que el usuario no sigue
- Query: `SELECT profiles WHERE id NOT IN (following_ids) AND id != current_user_id LIMIT 50`
- Reutilizar el mismo componente `ViberCard` que ya existe para mostrar cada perfil
- Incluir filtrado por el mismo campo de busqueda

---

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/RoadmapEditor.tsx` | Eliminar header interno (back, logo, nombre, switch, toggles, branding) |
| `src/pages/MyAppHub.tsx` | Agregar switch Privado/Publico junto a los tabs, pasar roadmap settings |
| `src/pages/Vibers.tsx` | Eliminar subtitulo, reorganizar tabs + busqueda en una fila, agregar tab Comunidad |
| `src/hooks/useDashboardStats.ts` | Agregar query para obtener perfiles de la comunidad (no seguidos) |
| `src/i18n/en/vibers.json` | Agregar clave `communityTab` |
| `src/i18n/es/vibers.json` | Agregar clave `communityTab` |
| `src/i18n/fr/vibers.json` | Agregar clave `communityTab` |
| `src/i18n/pt/vibers.json` | Agregar clave `communityTab` |

### Detalles tecnicos

**RoadmapEditor.tsx**: Se eliminara todo el bloque del header (lineas 493-557). El componente empezara directamente con el contenido del Kanban/Feedback. El `viewMode` toggle (roadmap vs feedback) se eliminara ya que la navegacion entre Roadmap y Feedback se hace via los tabs del Hub.

**MyAppHub.tsx**: Se agregara el hook `useRoadmap(appId)` para acceder a `roadmap.settings.is_public` y `roadmap.updateSettings()`. El switch se renderizara condicionalmente solo en el tab `roadmap`, alineado a la derecha de la barra de tabs.

**Vibers.tsx -- Tab Comunidad**: Se creara un nuevo estado `community` dentro de `useDashboardStats` con una query que seleccione perfiles con `id NOT IN (seguidos + yo)`. Los resultados usaran el mismo `ViberCard` existente.

