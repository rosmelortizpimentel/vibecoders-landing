
# Plan: Correcciones de UI y Reorganización de Redes Sociales

## Problemas a Resolver

1. **Sección de preview de fuente (remarcada)**: Remover la caja con "The quick brown fox..." del `FontSelector.tsx`
2. **Switch con color morado**: El componente Switch usa `bg-primary` que es morado. Cambiar a gris/blanco
3. **Footer del preview**: Cambiar texto a "Vista previa de tu nuevo hogar. Echarle un vistazo" con enlace al perfil
4. **Redes sociales - nuevo orden y Lovable primero**:
   - Agregar campo `lovable` a la base de datos
   - Orden: Lovable → LinkedIn → X (logo actual) → Instagram → YouTube → TikTok → GitHub → Email
   - Usar el logo de Lovable (subir a assets)

---

## Cambios a Realizar

### 1. `src/components/me/FontSelector.tsx` - Remover preview de fuente

Eliminar la caja de preview con "The quick brown fox jumps over the lazy dog":

```tsx
// ELIMINAR estas líneas (74-82):
{/* Preview */}
<div className="p-4 rounded-lg border border-gray-200 bg-gray-50" style={{ fontFamily: value }}>
  <p className="text-lg font-semibold text-[#1c1c1c]">The quick brown fox...</p>
  <p className="text-sm text-gray-500 mt-1">ABCDEFGHIJKLMNOPQRSTUVWXYZ...</p>
</div>
```

### 2. `src/components/ui/switch.tsx` - Corregir color del toggle

Cambiar `bg-primary` por un gris neutro:

```tsx
// Antes
"data-[state=checked]:bg-primary"

// Después
"data-[state=checked]:bg-gray-400"
```

El thumb debe ser blanco puro:

```tsx
// Antes
"bg-background"

// Después
"bg-white"
```

### 3. Base de datos - Agregar campo `lovable`

Crear migración SQL para agregar el campo al perfil:

```sql
ALTER TABLE profiles ADD COLUMN lovable TEXT;
```

### 4. `src/integrations/supabase/types.ts` - Actualizar tipos

Agregar `lovable: string | null` a la tabla `profiles`.

### 5. `src/hooks/useProfileEditor.ts` - Agregar lovable al ProfileData

```typescript
export interface ProfileData {
  // ... campos existentes
  lovable: string | null;  // Nuevo campo
}
```

Y en `saveProfile`:
```typescript
lovable: data.lovable,
```

### 6. Copiar logo de Lovable al proyecto

Copiar `user-uploads://lovable.png` a `src/assets/logos/lovable-icon.png`

### 7. `src/components/me/ProfileSocials.tsx` - Nuevo orden con Lovable

Crear componente de icono Lovable usando el logo importado y reordenar:

```tsx
import lovableIcon from '@/assets/logos/lovable-icon.png';

// X icon (no Twitter)
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// Lovable icon component
const LovableIcon = ({ className }: { className?: string }) => (
  <img src={lovableIcon} alt="Lovable" className={className} />
);

const socialFields = [
  { key: 'lovable', label: 'Lovable', icon: LovableIcon, placeholder: 'https://lovable.dev/@usuario' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/usuario' },
  { key: 'twitter', label: 'X', icon: XIcon, placeholder: 'https://x.com/usuario' },  // Cambiado a X
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/usuario' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@canal' },
  { key: 'tiktok', label: 'TikTok', icon: TikTokIcon, placeholder: 'https://tiktok.com/@usuario' },
  { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/usuario' },
  { key: 'email_public', label: 'Email', icon: Mail, placeholder: 'email@ejemplo.com' },
] as const;
```

### 8. `src/components/me/ProfilePreview.tsx` - Actualizar footer y socialConfig

**Footer nuevo:**
```tsx
<div className="py-3 md:py-4 text-center border-t border-white/10" style={{ background: '...' }}>
  <p className="text-[10px] md:text-xs text-white/70">
    Vista previa de tu nuevo hogar.{' '}
    <a 
      href={`https://vibecoders.la/@${username}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-white underline hover:no-underline"
    >
      Echarle un vistazo
    </a>
  </p>
</div>
```

**Social config actualizado con mismo orden y X icon:**
```tsx
const socialConfig = [
  { key: 'lovable', icon: LovableIcon, getUrl: (v: string) => v.startsWith('http') ? v : `https://lovable.dev/@${v}` },
  { key: 'linkedin', icon: Linkedin, getUrl: (v: string) => v.startsWith('http') ? v : `https://linkedin.com/in/${v}` },
  { key: 'twitter', icon: XIcon, getUrl: (v: string) => v.startsWith('http') ? v : `https://x.com/${v}` },
  { key: 'instagram', icon: Instagram, getUrl: (v: string) => v.startsWith('http') ? v : `https://instagram.com/${v}` },
  { key: 'youtube', icon: Youtube, getUrl: (v: string) => v.startsWith('http') ? v : `https://youtube.com/@${v}` },
  { key: 'tiktok', icon: TikTokIcon, getUrl: (v: string) => v.startsWith('http') ? v : `https://tiktok.com/@${v}` },
  { key: 'github', icon: Github, getUrl: (v: string) => v.startsWith('http') ? v : `https://github.com/${v}` },
  { key: 'email_public', icon: Mail, getUrl: (v: string) => `mailto:${v}` },
] as const;
```

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/me/FontSelector.tsx` | Eliminar preview de fuente |
| `src/components/ui/switch.tsx` | Cambiar `bg-primary` → `bg-gray-400`, thumb a `bg-white` |
| `supabase/migrations/` | Nueva migración para agregar campo `lovable` |
| `src/integrations/supabase/types.ts` | Agregar `lovable: string \| null` |
| `src/hooks/useProfileEditor.ts` | Agregar `lovable` al interface y save |
| `src/assets/logos/lovable-icon.png` | Copiar logo de Lovable |
| `src/components/me/ProfileSocials.tsx` | Reordenar redes, agregar Lovable, usar X icon |
| `src/components/me/ProfilePreview.tsx` | Actualizar footer con link y socialConfig |

---

## Orden Final de Redes Sociales

1. Lovable (nuevo)
2. LinkedIn
3. X (antes Twitter, con logo nuevo)
4. Instagram
5. YouTube
6. TikTok
7. GitHub
8. Email

---

## Detalles Técnicos

### Icono de X (antes Twitter)

El logo actual de X es diferente al pajarito de Twitter:

```svg
<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
```

### Icono de Lovable

Se usará como imagen importada ya que es un gradiente complejo que no se puede representar como SVG de un solo color.
