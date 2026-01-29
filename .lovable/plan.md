

# Plan: Transformar ProfileFileCard en Perfil de Red Social

## Objetivo
Rediseñar la vista del estado "verified/counting" para simular un perfil de red social con:
- Foto de perfil circular
- Username "@vibecoder"
- Contadores de vistas y likes separados visualmente

## Diseño Visual

```text
┌─────────────────────────────┐
│ ● ● ●                       │  ← Barra macOS
├─────────────────────────────┤
│                             │
│         [FOTO]              │  ← Avatar circular
│       @vibecoder            │  ← Username
│                             │
│   👁 12,847     ❤️ 3,256    │  ← Contadores
│                             │
└─────────────────────────────┘
```

## Cambios

### 1. Copiar imagen de perfil al proyecto
La imagen `user-uploads://image-15.png` se copiará a `src/assets/profile-avatar.png`

### 2. Modificar `src/components/ProfileFileCard.tsx`

**Importar:**
- Añadir import del avatar: `import profileAvatar from "@/assets/profile-avatar.png"`
- Eliminar `CheckCircle` del import (ya no se usa)

**Actualizar el contenido del estado verified:**
```tsx
{cardState === 'verified' || cardState === 'counting' || cardState === 'exploding' ? (
  <>
    {/* Avatar circular */}
    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-[#3D5AFE] mb-2">
      <img 
        src={profileAvatar} 
        alt="Profile" 
        className="w-full h-full object-cover"
      />
    </div>
    
    {/* Username */}
    <span className="text-sm md:text-base font-semibold text-gray-800 mb-3">
      @vibecoder
    </span>
    
    {/* Contadores */}
    <div className="flex items-center gap-4 text-gray-600">
      <div className="flex items-center gap-1.5">
        <Eye className="w-4 h-4 text-[#3D5AFE]" />
        <span className="text-xs md:text-sm font-medium tabular-nums">
          {viewCount.toLocaleString()}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Heart className="w-4 h-4 text-[#3D5AFE] fill-[#3D5AFE]" />
        <span className="text-xs md:text-sm font-medium tabular-nums">
          {likeCount.toLocaleString()}
        </span>
      </div>
    </div>
  </>
)}
```

## Archivos a Modificar

1. **Copiar imagen**: `user-uploads://image-15.png` → `src/assets/profile-avatar.png`
2. **Editar**: `src/components/ProfileFileCard.tsx`
   - Añadir import del avatar
   - Quitar `CheckCircle` del import
   - Actualizar el layout del estado verified con avatar + @vibecoder + contadores

## Resultado Esperado

El card mostrará un perfil estilo red social:
- Avatar circular con borde azul
- Username "@vibecoder" debajo del avatar
- Contadores de vistas y likes con iconos azules en la parte inferior
- Aspecto profesional y limpio

