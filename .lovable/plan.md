
# Plan: Animación de Logos Cayendo al Profile Card

## Resumen
Crear un efecto visual interactivo donde los logos flotantes caen secuencialmente hacia un "file/carpeta" que representa el perfil de Vibecoders.la. Una vez que todos los logos han sido "absorbidos", el ícono se transforma en un perfil verificado.

## Componentes del Efecto

### Desktop
- Carpeta/File posicionada en el lado derecho con el texto "vibecoders.la"
- Los logos flotan inicialmente y luego caen uno a uno hacia la carpeta
- Al caer, los logos se encogen y desaparecen al entrar a la carpeta
- Después del último logo, la carpeta se transforma en un ícono de perfil verificado

### Mobile
- File posicionado a la izquierda del área de contenido
- Los logos del carrusel se van insertando en el file mientras rotan
- Misma transformación final a perfil verificado

## Diagrama del Flujo de Animación

```text
┌─────────────────────────────────────────────────────────────┐
│                      HERO SECTION                           │
│                                                             │
│  [Logo 1]  ←──┐                              ┌──→ [Logo 6] │
│  [Logo 2]     │     "El portafolio..."       │    [Logo 7] │
│  [Logo 3]     │                              │    [Logo 8] │
│  [Logo 4]     │     Headline + Form          │    [Logo 9] │
│  [Logo 5]     │                              │    [Logo 10]│
│               │                              │             │
│               └──────────────────────────────┘             │
│                            ↓                               │
│                   ┌─────────────────┐                      │
│                   │  📁 File Card   │ ← Destino            │
│                   │  vibecoders.la  │                      │
│                   └─────────────────┘                      │
│                            ↓                               │
│                   ┌─────────────────┐                      │
│                   │  ✓ Verified     │ ← Transformación     │
│                   │    Profile      │                      │
│                   └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## Archivos a Crear/Modificar

### 1. Nuevo Componente: `ProfileFileCard.tsx`
Crear el componente del file/carpeta que recibe los logos:
- Diseño visual de carpeta/ventana de sistema de archivos
- Texto "vibecoders.la" como label
- Estado para saber cuántos logos han sido absorbidos
- Animación de "pulseo" cuando un logo entra
- Transformación final a perfil verificado con checkmark

### 2. Modificar: `FloatingLogos.tsx`
Actualizar para manejar las animaciones de caída:
- Añadir estado para controlar qué logos están visibles/cayendo/absorbidos
- Calcular posición de destino (hacia el file card)
- Animación de caída con rotación y escala decreciente
- Efecto de desvanecimiento al llegar al destino
- Comunicación con ProfileFileCard para sincronizar animaciones

### 3. Modificar: `tailwind.config.ts`
Agregar nuevas animaciones keyframes:
- `fall-to-target`: Movimiento curvo hacia el destino
- `shrink-fade`: Reducción de tamaño con desvanecimiento
- `pulse-absorb`: Efecto de pulso al absorber logo
- `transform-verified`: Transición de file a perfil verificado

### 4. Modificar: `HeroSection.tsx`
- Importar y posicionar el nuevo ProfileFileCard
- Pasar props para coordinar las animaciones
- Manejar el estado global del efecto

## Detalles Técnicos de Implementación

### Posicionamiento del File Card
**Desktop:**
- Posición fija en `right-[8%] top-[50%]` 
- Tamaño aproximado: 180px x 200px
- Z-index alto para que los logos "caigan encima"

**Mobile:**
- Posición en `left-[5%] top-[30%]`
- Tamaño reducido: 100px x 120px
- Los logos del carrusel se dirigen hacia él

### Secuencia de Animación
1. **0-2s**: Logos flotan normalmente (estado actual)
2. **2s-12s**: Cada logo cae secuencialmente (1s de intervalo)
3. **12s+**: Transformación a perfil verificado
4. **Loop opcional**: Reiniciar animación después de 5s

### Timing de Caída (Desktop)
```text
Logo 1 (Lovable)   → cae a los 2s
Logo 2 (Replit)    → cae a los 3s
Logo 3 (Windsurf)  → cae a los 4s
...
Logo 10 (Kilocode) → cae a los 11s
Transformación     → a los 12s
```

### Curva de Movimiento
- Usar `cubic-bezier(0.68, -0.55, 0.265, 1.55)` para efecto de "rebote"
- Rotación sutil durante la caída (0° → 360°)
- Escala decrece de 1 → 0.3 → 0 al llegar

### Estados del Componente
```text
type LogoState = 'floating' | 'falling' | 'absorbed'
type CardState = 'file' | 'transforming' | 'verified'
```

### Diseño Visual del File Card
- Fondo blanco con sombra
- Header tipo "barra de título" con 3 puntos (estilo macOS)
- Icono de carpeta/documento
- Texto "vibecoders.la" debajo
- Al transformarse: Icono de usuario con checkmark verde

## Consideraciones de Performance
- Usar `transform` y `opacity` para animaciones (GPU accelerated)
- Evitar re-renders innecesarios con `useMemo` para posiciones
- Usar `will-change` en elementos animados
- Limitar el ciclo de animación para no consumir recursos indefinidamente

## Orden de Implementación
1. Crear las nuevas keyframes en Tailwind
2. Crear el componente ProfileFileCard
3. Modificar FloatingLogos para añadir lógica de caída
4. Integrar ambos componentes en HeroSection
5. Adaptar para mobile con el carrusel
6. Probar y ajustar tiempos de animación
