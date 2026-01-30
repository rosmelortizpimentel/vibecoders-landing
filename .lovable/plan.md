

# Plan: Corregir Animación de Logos en Móvil

## Problema Identificado
Los logos móviles están posicionados con `absolute inset-0` relativo a toda la sección del Hero, pero usan `top-1/2 left-1/2` calculando desde la sección completa. Esto causa que los logos aparezcan en el centro del viewport en lugar de alrededor del ProfileFileCard.

## Solución
Mover los logos móviles DENTRO del contenedor del ProfileFileCard, haciéndolos relativos a la card en lugar del viewport.

## Diagrama del Problema vs Solución

```text
ACTUAL (Problema):                  SOLUCIÓN:
┌─────────────────────┐            ┌─────────────────────┐
│  FloatingLogos      │            │ Badge               │
│  (absolute inset-0) │            │                     │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ┐ │            │ ┌─ Container ─────┐ │
│  │ top-1/2 left-1/2│ │            │ │  (relative)     │ │
│  │  🔵 🟢 🔴      │ │            │ │  🔵 🟢 🔴      │ │
│  │ 🟣[logos]🟠    │ ← (Centro   │ │ 🟣[FILE]🟠     │ │  
│  │  🔵 🟢 🔴      │    viewport) │ │  🔵 🟢 🔴      │ │
│  └ ─ ─ ─ ─ ─ ─ ─ ┘ │            │ └─────────────────┘ │
│                     │            │                     │
│  z-10 Container     │            │ Headline            │
│  ┌─────────────────┐│            │                     │
│  │ Badge           ││            │ Subheadline         │
│  │ [FILE] (aquí)   ││            │                     │
│  │ Headline        ││            │ Form                │
│  └─────────────────┘│            └─────────────────────┘
└─────────────────────┘
```

## Cambios Requeridos

### 1. `src/components/HeroSection.tsx`

Crear un contenedor `relative` alrededor del ProfileFileCard que incluya los logos móviles:

```tsx
{/* Profile File Card CON logos móviles alrededor */}
<div 
  className="mb-6 md:mb-8 flex justify-center animate-fade-in opacity-0 relative"
  style={{ animationDelay: '0.15s' }}
>
  {/* Logos móviles - ahora relativos al ProfileFileCard */}
  <div className="md:hidden absolute inset-0 flex items-center justify-center">
    {/* Los logos se renderizan aquí, centrados en este contenedor */}
  </div>
  
  <ProfileFileCard 
    absorbedCount={absorbedCount}
    totalLogos={TOTAL_LOGOS}
    className="w-[130px] h-[140px] md:w-[150px] md:h-[160px] z-10"
    onExplosion={handleExplosion}
  />
</div>
```

### 2. `src/components/FloatingLogos.tsx`

**Opción A (Preferida)**: Cambiar el componente para que los logos móviles se rendericen relativos a su contenedor padre en lugar del viewport:

- Cambiar `absolute inset-0` por un contenedor que se posicione correctamente
- Ajustar las coordenadas de los logos para que funcionen con el nuevo sistema
- Agregar altura mínima al contenedor móvil para dar espacio a los logos

**Cambios específicos:**
1. El contenedor móvil debe tener `relative` con altura definida (ej: `h-[280px]`)
2. Los logos se posicionan con `absolute` usando `left-1/2 top-1/2` dentro de ESE contenedor
3. El ProfileFileCard va dentro del mismo contenedor, centrado

### 3. Reestructuración del Layout Móvil

El ProfileFileCard y los logos deben compartir el mismo contenedor padre:

```tsx
{/* Mobile: Contenedor con logos + card */}
<div className="md:hidden relative h-[280px] w-full flex items-center justify-center mb-6">
  {/* Logos flotantes alrededor */}
  {logos.map((logo, index) => (
    <div
      className="absolute h-10 w-10 ..."
      style={{
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${startX}), calc(-50% + ${startY}))`
      }}
    />
  ))}
  
  {/* ProfileFileCard en el centro */}
  <ProfileFileCard className="z-10" />
</div>
```

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/HeroSection.tsx` | Reestructurar el layout móvil para que el ProfileFileCard y los logos compartan contenedor |
| `src/components/FloatingLogos.tsx` | Modificar la versión móvil para posicionarse relativo al contenedor, no al viewport |

## Ajustes Adicionales

1. **Radio del círculo**: Reducir de 100px a ~80px para que los logos no se salgan del área visible
2. **Tamaño de logos**: Mantener en 40px (h-10 w-10) para móvil
3. **Altura del contenedor**: 280px para dar espacio al círculo de logos + ProfileFileCard
4. **Z-index**: ProfileFileCard debe tener `z-10` para estar sobre los logos cuando caen

## Resultado Esperado

```text
┌─────────────────────────────────┐
│   El portafolio oficial para...│ ← Badge
│                                 │
│         🔵    🟢    🔴          │ 
│       🟣 ┌─────────┐ 🟠        │ ← Logos alrededor
│          │   📁    │           │    del ProfileFileCard
│       🔵 │  Card   │ 🟢        │
│          └─────────┘           │
│         🟤    🟡    ⚪          │
│                                 │
│ Construyes a la velocidad...   │ ← Headline
│ Deja de enviar links...        │ ← Subheadline
│                                 │
│   [     email input      ]     │
│   [ Unirme a la Waitlist ]     │
└─────────────────────────────────┘
```

