

# Plan: Animación de Explosión con Números y Reinicio del Ciclo

## Resumen
Después de que el ProfileFileCard se transforme en "Perfil Verificado", añadiremos una secuencia dramática:
1. Aparecen líneas/números que suben hacia el perfil (simulando estadísticas/métricas)
2. Una explosión visual
3. Los logos son disparados de vuelta a sus posiciones originales
4. El ciclo se reinicia automáticamente

## Secuencia de Animación Completa

```text
Tiempo    Evento
──────────────────────────────────────────────
0-2s      Logos flotan en sus posiciones
2-10s     Logos caen secuencialmente al file
10-10.5s  File se transforma en Perfil Verificado
10.5-15s  ✨ NUEVO: Números suben hacia el perfil
15s       💥 NUEVO: Explosión + logos salen disparados
15-16s    Logos regresan a posiciones originales
16s+      Ciclo reinicia desde el principio
```

## Nuevos Estados del Sistema

```text
type AnimationPhase = 
  | 'floating'      // Logos flotando
  | 'falling'       // Logos cayendo al file
  | 'verified'      // Perfil verificado mostrado
  | 'counting'      // NUEVO: Números subiendo
  | 'exploding'     // NUEVO: Explosión
  | 'resetting'     // NUEVO: Logos regresando
```

## Cambios por Componente

### 1. `ProfileFileCard.tsx` - Añadir fase de "counting" y explosión

**Nuevos estados:**
- `counting` - Muestra números animándose hacia arriba
- `exploding` - Efecto de explosión visual

**Nuevos elementos visuales:**
- Números flotantes que suben (ej: +127, +89, +256)
- Partículas de explosión
- Flash de luz en la explosión

### 2. `FloatingLogos.tsx` - Añadir animación de retorno

**Nuevo estado de logo:**
- `exploding` - Logo siendo disparado hacia afuera

**Nueva animación:**
- Los logos salen disparados desde el centro hacia sus posiciones originales
- Efecto de "rebote" al llegar a su posición

### 3. `tailwind.config.ts` - Nuevas animaciones

**Nuevos keyframes:**
- `number-rise` - Números subiendo y desvaneciéndose
- `explode-out` - Logos disparados hacia afuera
- `flash-explosion` - Flash de luz central
- `particle-burst` - Partículas de explosión

## Diseño Visual de los Números

```text
    +127 ↑     +89 ↑
         ↘   ↙
    ┌─────────────┐
    │  ✓ Verified │  ← números convergen aquí
    │   Profile   │
    └─────────────┘
         ↗   ↖
    +256 ↑     +43 ↑
```

Los números aparecerán desde abajo del card, subirán hacia él, y se absorberán. Serán números aleatorios que simulan métricas de proyecto (commits, deploys, etc.)

## Diseño Visual de la Explosión

```text
         ✦  ✧
      ✧ ╲ | ╱ ✦
   ✦ ─── 💥 ─── ✧
      ✦ ╱ | ╲ ✧
         ✧  ✦
           ↓
   Logos salen disparados en todas direcciones
```

## Archivos a Modificar

### 1. `tailwind.config.ts`
Añadir nuevos keyframes:
- `number-rise`: Números subiendo con fade
- `explode-out`: Movimiento desde centro hacia afuera
- `flash`: Flash blanco rápido
- `particle`: Partículas dispersándose

### 2. `src/components/ProfileFileCard.tsx`
- Añadir estados `counting` y `exploding`
- Crear componente de números animados
- Crear efecto de partículas de explosión
- Añadir callback `onExplosion` para sincronizar con FloatingLogos

### 3. `src/components/FloatingLogos.tsx`
- Añadir estado `exploding` para los logos
- Crear animación de retorno (desde centro hacia posición original)
- Sincronizar con ProfileFileCard via callbacks
- Actualizar timing del ciclo para incluir nuevas fases

### 4. `src/components/HeroSection.tsx`
- Manejar el nuevo estado de fase de animación
- Coordinar la sincronización entre componentes

## Timing Detallado

```text
Constante                     Valor    Descripción
─────────────────────────────────────────────────────
FLOAT_DURATION               2000ms   Tiempo inicial flotando
FALL_INTERVAL                 800ms   Entre cada caída
FALL_DURATION                 800ms   Duración de caída
VERIFIED_PAUSE               1000ms   Pausa mostrando verificado
COUNTING_DURATION            3000ms   Números subiendo (NUEVO)
EXPLOSION_DURATION            500ms   Explosión visual (NUEVO)
RETURN_DURATION              1000ms   Logos regresando (NUEVO)
RESET_PAUSE                   500ms   Pausa antes de reiniciar
```

## Implementación de Números Animados

Los números serán generados dinámicamente:
```text
const randomNumbers = [
  { value: '+127', delay: '0s', position: 'left' },
  { value: '+89', delay: '0.3s', position: 'right' },
  { value: '+256', delay: '0.6s', position: 'center' },
  { value: '+43', delay: '0.9s', position: 'left' },
  ...
]
```

Cada número:
- Aparece desde abajo del card
- Sube flotando con movimiento ondulante
- Se desvanece al llegar arriba
- Tiene un color verde brillante para indicar "ganancia"

## Implementación de la Explosión

1. **Flash central**: Círculo blanco que se expande y desvanece
2. **Partículas**: 8-12 pequeños círculos de colores que salen disparados
3. **Onda de choque**: Anillo que se expande rápidamente

## Consideraciones de Performance

- Usar `transform` y `opacity` exclusivamente (GPU accelerated)
- Limitar número de partículas a 8-10
- Usar `will-change` solo durante la animación activa
- Limpiar timeouts correctamente en cleanup

## Orden de Implementación

1. Añadir nuevos keyframes en Tailwind
2. Actualizar ProfileFileCard con fase counting y explosión
3. Actualizar FloatingLogos con animación de retorno
4. Sincronizar timing en HeroSection
5. Probar el ciclo completo
6. Ajustar tiempos según se vea

