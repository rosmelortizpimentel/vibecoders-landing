

## Hacer /apps y detalle de app 100% responsive

### Problemas identificados

1. **MyApps.tsx (lista /apps)**: Container `max-w-3xl` limita ancho pero la card `AppCard` usa clases hardcoded como `bg-white`, `text-[#1c1c1c]` y oculta elementos clave en mobile (status badge, switch de visibilidad, drag handle) sin alternativa.

2. **MyAppHub.tsx (detalle /apps/:appId)**: Los tabs usan `max-w-[90%]` que puede ser demasiado estrecho en mobile. El container principal alterna entre `max-w-5xl` y `max-w-full` pero no tiene padding responsivo adecuado.

3. **AppEditor.tsx**: Usa colores hardcoded (`text-[#1c1c1c]`, `border-gray-300`, `bg-white`) en vez de tokens de tema. El grid `grid-cols-1 sm:grid-cols-2` esta bien pero algunos inputs pueden desbordarse.

4. **AppCard.tsx**: Oculta status badge y toggle de visibilidad completamente en mobile (`hidden md:flex`, `hidden md:block`), sin ofrecer alternativa tactil.

---

### Cambios por archivo

#### 1. `src/pages/MyApps.tsx`
- Cambiar container de `max-w-3xl` a `max-w-4xl` para mejor uso del espacio
- Asegurar padding responsivo `px-3 sm:px-4` (ya existe)

#### 2. `src/components/me/AppCard.tsx`
- **Mobile**: Mostrar status badge en mobile (quitar `hidden md:flex`, usar tamanio compacto)
- **Mobile**: Mostrar toggle de visibilidad siempre (quitar `hidden md:block`)
- **Mobile**: Reducir gap y padding en pantallas pequenas
- Reemplazar colores hardcoded (`bg-white`, `text-[#1c1c1c]`) por tokens de tema (`bg-card`, `text-foreground`)

#### 3. `src/pages/MyAppHub.tsx`
- Tabs: cambiar `max-w-[90%]` a `w-full` en mobile, manteniendo centrado en desktop
- Container: ajustar padding para mobile `px-2 sm:px-3 md:px-4`
- Tabs en mobile: hacer scroll horizontal mas fluido, con texto mas compacto

#### 4. `src/components/me/AppEditor.tsx`
- Reemplazar todos los colores hardcoded por tokens de tema:
  - `text-[#1c1c1c]` -> `text-foreground`
  - `border-gray-300` -> `border-border`
  - `bg-white` -> `bg-background`
  - `text-gray-500/400` -> `text-muted-foreground`
  - `focus:border-[#3D5AFE]` -> `focus:border-primary`
  - `focus:ring-[#3D5AFE]` -> `focus:ring-primary`
  - `text-[#3D5AFE]` -> `text-primary`
  - `hover:bg-[#3D5AFE]/5` -> `hover:bg-primary/5`
- Screenshots: asegurar que el scroll horizontal funcione bien en tactil
- Verificacion: hacer el layout `flex-col` en mobile si se desborda

---

### Detalle tecnico

**AppCard responsive (antes vs despues)**:

```text
ANTES (mobile):
[Logo] [Nombre + URL]                    <- sin status, sin toggle

DESPUES (mobile):
[Logo] [Nombre + URL] [Status] [Toggle]  <- todo visible, compacto
```

**MyAppHub tabs responsive**:

```text
ANTES: max-w-[90%] fijo en todas las pantallas
DESPUES: w-full en mobile, max-w-[90%] solo en md+
```

**Tokens de tema en AppEditor**: Se reemplazan ~15 instancias de colores hardcoded para que funcionen correctamente en modo oscuro y mantengan consistencia visual.

### Archivos a modificar (4 archivos)

| Archivo | Cambio |
|---------|--------|
| `src/pages/MyApps.tsx` | Ajustar max-width del container |
| `src/components/me/AppCard.tsx` | Mostrar status y toggle en mobile, usar tokens de tema |
| `src/pages/MyAppHub.tsx` | Tabs full-width en mobile, padding responsivo |
| `src/components/me/AppEditor.tsx` | Reemplazar colores hardcoded por tokens de tema |

