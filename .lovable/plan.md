
# Plan: Mejorar el control de visibilidad del Pioneer Badge

## Resumen
Ajustar el switch del Pioneer Badge en el editor de perfil para que incluya un texto "Mostrar badge" y asegurar que la vista previa respete el estado del switch.

## Cambios a realizar

### 1. ProfileTab.tsx - Actualizar el texto del switch
Cambiar la etiqueta "Early Founding Member" por un texto que incluya ambas partes:
- El nombre del badge: "Early Founding Member"  
- Un texto de accion: "Mostrar badge"

El layout sera:
```
[Badge icon] Early Founding Member   Mostrar badge [Switch]
```

### 2. ProfilePreview.tsx - Respetar show_pioneer_badge
Modificar la condicion para mostrar el PioneerBadge en la preview:

**Antes:**
```tsx
{profile.is_pioneer && (
  <PioneerBadge />
)}
```

**Despues:**
```tsx
{profile.is_pioneer && profile.show_pioneer_badge && (
  <PioneerBadge />
)}
```

Esto hara que cuando el switch este apagado (izquierda), el badge no aparezca en la vista previa.

## Comportamiento esperado
- Switch OFF (izquierda): Badge NO visible en preview
- Switch ON (derecha): Badge visible en preview
- El switch solo aparece para usuarios con `is_pioneer = true`

## Archivos a modificar
1. `src/components/me/ProfileTab.tsx` - Actualizar texto del control
2. `src/components/me/ProfilePreview.tsx` - Agregar condicion `show_pioneer_badge`
