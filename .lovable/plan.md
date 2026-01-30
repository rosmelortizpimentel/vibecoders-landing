
# Plan: Corregir el Salto de Reubicación de Logos

## Problema Identificado

Cuando los logos terminan la animación de explosión y cambian al estado `floating`, hay un **salto visual de ~40 píxeles** antes de que empiecen a flotar nuevamente. Esto ocurre porque:

### Flujo Actual (Mobile)
```text
1. Estado: exploding
   → Animación termina en: translate(var(--start-x), var(--start-y)) scale(1)
   → Es decir: translate(50px, -69px) - relativo al centro absoluto

2. Estado cambia a: floating  
   → Se aplica transform inline: translate(calc(-50% + 50px), calc(-50% + -69px))
   → El -50% adicional causa un desplazamiento de ~20px (50% de 40px de ancho del logo)
   
3. SALTO VISIBLE entre posición final de explosión y posición inicial de floating
```

### Flujo Actual (Desktop)
Similar problema: los logos en `exploding` se posicionan en el centro (`top-1/2 left-1/2`), pero al cambiar a `floating` saltan a sus posiciones originales (`top-[18%] left-[10%]`, etc.) antes de empezar la animación.

---

## Solución

Agregar una animación de transición suave desde la posición final de explosión hacia la posición de floating, eliminando el salto abrupto.

### Cambios Necesarios

#### 1. Nueva Animación: `return-to-position-mobile`

En `tailwind.config.ts`, agregar un keyframe que hace la transición suave:

```typescript
"return-to-position-mobile": {
  "0%": { 
    // Posición final de la explosión (desde el centro)
    transform: "translate(-50%, -50%) translate(var(--start-x), var(--start-y)) scale(1)",
    opacity: "1"
  },
  "100%": { 
    // Posición final de floating (incluye el -50% del centrado + offset)
    transform: "translate(calc(-50% + var(--start-x)), calc(-50% + var(--start-y))) scale(1)",
    opacity: "1"
  }
}
```

**Corrección simplificada**: En realidad, el problema es que la animación `explode-from-center-mobile` usa `translate(var(--start-x), var(--start-y))` SIN el `-50%` de offset, pero cuando cambia a `floating`, el transform inline incluye `-50%`.

La solución más limpia es **hacer que la animación de explosión termine exactamente en la misma posición que usa el estado floating**.

#### 2. Modificar `explode-from-center-mobile`

Cambiar la animación para que el frame final coincida con la posición que tendrá en estado `floating`:

```typescript
"explode-from-center-mobile": {
  "0%": { 
    transform: "translate(-50%, -50%) scale(0)",
    opacity: "0"
  },
  "30%": {
    transform: "translate(calc(-50% + calc(var(--start-x) * 0.4)), calc(-50% + calc(var(--start-y) * 0.4))) scale(1)",
    opacity: "1"
  },
  "100%": { 
    transform: "translate(calc(-50% + var(--start-x)), calc(-50% + var(--start-y))) scale(1)",
    opacity: "1"
  }
}
```

#### 3. Modificar `explode-out` (Desktop)

El problema en desktop es diferente: los logos en estado `exploding` se posicionan en el centro con clases CSS, pero al cambiar a `floating` vuelven a sus posiciones originales (ej: `top-[18%] left-[10%]`).

Para desktop, necesitamos que la animación `explode-out` termine en la posición original del logo, no relativa al centro.

Pero hay un problema: actualmente los logos en `exploding` se mueven al centro con `top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`, y la animación usa `--explode-x/y` para ir DESDE el centro HACIA afuera.

**Solución Desktop**: 
- NO mover los logos al centro cuando están en `exploding`
- Iniciar la animación desde la posición absorbida (ya están invisibles ahí)
- Animar hacia su posición original

Pero eso es más complejo. Una alternativa más simple:

**Mantener la animación actual pero agregar un estado intermedio `returning`** que hace una transición suave desde la posición de explosión a la posición de floating.

---

## Solución Simplificada (Recomendada)

En lugar de agregar más animaciones, la solución más simple es:

### Opción A: Hacer que la posición final de la explosión sea idéntica a la posición de floating

Esto requiere modificar las animaciones CSS para que sus frames finales coincidan exactamente con el `transform` que se aplica en estado `floating`.

**Para Mobile**:
- El estado `floating` aplica: `transform: translate(calc(-50% + ${pos.startX}), calc(-50% + ${pos.startY}))`
- La animación `explode-from-center-mobile` debe terminar en exactamente eso

**Para Desktop**:
- No cambiar la posición CSS entre estados (quitar `top-1/2 left-1/2` del estado exploding)
- Ajustar la animación `explode-out` para que inicie desde el centro (donde terminaron absorbidos) y termine en la posición original

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `tailwind.config.ts` | Ajustar keyframes de `explode-from-center-mobile` y `explode-out` |
| `src/components/FloatingLogos.tsx` | Ajustar lógica de posicionamiento para estado `exploding` en desktop |

---

## Detalle de Cambios

### A) `tailwind.config.ts`

#### 1. Corregir `explode-from-center-mobile` (líneas 211-224)

El frame final debe incluir el offset `-50%` para que coincida con el transform de `floating`:

```typescript
"explode-from-center-mobile": {
  "0%": { 
    transform: "translate(-50%, -50%) scale(0)",
    opacity: "0"
  },
  "30%": {
    transform: "translate(calc(-50% + var(--start-x) * 0.4), calc(-50% + var(--start-y) * 0.4)) scale(1)",
    opacity: "1"
  },
  "100%": { 
    transform: "translate(calc(-50% + var(--start-x)), calc(-50% + var(--start-y))) scale(1)",
    opacity: "1"
  }
}
```

### B) `src/components/FloatingLogos.tsx`

#### 1. Desktop: No mover al centro durante explosión

Cambiar la lógica del estado `exploding` para que los logos NO se reposicionen al centro. En cambio, mantenerlos en su posición original y usar una animación que los haga aparecer desde el centro.

Línea 165, cambiar:
```tsx
// Antes
className={`
  absolute ${isExploding ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : pos.position} ...
`}

// Después
className={`
  absolute ${pos.position} ...
`}
```

Y ajustar la animación `explode-out` para que:
- Frame 0%: `translate(var(--fall-x), var(--fall-y))` (posición del centro, donde terminó absorbido)
- Frame 100%: `translate(0, 0)` (posición original)

Esto requiere invertir los valores de explode: usar `--fall-x/y` en lugar de `--explode-x/y`, ya que `--fall-x/y` representa la distancia al centro.

---

## Resultado Esperado

Después de estos cambios:
1. Los logos explotan desde el centro hacia afuera
2. Terminan exactamente en su posición de floating
3. No hay salto ni reubicación visible
4. El ciclo se repite suavemente
