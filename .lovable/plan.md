
# Footer Redesign - Premium Minimalist Style

## Overview
Transformar el footer actual de estilo centrado con fondo azul a un diseño premium minimalista estilo "Lovable/Linear", con layout horizontal y storytelling sutil.

## Cambios de Diseño

### Estructura Visual
```text
┌────────────────────────────────────────────────────────────────┐
│ border-t border-stone-200 (línea sutil superior)               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  © 2026 Vibecoders.la          Construido a -13°C en 🇨🇦 por  │
│  (text-stone-500)              [Rosmel Ortiz] ← LinkedIn link  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
  bg-[#F6F5F4] o transparent (sin bloques de color sólido)
```

### Especificaciones de Estilo
- **Fondo**: `bg-[#F6F5F4]` (mismo off-white que el BentoGrid) o transparent
- **Borde superior**: `border-t border-stone-200` (sutil)
- **Layout**: Flexbox con `justify-between` (copyright izquierda, créditos derecha)
- **Tipografía**: `text-sm text-stone-500` para texto general
- **Énfasis**: `-13°C` en `font-semibold text-stone-700` para llamar la atención
- **Link**: Nombre vinculado a LinkedIn con hover sutil

## Archivos a Modificar

### 1. `src/i18n/es/common.json`
Actualizar las traducciones del footer:
- `builtAt`: "Construido a"
- `temperature`: "-13°C"
- `inCanada`: "en Canadá"
- `by`: "por"
- `authorName`: "Rosmel Ortiz"
- `linkedIn`: URL del perfil

### 2. `src/components/Footer.tsx`
- Eliminar el icono MapPin
- Cambiar layout de centrado vertical a horizontal con `justify-between`
- Lado izquierdo: Copyright simple
- Lado derecho: Frase con temperatura destacada + link a LinkedIn
- Aplicar colores stone en lugar de muted-foreground
- Añadir emoji de bandera 🇨🇦

## Resultado Esperado
Un footer limpio y minimalista que cuenta una historia ("construido en frío en Canadá") mientras mantiene profesionalismo, siguiendo el estilo premium de Lovable/Linear.
