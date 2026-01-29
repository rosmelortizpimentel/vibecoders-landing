

# Plan: Añadir Degradado Sutil en el Header

## Objetivo
Agregar un degradado muy sutil en la parte superior de la sección Hero que vaya de blanco transparente hacia transparente, creando un efecto de iluminación suave en la parte de arriba.

## Diseño Visual

```text
┌─────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ← Blanco 5-10% opacity
│▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│ ← Transición suave
│                                         │
│           Fondo azul normal             │ ← Sin degradado
│                                         │
└─────────────────────────────────────────┘
```

## Implementación

### Archivo: `src/components/HeroSection.tsx`

Añadir un overlay con degradado como primer elemento dentro del `<section>`:

```tsx
<section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16 overflow-hidden">
  {/* Top gradient overlay - white fade */}
  <div 
    className="pointer-events-none absolute inset-x-0 top-0 h-32 md:h-48"
    style={{
      background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 0%, transparent 100%)'
    }}
  />
  
  {/* ... resto del contenido */}
</section>
```

## Detalles Técnicos

- **Altura del degradado**: 128px en móvil, 192px en desktop (`h-32 md:h-48`)
- **Opacidad**: 8% de blanco en la parte superior, decayendo a transparente
- **pointer-events-none**: El overlay no bloquea clics ni interacciones
- **Posicionamiento**: Absoluto, anclado al top de la sección

## Alternativa más sutil

Si 8% es muy visible, se puede ajustar a 5%:
```css
rgba(255, 255, 255, 0.05)
```

## Archivo a Modificar

- `src/components/HeroSection.tsx` - Añadir div con degradado

