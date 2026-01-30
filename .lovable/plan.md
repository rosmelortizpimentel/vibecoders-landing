

# Plan: Corregir Animacion Mobile de Logos y Contadores

## Problema Detectado

El problema tiene dos causas principales:

### 1. Dos instancias de FloatingLogos ejecutandose simultaneamente en movil

En `HeroSection.tsx` hay dos llamadas a `FloatingLogos`:

- **Lineas 94-98**: Instancia principal (desktop) - aunque el contenedor hijo tiene `hidden md:block`, el componente sigue ejecutando su logica JavaScript y llamando a `setAbsorbedCount`
- **Lineas 174-179**: Instancia mobile con `isMobileContainer={true}`

**Resultado**: Ambas instancias incrementan el mismo `absorbedCount`, causando que el contador llegue a 20 en lugar de 10, o que la transformacion se dispare multiples veces.

### 2. Conflicto de estados en ProfileFileCard

Los logs muestran:
```
ProfileFileCard: Starting transformation sequence... (x2)
ProfileFileCard: Phase 2 - Verified (x2)
```

La transformacion se inicia dos veces, lo que causa que los timeouts se sobrepongan y la fase de "Counting" (donde los contadores suben) nunca se ejecute correctamente.

## Solucion

### Cambios en HeroSection.tsx

Separar completamente las instancias de FloatingLogos para desktop y mobile usando estados independientes:

1. **Desktop (md+)**: Mantener FloatingLogos actual con `absorbedCount` propio
2. **Mobile (<md)**: Usar FloatingLogos con `isMobileContainer={true}` con su propio contador

Esto significa:
- Crear dos estados separados: `absorbedCountDesktop` y `absorbedCountMobile`
- El ProfileFileCard de desktop usa `absorbedCountDesktop`
- El ProfileFileCard de mobile usa `absorbedCountMobile`
- Evitar que la instancia de desktop ejecute logica en mobile

### Estructura final simplificada

```text
+------------------+------------------+
|     DESKTOP      |      MOBILE      |
+------------------+------------------+
| FloatingLogos    | [no se renderiza]|
| (sin isMobile)   |                  |
| → absorbedDesktop|                  |
+------------------+------------------+
| ProfileFileCard  | ProfileFileCard  |
| (desktop size)   | (mobile size)    |
| → absorbedDesktop| → absorbedMobile |
+------------------+------------------+
| [no se renderiza]| FloatingLogos    |
|                  | (isMobile=true)  |
|                  | → absorbedMobile |
+------------------+------------------+
```

### Alternativa mas simple (preferida)

En lugar de duplicar estados, hacer que el FloatingLogos principal NO se monte en mobile:

1. Mover el `<FloatingLogos />` principal (lineas 94-98) dentro del bloque `hidden md:block` de desktop
2. Mantener el FloatingLogos mobile en su zona dedicada
3. Usar un solo `absorbedCount` pero asegurar que solo UNA instancia lo modifique a la vez

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/HeroSection.tsx` | Reestructurar para que solo una instancia de FloatingLogos este activa segun el viewport. Opcion: renderizar condicionalmente o mover la instancia desktop dentro de un wrapper que no ejecute JS en mobile |

## Implementacion Detallada

En `HeroSection.tsx`:

1. Envolver el FloatingLogos principal (desktop) dentro de un componente que solo se monte en md+
2. Usar `useIsMobile()` hook para determinar cual FloatingLogos activar
3. O alternativamente: renderizar solo uno de los dos basado en una media query

```typescript
// Opcion con hook
const isMobile = useIsMobile();

return (
  <>
    {/* Desktop FloatingLogos - solo se monta si no es mobile */}
    {!isMobile && (
      <FloatingLogos 
        onAbsorbedCountChange={setAbsorbedCount}
        triggerExplosion={triggerExplosion}
        onExplosionComplete={handleExplosionComplete}
      />
    )}
    
    {/* ... resto del layout ... */}
    
    {/* Mobile: Zona de animacion */}
    {isMobile && (
      <div className="relative w-full flex flex-col items-center mb-6">
        <FloatingLogos 
          onAbsorbedCountChange={setAbsorbedCount}
          triggerExplosion={triggerExplosion}
          onExplosionComplete={handleExplosionComplete}
          isMobileContainer={true}
        />
        <ProfileFileCard ... />
      </div>
    )}
  </>
);
```

## Resultado Esperado

1. En mobile: Los logos entran desde la izquierda, van al centro, bajan al file
2. Cuando todos son absorbidos (10/10), el file se transforma en perfil
3. Los contadores suben de 0 a 12,847 (views) y 3,256 (likes)
4. Explosion y reinicio del ciclo

