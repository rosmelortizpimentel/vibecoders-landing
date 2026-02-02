

# Plan: Ajustes de UI en Banner y Controles del Dashboard /me

## Resumen de Cambios

Se realizarán las siguientes mejoras en la sección de edición del perfil:

1. **Icono de eliminar banner en hover** - Mostrar al pasar el mouse sobre el banner
2. **Reubicar controles de alineación del avatar** - Moverlos debajo de la foto del avatar
3. **Agregar controles de alineación del banner** - Solo visible cuando hay banner cargado
4. **Corregir color de labels** - Cambiar de blanco a #1C1C1C para legibilidad
5. **Agregar campo `banner_position`** - Para guardar la alineación del banner

---

## Cambios Detallados

### 1. Estructura del Banner con Controles en Hover

El banner tendrá dos tipos de overlay en hover:
- **Icono de cámara** (centro) - Para subir/cambiar imagen
- **Icono de eliminar** (esquina superior derecha) - Solo si hay banner, visible en hover

```
┌───────────────────────────────────────────┐
│                              [🗑️ hover]   │  <- Solo visible con banner
│                                           │
│              [📷 hover]                   │  <- Siempre visible en hover
│                                           │
└───────────────────────────────────────────┘
```

### 2. Controles de Alineación del Banner

Debajo del banner, mostrar controles de alineación **solo cuando hay un banner cargado**:

```
┌───────────────────────────────────────────┐
│             (Banner Image)                │
└───────────────────────────────────────────┘
  [◀️ Izq] [⬆️ Centro] [▶️ Der]   <- Solo si hay banner
```

Valores: `left` (object-left), `center` (object-center), `right` (object-right)

### 3. Controles de Alineación del Avatar

Mover los controles de alineación del avatar **debajo del avatar**, no en la cabecera del banner:

```
      ┌──────┐
      │ 😊   │  <- Avatar
      └──────┘
  [◀️ Izq] [⬆️ Centro] [▶️ Der]
```

### 4. Corrección de Labels

Cambiar todos los labels de color `text-foreground` a `text-[#1C1C1C]` para garantizar legibilidad.

---

## Sección Técnica

### Nuevo Campo en Base de Datos

Se necesita agregar `banner_position` a la tabla `profiles`:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_position text DEFAULT 'center';
```

Valores posibles: `'left'`, `'center'`, `'right'`

### Cambios en ProfileData Interface

```typescript
export interface ProfileData {
  // ... campos existentes
  avatar_position: 'left' | 'center' | 'right' | null;
  banner_position: 'left' | 'center' | 'right' | null;  // NUEVO
}
```

### Cambios en useProfileEditor.ts

1. Agregar `banner_position` a DEFAULT_PROFILE
2. Incluir `banner_position` en la función `saveProfile`

### Cambios en ProfileTab.tsx

**Estructura actualizada del Banner:**

```tsx
{/* Banner Section */}
<section className="space-y-2">
  <Label className="text-[#1C1C1C]">Banner</Label>
  
  {/* Banner con overlay de hover para cámara y eliminar */}
  <div className="relative h-32 bg-muted rounded-lg overflow-hidden cursor-pointer group">
    {profile.banner_url ? (
      <img 
        src={profile.banner_url} 
        alt="Banner" 
        className={cn("w-full h-full", objectPositionClass)}
      />
    ) : (
      <div className="flex flex-col items-center justify-center h-full">
        <ImagePlus className="h-8 w-8 mb-2" />
        <span className="text-sm">Añadir banner</span>
      </div>
    )}
    
    {/* Camera overlay - click to upload */}
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
      <Camera className="h-6 w-6 text-white" />
    </div>
    
    {/* Delete button - top right corner, only with banner */}
    {profile.banner_url && (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); handleDeleteBanner(); }}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
      >
        <Trash2 className="h-4 w-4 text-white" />
      </button>
    )}
  </div>
  
  {/* Banner Alignment Controls - only when banner exists */}
  {profile.banner_url && (
    <div className="flex items-center justify-center gap-1 p-1 bg-muted rounded-md w-fit mx-auto">
      <button onClick={() => onUpdate({ banner_position: 'left' })} ...>
        <AlignLeft />
      </button>
      <button onClick={() => onUpdate({ banner_position: 'center' })} ...>
        <AlignCenter />
      </button>
      <button onClick={() => onUpdate({ banner_position: 'right' })} ...>
        <AlignRight />
      </button>
    </div>
  )}
</section>

{/* Avatar + Name Section */}
<section>
  <div className="flex flex-col sm:flex-row items-start gap-4">
    {/* Avatar con controles debajo */}
    <div className="flex flex-col items-center gap-2">
      <Avatar ... />
      
      {/* Avatar Position Controls */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
        <button onClick={() => onUpdate({ avatar_position: 'left' })} ...>
          <AlignLeft />
        </button>
        <button onClick={() => onUpdate({ avatar_position: 'center' })} ...>
          <AlignCenter />
        </button>
        <button onClick={() => onUpdate({ avatar_position: 'right' })} ...>
          <AlignRight />
        </button>
      </div>
    </div>
    
    {/* Name and Username fields */}
    <div className="flex-1 w-full space-y-4">
      ...
    </div>
  </div>
</section>
```

### Cambios en ProfilePreview.tsx

Agregar clase de posición del banner:

```typescript
const bannerPosition = profile.banner_position || 'center';
const bannerPositionClasses = {
  left: 'object-left',
  center: 'object-center',
  right: 'object-right'
};

// En el img del banner:
<img 
  src={profile.banner_url} 
  className={`w-full h-full object-cover ${bannerPositionClasses[bannerPosition]}`}
/>
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useProfileEditor.ts` | Agregar `banner_position` al interface y saveProfile |
| `src/components/me/ProfileTab.tsx` | Reestructurar UI de banner y avatar con nuevos controles |
| `src/components/me/ProfilePreview.tsx` | Aplicar posición del banner en la vista previa |
| `src/integrations/supabase/types.ts` | Se actualizará automáticamente |

---

## Migración de Base de Datos Requerida

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_position text DEFAULT 'center';
```

---

## Resumen Visual de la Nueva UI

```
┌─────────────────────────────────────────────────────────┐
│ Label: Banner (color: #1C1C1C)                          │
├─────────────────────────────────────────────────────────┤
│                                            [🗑️ hover]   │
│                                                         │
│                    [📷 hover]                           │ <- Banner
│                                                         │
├─────────────────────────────────────────────────────────┤
│               [◀️] [⬆️] [▶️] Alinear banner             │ <- Solo con banner
├─────────────────────────────────────────────────────────┤
│                                                         │
│    ┌────────┐                                           │
│    │  😊    │   [Nombre *]                              │ <- Avatar + campos
│    └────────┘   [Username]                              │
│  [◀️] [⬆️] [▶️]  [Pioneer Badge toggle]                 │ <- Alineación avatar
│                                                         │
└─────────────────────────────────────────────────────────┘
```

