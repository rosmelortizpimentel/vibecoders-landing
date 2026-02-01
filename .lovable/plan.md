

# Plan: Badge "PIONEER" para Founding Members

## Resumen

Agregaremos un distintivo premium "PIONEER" que aparecerá junto al nombre del usuario en su perfil. Este badge solo se mostrará para miembros que tengan la bandera `is_pioneer` activada en la base de datos.

## Diseño Visual

El badge tendrá un estilo exclusivo Gold/Amber:
- **Forma**: Pill-shaped (pastilla redondeada)
- **Colores**: `bg-amber-100 text-amber-700 border border-amber-200`
- **Contenido**: Icono de estrella + texto "PIONEER"
- **Tamaño**: Compacto, alineado verticalmente con el nombre
- **Interacción**: Tooltip al hover mostrando "Early Founding Member"

## Archivos a Modificar

### 1. Base de Datos
- Nueva migración SQL para agregar columna `is_pioneer` (boolean, default false) a la tabla `profiles`

### 2. Tipos y Hooks

**`src/hooks/useProfileEditor.ts`**
- Agregar `is_pioneer: boolean` al interface `ProfileData`

**`src/hooks/usePublicProfile.ts`**
- Agregar `is_pioneer: boolean` al interface `PublicProfile`

### 3. Edge Function

**`supabase/functions/get-public-profile/index.ts`**
- Incluir `is_pioneer` en la consulta del perfil
- Retornar el campo en la respuesta pública

### 4. Componente de Badge

**Nuevo: `src/components/PioneerBadge.tsx`**
- Componente reutilizable con el badge dorado
- Incluye Tooltip con mensaje "Early Founding Member"
- Icono Star de lucide-react

### 5. Vistas de Perfil

**`src/components/me/ProfilePreview.tsx`**
- Importar y mostrar `PioneerBadge` junto al nombre del usuario
- Solo visible si `profile.is_pioneer === true`

**`src/components/PublicProfileCard.tsx`**
- Importar y mostrar `PioneerBadge` debajo del nombre
- Solo visible si `profile.is_pioneer === true`

## Detalles Tecnicos

### Migracion SQL
```sql
ALTER TABLE profiles 
ADD COLUMN is_pioneer boolean NOT NULL DEFAULT false;
```

### Componente PioneerBadge
```tsx
// Usa Tooltip de radix-ui
// Icono Star de lucide-react
// Clases: bg-amber-100 text-amber-700 border-amber-200
// Texto: "PIONEER"
// Tooltip: "Early Founding Member"
```

### Ubicacion del Badge

En **ProfilePreview** (editor):
```
[Nombre del Usuario] [PIONEER badge]
```

En **PublicProfileCard** (perfil publico):
```
          Nombre
        @username
      [PIONEER badge]  <- Debajo del username
```

## Resultado Esperado

Los usuarios con `is_pioneer = true` veran un badge dorado premium junto a su nombre que los distingue como miembros fundadores, sin afectar el diseno de usuarios regulares.

