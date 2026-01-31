
# Plan: Corregir Formularios y Rediseñar Preview Premium

## Problemas Identificados

1. **Textarea de Bio con borde grueso y rojizo**: El problema está en el `focus-visible:ring-2` del componente `Textarea`, que muestra un anillo violeta/rojo al enfocar. El anillo de 2px se ve muy grueso.

2. **Botones de redes sociales con estilo muy cargado**: El input tiene un color de fondo azul (viene del global CSS `--input`) y el botón de basura usa estilos azules.

3. **Preview horrible**: El diseño actual usa `bg-card` (oscuro), iconos pequeños y una estructura poco elegante. Debe ser un diseño premium sin iconos, similar al `PublicProfileCard` (Founder Pass).

---

## Cambios a Realizar

### 1. `src/components/me/ProfileTab.tsx` - Corregir estilos de inputs

Cambiar las clases del `Textarea` para usar un borde delgado sin anillo de focus exagerado:

```tsx
// Antes
className="min-h-[120px] resize-none border-gray-300 bg-white text-[#1c1c1c] placeholder:text-gray-400 focus:border-[#3D5AFE] focus:ring-[#3D5AFE]"

// Después - sin ring, solo borde sutil
className="min-h-[120px] resize-none border border-gray-200 bg-white text-[#1c1c1c] placeholder:text-gray-400 focus:border-[#3D5AFE] focus:outline-none focus:ring-0"
```

Aplicar el mismo patrón a todos los `Input` del componente.

### 2. `src/components/me/ProfileSocials.tsx` - Estilos minimalistas

- Input con fondo blanco explícito (`bg-white`)
- Borde gris claro (`border-gray-200`)
- Sin ring de focus exagerado
- Botón de eliminar con estilo outline sutil (gris, hover rojo)

```tsx
<Input
  className="flex-1 bg-white border-gray-200 focus:border-[#3D5AFE] focus:outline-none focus:ring-0"
/>
<Button
  className="shrink-0 bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50"
>
```

### 3. `src/components/me/ProfilePreview.tsx` - Rediseño premium completo

Rediseñar el preview para que sea elegante y premium, inspirado en el `PublicProfileCard`:

**Estructura nueva:**
- **Fondo**: Gradiente azul premium (como Founder Pass)
- **Avatar**: Grande, centrado, con borde blanco semi-transparente
- **Nombre**: Blanco, grande, bold
- **Tagline**: Blanco con opacidad
- **Bio**: Blanco con opacidad, sin HTML complejo
- **Ubicación y Website**: Texto simple, sin iconos
- **Redes sociales**: Mostrar solo texto de las redes activas (ej: "Twitter, LinkedIn")
- **Apps**: Lista simple con nombres, sin iconos de external link
- **Footer**: URL del perfil en texto pequeño

**Sin iconos** - Todo el preview usará texto limpio y tipografía elegante.

---

## Diseño Visual del Nuevo Preview

```
┌───────────────────────────────────────────┐
│                                           │
│       ┌──────────────────────────┐        │
│       │      GRADIENTE AZUL      │        │
│       │                          │        │
│       │         (AVATAR)         │        │
│       │           ⬤              │        │
│       │                          │        │
│       │     Rosmel Ortiz         │        │
│       │                          │        │
│       │  SaaS Builder & Tech...  │        │
│       │                          │        │
│       │  I build products...     │        │
│       │                          │        │
│       │  Ontario, Canada         │        │
│       │  rosmelortiz.com         │        │
│       │                          │        │
│       │  LinkedIn · Twitter      │  ← Sin iconos
│       │                          │        │
│       ├──────────────────────────┤        │
│       │  APPS                    │        │
│       │  • App 1                 │  ← Sin iconos
│       │  • App 2                 │        │
│       ├──────────────────────────┤        │
│       │  vibecoders.io/@user     │        │
│       └──────────────────────────┘        │
│                                           │
└───────────────────────────────────────────┘
```

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/me/ProfileTab.tsx` | Reemplazar clases de focus ring por border subtle |
| `src/components/me/ProfileSocials.tsx` | Estilos minimalistas: bg-white, border-gray-200, sin ring |
| `src/components/me/ProfilePreview.tsx` | Rediseño completo: gradiente azul premium, sin iconos, tipografía elegante |

---

## Paleta de Colores del Preview Premium

| Elemento | Color |
|----------|-------|
| Fondo gradiente | `#4F46E5 → #3D5AFE → #2563EB` |
| Avatar border | `rgba(255,255,255,0.3)` |
| Nombre | `#FFFFFF` |
| Tagline | `rgba(255,255,255,0.7)` |
| Bio | `rgba(255,255,255,0.8)` |
| Ubicación/Website | `rgba(255,255,255,0.6)` |
| Redes sociales | `rgba(255,255,255,0.5)` |
| Apps section | Fondo blanco semi-transparente |
| Footer URL | `rgba(255,255,255,0.5)` |

---

## Regla de Diseño

**Sin iconos en la aplicación** - Se usará texto limpio y tipografía para indicar información. Por ejemplo:
- En lugar de icono de ubicación: solo "Ontario, Canada"
- En lugar de iconos de redes: "LinkedIn · Twitter · GitHub"
- En lugar de icono de link externo en apps: solo el nombre de la app
