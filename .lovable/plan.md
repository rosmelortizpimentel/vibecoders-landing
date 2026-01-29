

# Plan: Corregir el flujo de transformación del ProfileFileCard

## Problema Identificado

El `ProfileFileCard` no se transforma a "Perfil Verificado" después de que todos los logos son absorbidos. La barra de progreso llega a 100% pero el card permanece mostrando el icono de folder.

## Causa Raíz

El problema está en el `useEffect` que maneja la transformación (líneas 79-91 de `ProfileFileCard.tsx`):

```text
useEffect(() => {
  if (absorbedCount >= totalLogos && cardState === 'file') {
    setCardState('transforming');
    ...
  }
}, [absorbedCount, totalLogos, cardState]);
```

El issue es que React puede hacer batching de actualizaciones, y cuando el componente se renderiza con `absorbedCount = 10`, el efecto se ejecuta pero hay un problema de timing con los timeouts anidados.

## Solución Propuesta

Simplificar la lógica de transición de estados y usar una estructura más robusta:

1. **Usar una sola cadena de timeouts** en lugar de timeouts anidados
2. **Añadir console.logs temporales** para confirmar el flujo
3. **Asegurar que el cleanup de efectos funcione correctamente**

## Cambios Específicos

### 1. `ProfileFileCard.tsx` - Refactorizar la lógica de transición

**Problema actual:** Timeouts anidados dentro de un useEffect que pueden perderse en re-renders

**Solución:** Usar un ref para manejar los timeouts y asegurar que se ejecuten en secuencia

```text
// Mantener una referencia a los timeouts activos
const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

// Efecto para manejar la transformación completa
useEffect(() => {
  if (absorbedCount >= totalLogos && cardState === 'file') {
    console.log('Starting transformation...'); // Debug
    
    // Limpiar timeouts anteriores
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
    
    // Fase 1: Transforming
    setCardState('transforming');
    
    // Fase 2: Verified (después de 500ms)
    const t1 = setTimeout(() => {
      setCardState('verified');
    }, 500);
    timeoutsRef.current.push(t1);
    
    // Fase 3: Counting (después de 1500ms total)
    const t2 = setTimeout(() => {
      setCardState('counting');
      setShowNumbers(true);
    }, 1500);
    timeoutsRef.current.push(t2);
    
    // Fase 4: Exploding (después de 5500ms total)
    const t3 = setTimeout(() => {
      setShowNumbers(false);
      setCardState('exploding');
      setShowExplosion(true);
      onCountingComplete?.();
      onExplosion?.();
    }, 5500);
    timeoutsRef.current.push(t3);
    
    // Fase 5: Cleanup explosion (después de 6000ms)
    const t4 = setTimeout(() => {
      setShowExplosion(false);
    }, 6000);
    timeoutsRef.current.push(t4);
  }
  
  return () => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
  };
}, [absorbedCount, totalLogos]); // Removido cardState de deps
```

### 2. Añadir log de debug temporal

Para verificar que los valores están llegando correctamente, añadir un log:

```text
console.log('ProfileFileCard - absorbedCount:', absorbedCount, 'totalLogos:', totalLogos, 'cardState:', cardState);
```

## Secuencia de Timing Final

```text
Tiempo    Evento
──────────────────────────────────────────────
0ms       absorbedCount llega a 10 → setCardState('transforming')
500ms     setCardState('verified')
1500ms    setCardState('counting') + setShowNumbers(true)
5500ms    setCardState('exploding') + onExplosion() 
6000ms    setShowExplosion(false)
6000ms+   FloatingLogos maneja el reset del ciclo
```

## Archivos a Modificar

1. **`src/components/ProfileFileCard.tsx`**
   - Añadir `useRef` para manejar timeouts
   - Refactorizar los useEffects de transición en uno solo
   - Quitar timeouts anidados
   - Usar tiempos absolutos desde el inicio de la transformación
   - Remover `cardState` de las dependencias del efecto principal

