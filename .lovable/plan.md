
# Plan: Corregir Estilos de Redes Sociales

## Problemas Identificados

1. **Input de redes sociales**: El texto aparece blanco porque no tiene un color explícito definido
2. **Botón seleccionado**: Usa color magenta `#E91E63` en lugar de `#1c1c1c`
3. **Iconos en vista previa**: Tienen fondo semi-transparente `bg-white/10` en lugar de fondo blanco sólido

---

## Cambios a Realizar

### 1. `src/components/me/ProfileSocials.tsx`

**Input con texto legible:**
```tsx
// Agregar text-[#1c1c1c] al Input
className="flex-1 bg-white border border-gray-200 text-[#1c1c1c] focus:border-[#3D5AFE] focus:outline-none focus:ring-0"
```

**Botón seleccionado con color oscuro:**
```tsx
// Cambiar de bg-[#E91E63] a bg-[#1c1c1c]
isSelected
  ? 'bg-[#1c1c1c] text-white shadow-md'
  : hasValue
    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
```

### 2. `src/components/me/ProfilePreview.tsx`

**Iconos de redes sociales con fondo blanco:**
```tsx
// Cambiar de bg-white/10 hover:bg-white/20 a bg-white
className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-white hover:bg-white/90 transition-colors"

// Cambiar color de iconos de text-white a color oscuro
<Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#1c1c1c]" />
```

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/me/ProfileSocials.tsx` | Agregar `text-[#1c1c1c]` al Input, cambiar color seleccionado a `#1c1c1c` |
| `src/components/me/ProfilePreview.tsx` | Fondo blanco sólido para iconos, texto oscuro |

---

## Resultado Visual Esperado

- **Editor de redes**: Input con texto negro legible, botón seleccionado en gris oscuro profesional
- **Vista previa**: Iconos de redes sociales con círculo blanco sólido que destaca sobre el fondo azul
