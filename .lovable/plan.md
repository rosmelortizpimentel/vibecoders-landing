

# Plan: Replicar Efecto de Logos Cayendo en Móvil

## Objetivo
Adaptar la experiencia de escritorio/tablet (logos flotando en los lados que caen hacia el "file") para móvil, colocando los logos en círculo alrededor del ProfileFileCard y haciendo que caigan uno por uno hacia el centro.

## Diseño Visual Móvil

```text
┌─────────────────────────────────┐
│  El portafolio oficial para... │ ← Eyebrow
│                                 │
│  Construyes a la velocidad...  │ ← Headline  
│                                 │
│  Deja de enviar links...       │ ← Subheadline
│                                 │
│         🔵    🟢    🔴          │ ← Logos en semicírculo
│       🟣  ┌─────────┐  🟠      │   alrededor del card
│           │   📁    │          │
│       🔵  │  File   │  🟢      │
│           └─────────┘          │
│         🟤    🟡    ⚪          │
│                                 │
│   [     email input      ]     │
│   [ Unirme a la Waitlist ]     │
│                                 │
└─────────────────────────────────┘
```

## Cambios Requeridos

### 1. `src/components/HeroSection.tsx`
- **Reducir padding superior en móvil**: Cambiar `pt-16` a `pt-8 md:pt-16` para subir el contenido
- **Ajustar espaciado**: Reducir `mb-8` después del subheadline en móvil

### 2. `src/components/FloatingLogos.tsx`
**Cambios principales:**
- Agregar posiciones circulares para móvil (10 logos distribuidos en 360°)
- Cada posición tendrá coordenadas calculadas para formar un círculo alrededor del ProfileFileCard
- Reutilizar la misma lógica de animación (floating → falling → absorbed → exploding)
- Eliminar el carrusel horizontal actual en móvil

**Nuevas posiciones móvil:**
```tsx
const mobilePositions = [
  // 10 logos en círculo de radio ~110px
  { angle: 0,    offset: '0, -110px' },   // top
  { angle: 36,   offset: '65px, -90px' }, // top-right
  { angle: 72,   offset: '105px, -35px' },
  { angle: 108,  offset: '105px, 35px' },
  { angle: 144,  offset: '65px, 90px' },
  { angle: 180,  offset: '0, 110px' },    // bottom
  { angle: 216,  offset: '-65px, 90px' },
  { angle: 252,  offset: '-105px, 35px' },
  { angle: 288,  offset: '-105px, -35px' },
  { angle: 324,  offset: '-65px, -90px' },
];
```

### 3. `tailwind.config.ts`
- Agregar nueva animación `fall-to-center` para móvil (caída hacia el centro del contenedor)
- Agregar animación `explode-from-center` para la explosión en móvil

## Implementación Detallada

### Archivo: `src/components/FloatingLogos.tsx`

**Estructura móvil nueva:**
```tsx
{/* Mobile: Logos en círculo con animación de caída */}
<div className="md:hidden relative">
  <div className="relative h-[280px] w-full flex items-center justify-center">
    {logos.map((logo, index) => {
      const state = logoStates[index];
      const pos = mobilePositions[index];
      
      return (
        <div
          key={...}
          className={`
            absolute h-10 w-10 flex items-center justify-center 
            rounded-full bg-white overflow-hidden shadow-lg
            ${state === 'floating' ? 'animate-float' : ''}
            ${state === 'falling' ? 'animate-fall-to-center' : ''}
            ${state === 'absorbed' ? 'opacity-0' : ''}
            ${state === 'exploding' ? 'animate-explode-from-center' : ''}
          `}
          style={{
            '--start-x': pos.startX,
            '--start-y': pos.startY,
          }}
        />
      );
    })}
  </div>
</div>
```

### Archivo: `tailwind.config.ts`

**Nuevas animaciones:**
```typescript
"fall-to-center-mobile": {
  "0%": { 
    transform: "translate(var(--start-x), var(--start-y)) scale(1)",
    opacity: "1"
  },
  "60%": { 
    transform: "translate(0, 0) scale(0.5)",
    opacity: "0.8"
  },
  "80%": { 
    transform: "translate(0, 0) scale(0.3)",
    opacity: "0.5"
  },
  "100%": { 
    transform: "translate(0, 0) scale(0)",
    opacity: "0"
  }
},
"explode-from-center-mobile": {
  "0%": { 
    transform: "translate(0, 0) scale(0)",
    opacity: "0"
  },
  "30%": {
    transform: "translate(calc(var(--start-x) * 0.4), calc(var(--start-y) * 0.4)) scale(1)",
    opacity: "1"
  },
  "100%": { 
    transform: "translate(var(--start-x), var(--start-y)) scale(1)",
    opacity: "1"
  }
}
```

### Archivo: `src/components/HeroSection.tsx`

**Ajustes de espaciado:**
```tsx
// Reducir padding top en móvil
<section className="... pt-8 md:pt-16 ...">

// Reducir margen después del subheadline en móvil  
<p className="... mb-4 md:mb-8 ...">
  {t.subheadline}
</p>
```

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/FloatingLogos.tsx` | Reemplazar carrusel móvil por logos circulares con animación de caída |
| `src/components/HeroSection.tsx` | Reducir padding superior y espaciados en móvil |
| `tailwind.config.ts` | Añadir keyframes para animaciones móviles |

## Notas Técnicas

- Los logos móviles serán más pequeños (`h-10 w-10` = 40px) vs desktop (`h-[84px]`)
- El círculo tendrá un radio de ~110px para caber bien en pantallas pequeñas
- Se reutiliza toda la lógica de estados (`floating`, `falling`, `absorbed`, `exploding`) existente
- La animación usa CSS custom properties (`--start-x`, `--start-y`) para calcular las trayectorias

