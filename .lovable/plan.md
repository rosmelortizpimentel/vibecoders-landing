

# Plan: Rediseñar el Formulario del Hero

## Cambio Visual Solicitado

Transformar el formulario actual de email + botón al estilo del diseño de referencia:

**Diseño actual:**
- Input transparente con borde
- Botón negro separado

**Nuevo diseño:**
- Input oscuro (#1c1c1c) con prefijo "vibecoders.la/" incorporado
- Botón azul brillante (#3D5AFE) prominente
- Todo dentro de un contenedor con bordes redondeados más pronunciados

## Cambios Visuales Específicos

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌────────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ vibecoders.la/ tunombre            │  │   RESERVAR MI PÁGINA  →    │  │
│  │                                    │  │        (azul #3D5AFE)       │  │
│  └────────────────────────────────────┘  └─────────────────────────────┘  │
│           (fondo #1c1c1c)                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/HeroSection.tsx` | Rediseñar la estructura del formulario con el nuevo estilo visual |
| `src/i18n/es/hero.json` | Cambiar texto del botón a "Reservar mi página" y ajustar placeholder |

## Detalles de Implementación

### 1. Rediseño del formulario (HeroSection.tsx)

**Estructura nueva:**
- Contenedor padre con fondo `#1c1c1c`, bordes muy redondeados (`rounded-xl` o `rounded-2xl`), y borde sutil
- Input con prefijo visual "vibecoders.la/" en texto gris, seguido del input para email
- Botón con fondo azul `#3D5AFE` (color principal del hero), texto blanco en mayúsculas/semibold

**Estilos del Input:**
- Fondo transparente (hereda del contenedor oscuro)
- Sin borde visible
- Prefijo "vibecoders.la/" como texto estático antes del input
- Placeholder: "tunombre" o similar

**Estilos del Botón:**
- Fondo: `#3D5AFE` (azul del hero)
- Texto: blanco, font-semibold, uppercase (o capitalizado)
- Bordes redondeados que coincidan con el contenedor
- Hover: versión más clara del azul

### 2. Actualizar textos (hero.json)

```json
{
  "form": {
    "placeholder": "tunombre",
    "button": "Reservar mi página",
    ...
  }
}
```

### 3. Mantener funcionalidad

- La lógica de validación de email permanece igual
- Los estados de loading, success, y error permanecen
- La funcionalidad de registro a waitlist no cambia

## Adaptación Móvil

En móvil, el diseño será:
- Elementos apilados verticalmente
- El contenedor se adapta al ancho completo
- El input y botón mantienen la misma estética pero en columna

## Resultado Esperado

Un formulario con aspecto más moderno y premium, siguiendo el estilo del diseño de referencia pero usando los colores de la marca:
- Negro `#1c1c1c` para el fondo del input
- Azul `#3D5AFE` para el botón CTA
- Tipografía CameraPlain existente

