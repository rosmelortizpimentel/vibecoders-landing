

# Plan: Mejorar Footer en Móvil

## Objetivo
Ajustar el footer para que se vea mejor en dispositivos móviles (menos saturado/apretado) y cambiar la temperatura de -13°C a -20°C.

## Cambios Requeridos

### 1. `src/i18n/es/common.json`
- Cambiar la temperatura de `-13°C` a `-20°C`

### 2. `src/components/Footer.tsx`
**Problema actual:** En móvil, todo el contenido está en una sola línea horizontal que se ve muy apretado.

**Solución:** 
- Dividir el texto del footer en dos líneas en móvil
- Aumentar el espaciado vertical
- Centrar el contenido en móvil

**Estructura propuesta para móvil:**
```text
┌─────────────────────────────────┐
│                                 │
│   Construido a -20°C en 🇨🇦    │  ← Primera línea
│       por Rosmel Ortiz          │  ← Segunda línea  
│                                 │
│   © 2026 Vibecoders.la          │  ← Copyright abajo
│                                 │
└─────────────────────────────────┘
```

**Cambios CSS:**
- En móvil: `flex-col` con `text-center` para centrar todo
- Separar "Construido a -20°C en 🇨🇦" y "por Rosmel Ortiz" en líneas separadas usando `flex-wrap`
- Reducir el tamaño del texto si es necesario (`text-xs` en móvil)
- Invertir el orden: primero la info de construcción, luego el copyright

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/i18n/es/common.json` | Cambiar temperatura a `-20°C` |
| `src/components/Footer.tsx` | Mejorar layout responsive para móvil |

