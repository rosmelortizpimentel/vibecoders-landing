
# Plan: Rediseño Completo del Perfil Preview (Estilo App Móvil)

## Resumen

Transformar el preview del perfil de un estilo "navegador web con fondo azul pesado" a un diseño limpio tipo app móvil inspirado en la imagen de referencia: header con hamburger menu, fondo blanco, banner customizable, y secciones que se ocultan automáticamente cuando están vacías.

---

## Cambios Principales

### 1. Nuevo Header del Preview (Estilo App)
- **Izquierda**: Icono de menú hamburguesa
- **Centro**: Logo "VIBECODERS" (solo texto, sin icono)
- **Derecha**: Vacío (sin icono de usuario)

### 2. Eliminar Fondo Azul Gradiente
- Remover el gradiente azul `#4F46E5 → #3D5AFE → #2563EB`
- Usar fondo blanco limpio para toda la tarjeta

### 3. Banner Personalizable
- Añadir campo `banner_url` a ProfileData
- Crear sección en ProfileTab para cargar banner
- Mostrar banner en la parte superior del perfil (similar a la imagen)
- El avatar se posiciona semi-superpuesto al banner

### 4. Reorganización del Contenido
```text
┌────────────────────────────────────────┐
│  ≡     VIBECODERS                      │  ← Header
├────────────────────────────────────────┤
│                                        │
│  [        BANNER IMAGE         ]       │  ← Banner (si existe)
│       ┌──────┐                         │
│       │ AVT  │ (superpuesto)           │
└───────┴──────┴─────────────────────────┘
│                                        │
│  Rosmel Ortiz                          │  ← Nombre
│  @username                             │  ← Username
│  ○ ○ ○ ○ ○ ○                           │  ← Iconos redes sociales
│                                        │
│  Always building.                      │  ← Bio (si existe)
│  📍 Ontario, Canada                    │  ← Location (si existe)
│  🔗 rosmelortiz.com                    │  ← Website (si existe)
│                                        │
├────────────────────────────────────────┤
│  [App Cards - como actualmente]        │  ← Apps
└────────────────────────────────────────┘
```

### 5. Secciones Condicionales (Sin Espacios Vacíos)
Cada sección solo se renderiza si tiene contenido:
- **Bio**: Solo si `profile.bio` tiene valor
- **Location**: Solo si `profile.location` tiene valor  
- **Website**: Solo si `profile.website` tiene valor
- **Social Icons**: Solo si hay al menos una red activa
- **Apps**: Solo si hay apps visibles

---

## Cambios por Archivo

### 1. `src/hooks/useProfileEditor.ts`
Agregar campo `banner_url` a la interfaz `ProfileData`:
```typescript
export interface ProfileData {
  // ... campos existentes
  banner_url: string | null;  // NUEVO
}
```
Actualizar `saveProfile` para incluir `banner_url`.

### 2. Base de datos (Migración SQL)
Añadir columna `banner_url` a la tabla `profiles`:
```sql
ALTER TABLE profiles ADD COLUMN banner_url TEXT;
```

### 3. `src/integrations/supabase/types.ts`
Actualizar tipos para incluir `banner_url` en profiles.

### 4. `src/components/me/ProfileTab.tsx`
Añadir sección para cargar banner:
```tsx
{/* Banner Upload */}
<section className="space-y-4">
  <Label>Banner</Label>
  <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
    {profile.banner_url ? (
      <img src={profile.banner_url} className="w-full h-full object-cover" />
    ) : (
      <div className="flex items-center justify-center h-full">
        <Camera className="h-8 w-8 text-gray-400" />
      </div>
    )}
    <button onClick={handleBannerClick}>Cambiar</button>
  </div>
</section>
```

### 5. `src/components/me/ProfilePreview.tsx`
Rediseño completo:

**Header nuevo:**
```tsx
<div className="flex items-center justify-between px-4 py-3 bg-white border-b">
  <Menu className="h-5 w-5 text-gray-600" />
  <span className="font-semibold text-gray-900">VIBECODERS</span>
  <div className="w-5" /> {/* Spacer for alignment */}
</div>
```

**Banner + Avatar:**
```tsx
{profile.banner_url && (
  <div className="relative h-24 md:h-32">
    <img src={profile.banner_url} className="w-full h-full object-cover" />
  </div>
)}
<Avatar className="h-20 w-20 mx-auto -mt-10 border-4 border-white">
  ...
</Avatar>
```

**Contenido condicional:**
```tsx
{/* Nombre - siempre visible */}
<h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>

{/* Username */}
{profile.username && (
  <p className="text-gray-500">@{profile.username}</p>
)}

{/* Social Icons Row - solo si hay activas */}
{activeSocials.length > 0 && (
  <div className="flex justify-center gap-2">
    {activeSocials.map(...)}
  </div>
)}

{/* Bio - solo si existe */}
{profile.bio && (
  <p className="text-gray-600 text-center">{profile.bio}</p>
)}

{/* Location - solo si existe */}
{profile.location && (
  <div className="flex items-center gap-2 text-gray-500">
    <MapPin className="h-4 w-4" />
    <span>{profile.location}</span>
  </div>
)}

{/* Website - solo si existe */}
{profile.website && (
  <div className="flex items-center gap-2 text-gray-500">
    <Link className="h-4 w-4" />
    <a href={profile.website}>{profile.website}</a>
  </div>
)}
```

**Apps - mantener estilo actual pero con fondo blanco:**
```tsx
{visibleApps.length > 0 && (
  <div className="border-t pt-4">
    {/* Cards de apps como actualmente */}
  </div>
)}
```

---

## Paleta de Colores Nueva

| Elemento | Actual | Nuevo |
|----------|--------|-------|
| Fondo principal | Gradiente azul | `bg-white` |
| Texto nombre | `text-white` | `text-gray-900` |
| Texto secundario | `text-white/70` | `text-gray-500` |
| Iconos redes | `bg-white` sobre azul | `bg-gray-100` sobre blanco |
| Apps section | `bg-white/10` translúcido | `bg-gray-50` sólido |

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `supabase/migrations/XXXXX_add_banner.sql` | Nueva migración para `banner_url` |
| `src/integrations/supabase/types.ts` | Añadir `banner_url` a profiles |
| `src/hooks/useProfileEditor.ts` | Añadir `banner_url` a ProfileData y saveProfile |
| `src/components/me/ProfileTab.tsx` | Sección para subir banner |
| `src/components/me/ProfilePreview.tsx` | Rediseño completo del preview |

---

## Resultado Visual Esperado

```text
┌─────────────────────────────────────┐
│  ≡        VIBECODERS                │  ← Header minimalista
├─────────────────────────────────────┤
│ [░░░░░░░░░░ BANNER ░░░░░░░░░░░]    │  ← Banner (opcional)
│        ┌───────┐                    │
│        │ AVATAR│ (borde blanco)     │
│        └───────┘                    │
│                                     │
│      Rosmel Ortiz                   │  ← Nombre grande
│      @rosmelortiz                   │  ← Username gris
│                                     │
│   ○ ○ ○ ○ ○ ○  (iconos sociales)   │  ← Redes debajo del nombre
│                                     │
│   Always building.                  │  ← Bio
│                                     │
│   📍 Ontario, Canada 🍁             │  ← Location
│   🔗 rosmelortiz.com                │  ← Website
│                                     │
├─────────────────────────────────────┤
│   [Card App 1]                      │  ← Apps
│   [Card App 2]                      │
└─────────────────────────────────────┘
```

- Fondo completamente blanco
- Sin gradiente azul pesado
- Secciones vacías no ocupan espacio
- Estética limpia tipo app móvil
