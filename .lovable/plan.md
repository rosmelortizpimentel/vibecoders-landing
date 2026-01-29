

# Plan: Reposicionar el ProfileFileCard al Centro

## Resumen
Mover el ProfileFileCard desde su posición actual (derecha, absoluta) hacia el centro del contenido, ubicándolo entre el subtítulo (subheadline) y el formulario de email. Los logos seguirán cayendo hacia esta nueva posición centralizada.

## Cambios Necesarios

### 1. Modificar `HeroSection.tsx`
- Importar el componente `ProfileFileCard` directamente en HeroSection
- Añadir el ProfileFileCard entre el subheadline y el form
- El card debe estar centrado y formar parte del flujo normal del contenido
- Necesitaremos recibir los estados de animación desde FloatingLogos

### 2. Modificar `FloatingLogos.tsx`
- Remover el ProfileFileCard de este componente (ya no estará posicionado absolutamente a la derecha)
- Exportar el estado `absorbedCount` y `totalLogos` para que HeroSection pueda usarlos
- Actualizar las coordenadas de caída (`fallX`, `fallY`) para que los logos vayan hacia el centro (donde estará el nuevo card)
- Los logos del lado izquierdo irán hacia la derecha-centro
- Los logos del lado derecho irán hacia la izquierda-centro

### 3. Ajustar las coordenadas de caída
Las nuevas trayectorias serán hacia el centro de la pantalla:

**Logos izquierdos (índices 0-4):**
- fallX: hacia la derecha (~40-45vw → 0vw center)
- fallY: hacia la posición vertical del card (~55% de la pantalla)

**Logos derechos (índices 5-9):**
- fallX: hacia la izquierda (~-40-45vw → 0vw center)
- fallY: hacia la posición vertical del card

## Estructura del Layout Final

```text
┌─────────────────────────────────────────────────────────────┐
│  [Logo 1]       El portafolio oficial...         [Logo 6]  │
│  [Logo 2]                                        [Logo 7]  │
│  [Logo 3]    "Tus proyectos están dispersos"     [Logo 8]  │
│  [Logo 4]                                        [Logo 9]  │
│  [Logo 5]    Subheadline texto...                [Logo 10] │
│                                                             │
│                    ┌─────────────┐                         │
│                    │  📁 File    │ ← Nuevo posición        │
│                    │ vibecoders  │   centrada              │
│                    └─────────────┘                         │
│                                                             │
│              [  email input  ] [ Unirme ]                  │
│                                                             │
│               👥 Únete a los primeros...                   │
└─────────────────────────────────────────────────────────────┘
```

## Detalles Técnicos

### Refactorización del Estado
Crear un custom hook o elevar el estado para compartir entre componentes:
- `absorbedCount` - necesario en HeroSection para ProfileFileCard
- `logoStates` - permanece en FloatingLogos
- `totalLogos` - constante (10 logos)

### Opción de Implementación: Props Callback
- FloatingLogos recibe una función `onAbsorbedCountChange`
- HeroSection mantiene el estado `absorbedCount`
- ProfileFileCard recibe props desde HeroSection

### Nuevas Coordenadas de Caída
```text
// Izquierda → Centro (fallX positivo pequeño, fallY hacia abajo)
{ fallX: '35vw', fallY: '10vh' }  // Logo 1 (arriba-izq) → centro
{ fallX: '40vw', fallY: '5vh' }   // Logo 2 → centro
...

// Derecha → Centro (fallX negativo, fallY hacia abajo)  
{ fallX: '-35vw', fallY: '10vh' } // Logo 6 (arriba-der) → centro
{ fallX: '-40vw', fallY: '5vh' }  // Logo 7 → centro
...
```

### Mobile
- El ProfileFileCard se mostrará también centrado entre subheadline y form
- Los logos del carrusel se desvanecen al ser "absorbidos"
- Tamaño más pequeño en móvil

## Archivos a Modificar

1. **`src/components/HeroSection.tsx`**
   - Importar ProfileFileCard
   - Añadir estado para absorbedCount
   - Insertar ProfileFileCard entre subheadline y form
   - Pasar callback a FloatingLogos

2. **`src/components/FloatingLogos.tsx`**
   - Aceptar prop `onAbsorbedCountChange`
   - Remover ProfileFileCard de este archivo
   - Actualizar fallX/fallY para dirigirse al centro
   - Mantener la lógica de animación existente

