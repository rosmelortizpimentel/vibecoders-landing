
# Plan: Mejoras en Dashboard /me y Vista Previa

## Resumen de Cambios

Se realizarán 6 mejoras principales en el dashboard `/me`:

1. **Quitar icono del menú** de la vista previa
2. **Usar base path dinámico** para el footer de la vista previa
3. **Corregir problema con el banner** (no se refleja el cambio)
4. **Agregar alineación del avatar** (izquierda, centro, derecha) + eliminar banner
5. **Hacer la página 100% responsive** en móviles

---

## Cambios Detallados

### 1. Quitar Icono del Menú en Vista Previa

**Archivo:** `src/components/me/ProfilePreview.tsx`

- Eliminar el icono `<Menu>` del header de la vista previa
- Mantener solo el logo de Vibecoders

### 2. Usar Base Path Dinámico para el Footer

**Archivo:** `src/components/me/ProfilePreview.tsx`

- En lugar de hardcodear `vibecoders.la/@username`, usar `window.location.origin`
- Esto permitirá que funcione en entornos de prueba (preview) y producción

El footer mostrará:
- En producción: `vibecoders.la/@rosmel`
- En preview: `id-preview--xxxx.lovable.app/@rosmel`

### 3. Corregir Problema del Banner

**Archivo:** `src/hooks/useProfileEditor.ts`

El problema es que al subir un banner con el mismo nombre (`banner.{ext}`), la URL no cambia porque Supabase cachea la imagen. La solución es agregar un timestamp al nombre del archivo para forzar una URL única:

```
${user.id}/banner_${Date.now()}.${fileExt}
```

Esto aplica tanto para `uploadBanner` como para `uploadAvatar`.

### 4. Agregar Alineación del Avatar + Eliminar Banner

**Archivos:**
- `src/hooks/useProfileEditor.ts` - agregar campo `avatar_position`
- `src/components/me/ProfileTab.tsx` - UI para alineación y eliminar banner
- `src/components/me/ProfilePreview.tsx` - aplicar alineación

**Nueva UI en el Banner:**

Se añadirán iconos sobre el banner:
- 3 iconos para posición del avatar: izquierda, centro, derecha (por defecto: centro)
- 1 icono para eliminar el banner

**Diseño:**
```
┌─────────────────────────────────────────┐
│  [📸 Subir]          [⬅️ ⬆️ ➡️] [🗑️]  │ <- Barra de controles
│                                         │
│            (Banner Image)               │
│                                         │
└─────────────────────────────────────────┘
```

### 5. Hacer la Página 100% Responsive

**Archivos:**
- `src/components/me/ProfileTab.tsx`
- `src/components/me/MeLayout.tsx`

**Cambios para móvil:**
- El layout del avatar + campos pasa de horizontal a vertical
- Pioneer badge pasa a otra línea en móvil
- Reducir paddings y gaps en pantallas pequeñas
- Ajustar grid de location/website

---

## Sección Técnica

### Nuevo Campo en Base de Datos

Se necesita agregar el campo `avatar_position` a la tabla `profiles`:

```sql
ALTER TABLE profiles ADD COLUMN avatar_position text DEFAULT 'center';
```

Valores posibles: `'left'`, `'center'`, `'right'`

### Cambios en el Hook `useProfileEditor.ts`

```typescript
// En ProfileData interface
avatar_position: 'left' | 'center' | 'right' | null;

// En saveProfile
avatar_position: data.avatar_position,

// En uploadBanner - agregar timestamp
const filePath = `${user.id}/banner_${Date.now()}.${fileExt}`;
```

### Cambios en ProfilePreview para Alineación

```typescript
// Posición dinámica del avatar
const avatarPosition = profile.avatar_position || 'center';
const positionClasses = {
  left: 'left-4',
  center: 'left-1/2 -translate-x-1/2',
  right: 'right-4'
};
```

### Cambios en ProfileTab para Banner Controls

Nueva sección sobre el banner con:
- Botón de subir imagen
- 3 iconos de alineación: `AlignLeft`, `AlignCenter`, `AlignRight`
- Botón eliminar: icono `Trash2`

### Base Path Dinámico

```typescript
// En ProfilePreview.tsx
const baseUrl = window.location.origin;
// Mostrar: {new URL(baseUrl).host}/@{username}
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/me/ProfilePreview.tsx` | Quitar menú, base path dinámico, alineación avatar |
| `src/components/me/ProfileTab.tsx` | Controles banner (alineación, eliminar), responsive |
| `src/hooks/useProfileEditor.ts` | Timestamp en uploads, nuevo campo avatar_position, deleteBanner |
| `src/integrations/supabase/types.ts` | Actualizar tipos (automático) |

---

## Migración de Base de Datos Requerida

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_position text DEFAULT 'center';
```
