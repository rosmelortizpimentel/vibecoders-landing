

# Plan: Mejoras de UX para Vista Previa Mobile en Dashboard /me

## Problemas Identificados

1. **Vista Previa en Sheet**: Muestra una barra azul con "Vista Previa" en la parte superior que ocupa espacio innecesario
2. **Botón de cerrar**: Actualmente pequeño y poco visible, debería ser un icono X claro en la esquina
3. **Footer fijo tapa contenido**: El botón "Vista Previa" se superpone al input de redes sociales cuando se expande
4. **Banner no es responsivo en altura**: El alto del banner no se reduce proporcionalmente en pantallas pequeñas

---

## Cambios Propuestos

### Archivo 1: `src/components/me/ProfilePreview.tsx`

**Cambio**: Recibir prop `isMobileSheet` para ocultar condicionalmente el header "Vista Previa" cuando se muestra en el Sheet mobile.

```text
Antes:
- Header siempre visible con "Vista Previa"
- Banner con altura fija (h-24 md:h-32)

Despues:
- Header oculto cuando isMobileSheet = true
- Banner con aspect-ratio responsivo usando CSS aspect-ratio
```

### Archivo 2: `src/components/me/MeLayout.tsx`

**Cambio 1**: Modificar el SheetContent para:
- Quitar el botón de cierre por defecto del Sheet
- Añadir un icono X personalizado en la esquina superior derecha del contenido
- Pasar prop `isMobileSheet={true}` al ProfilePreview

**Cambio 2**: Añadir padding-bottom al contenido principal para evitar que el footer fijo tape el contenido:
- Añadir `pb-20` (80px de padding inferior) al contenedor principal cuando estamos en mobile

### Archivo 3: `src/components/me/ProfileTab.tsx`

**Cambio**: Hacer el banner responsivo en altura:
- Cambiar de `h-32` fijo a aspect-ratio `aspect-[16/5]` que mantiene proporcion 
- Esto hara que el banner se achique proporcionalmente

---

## Detalles Tecnicos

### ProfilePreview.tsx - Cambios

Añadir prop opcional:

```typescript
interface ProfilePreviewProps {
  profile: ProfileData | null;
  apps: AppData[];
  isMobileSheet?: boolean;  // NUEVO
}
```

Condicional para ocultar header:

```tsx
{/* Preview Header - ocultar en mobile sheet */}
{!isMobileSheet && (
  <div className="flex items-center gap-2 px-1">
    <span className="text-sm font-medium text-slate-500">Vista Previa</span>
  </div>
)}
```

### MeLayout.tsx - Cambios

1. Importar icono X de lucide:

```typescript
import { Loader2, Eye, X } from 'lucide-react';
```

2. Modificar SheetContent para quitar el boton de cierre por defecto (clase `[&>button]:hidden`) y añadir uno personalizado:

```tsx
<SheetContent side="bottom" className="h-[90vh] overflow-y-auto p-0 [&>button]:hidden">
  {/* Close button personalizado */}
  <button
    onClick={() => setPreviewOpen(false)}
    className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
  >
    <X className="h-5 w-5 text-gray-600" />
  </button>
  
  <SheetHeader className="sr-only">
    <SheetTitle>Vista previa del perfil</SheetTitle>
  </SheetHeader>
  <ProfilePreview profile={profile} apps={appsHook.apps} isMobileSheet />
</SheetContent>
```

3. Añadir padding-bottom al contenedor principal en mobile:

```tsx
<div className={`mt-4 sm:mt-6 ${isMobile ? 'pb-20' : ''}`}>
```

### ProfileTab.tsx - Banner Responsivo

Cambiar altura fija a aspect-ratio:

```tsx
{/* Banner con aspect ratio responsivo */}
<div 
  className="relative aspect-[16/5] bg-muted rounded-lg overflow-hidden cursor-pointer group"
  onClick={handleBannerClick}
>
```

---

## Resumen de Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/me/ProfilePreview.tsx` | Añadir prop `isMobileSheet`, ocultar header condicionalmente |
| `src/components/me/MeLayout.tsx` | Añadir padding-bottom, boton X personalizado en Sheet |
| `src/components/me/ProfileTab.tsx` | Cambiar banner de altura fija a aspect-ratio responsivo |

---

## Resultado Visual Esperado

1. Vista previa mobile: Sin barra azul, solo icono X circular en esquina superior derecha
2. Contenido editable: Nunca tapado por el boton fijo de "Vista Previa" 
3. Banner: Se achica proporcionalmente al ancho de pantalla

