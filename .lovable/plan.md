

# Plan: Reestructurar Animacion de Logos en Mobile

## Resumen
Modificar el comportamiento de los logos en mobile para que entren desde la izquierda, se muevan horizontalmente hacia el centro, y luego bajen hacia el ProfileFileCard que esta debajo. El desktop permanece intacto.

## Cambios en Layout Mobile (HeroSection.tsx)

### Nuevo orden de elementos:
1. Logo VIBECODERS (arriba)
2. Badge "El portafolio oficial para Vibecoders"
3. Headline + Subheadline (texto completo)
4. Zona de animacion con logos + file debajo

### Estructura visual:
```text
+---------------------------+
|      <VIBECODERS_>        |
|                           |
| El portafolio oficial...  |
|                           |
| Construyes a la velocidad |
| de la IA...               |
|                           |
|  [logo] [logo] ---> centro|
|              |             |
|              v             |
|         [  FILE  ]        |
|                           |
|     [email input]         |
+---------------------------+
```

## Cambios en FloatingLogos.tsx

### Nueva logica para mobile:
- **Fase 1 (floating):** Logos posicionados a la izquierda, fuera de pantalla o al borde
- **Fase 2 (sliding):** Logos se mueven horizontalmente hacia el centro (de izquierda a derecha)
- **Fase 3 (falling):** Cuando llegan al centro, caen hacia abajo donde esta el ProfileFileCard
- **Fase 4 (absorbed):** Desaparecen al ser absorbidos
- **Fase 5 (exploding):** Explotan y vuelven a sus posiciones iniciales

### Nuevas posiciones mobile:
```typescript
const mobilePositions = [
  { startX: '-150px', startY: '0px', delay: '0s' },
  { startX: '-180px', startY: '0px', delay: '0.3s' },
  // ... 10 logos escalonados
];
```

## Nuevas Animaciones (tailwind.config.ts)

### slide-right-mobile:
```text
0%   -> x: -150px (fuera izquierda)
100% -> x: 0 (centro)
```

### fall-down-mobile:
```text
0%   -> y: 0, scale: 1
100% -> y: +80px (hacia el file), scale: 0
```

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/HeroSection.tsx` | Reestructurar orden de elementos en mobile: Logo -> Badge -> Headline/Subheadline -> Zona animacion (logos arriba, file abajo) |
| `src/components/FloatingLogos.tsx` | Nueva logica de animacion mobile: entrar desde izquierda, moverse a centro, bajar al file |
| `tailwind.config.ts` | Agregar keyframes: `slide-right-mobile`, `fall-down-mobile`, ajustar `explode-from-center-mobile` |

## Secuencia de Animacion Mobile

```text
t=0s     : Logos aparecen a la izquierda (escalonados)
t=0-2s   : Logos flotan ligeramente mientras esperan
t=2s     : Logo 1 empieza a moverse hacia el centro
t=2.4s   : Logo 1 llega al centro y empieza a bajar
t=2.8s   : Logo 1 es absorbido por el file
t=3s     : Logo 2 empieza a moverse...
...
t=10s    : Todos absorbidos -> efecto profile
t=10.5s  : Explosion -> logos vuelven a la izquierda
t=11s    : Ciclo reinicia
```

## Notas Tecnicas

- El ProfileFileCard se posicionara debajo de la zona de logos (no al mismo nivel)
- La zona de animacion tendra altura fija para acomodar el movimiento vertical
- Los logos usaran `transform: translateX()` para el movimiento horizontal
- Al llegar al centro, cambian a `transform: translateY()` para bajar

