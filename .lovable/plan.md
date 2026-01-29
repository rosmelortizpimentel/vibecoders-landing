

# Plan: Efecto de "Atravesar" el File al Absorber Logos

## Objetivo
Modificar la animación de caída de los logos para que en lugar de simplemente caer y desaparecer en el file, creen un efecto visual de "atravesar por detrás" - entrando por un lado, saliendo ligeramente por el otro, y luego regresando antes de absorberse completamente.

## Comportamiento Actual
```text
Logo → cae directamente → escala a 0 → desaparece
```

## Comportamiento Deseado
```text
Logo → cae hacia el file → lo atraviesa ligeramente → rebota hacia atrás → desaparece
```

## Visualización del Efecto

```text
Tiempo    Posición del Logo
──────────────────────────────────────────
0%        Posición inicial (flotando)
50%       Llega al centro del file
65%       Sale un poco por el otro lado (overshoot)
85%       Regresa al centro del file
100%      Escala a 0 y desaparece
```

## Cambio Técnico

### Archivo: `tailwind.config.ts`

Modificar el keyframe `fall-to-target` para incluir el efecto de rebote/overshoot:

```text
"fall-to-target": {
  "0%": { 
    transform: "translateY(0) translateX(0) scale(1) rotate(0deg)",
    opacity: "1"
  },
  "50%": { 
    // Llega al file
    transform: "translateY(var(--fall-y)) translateX(var(--fall-x)) scale(0.5) rotate(180deg)",
    opacity: "0.9"
  },
  "65%": { 
    // Atraviesa ligeramente (overshoot 15%)
    transform: "translateY(calc(var(--fall-y) * 1.15)) translateX(calc(var(--fall-x) * 1.15)) scale(0.4) rotate(220deg)",
    opacity: "0.7"
  },
  "85%": { 
    // Regresa al centro
    transform: "translateY(var(--fall-y)) translateX(var(--fall-x)) scale(0.2) rotate(320deg)",
    opacity: "0.4"
  },
  "100%": { 
    // Desaparece
    transform: "translateY(var(--fall-y)) translateX(var(--fall-x)) scale(0) rotate(360deg)",
    opacity: "0"
  },
}
```

## Detalles del Efecto

- **50%**: El logo llega al centro del file (destino original)
- **65%**: El logo "sale" un 15% más allá del destino, creando el efecto de atravesar
- **85%**: El logo regresa al centro del file
- **100%**: El logo se escala a 0 y desaparece

También ajustaré la curva de timing para que el rebote se sienta más natural usando `cubic-bezier`.

## Archivo a Modificar

- `tailwind.config.ts` - Solo el keyframe `fall-to-target` y posiblemente el timing de la animación

