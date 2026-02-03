

# Plan: Rediseño Limpio - Quitar Morado y Simplificar Navbar/Hero

## Resumen

Eliminar el color morado del sistema de diseño, cambiar la paleta de acentos a azul (#3D5AFE), y rediseñar el Navbar y Hero de la página de Proyectos para un look más limpio y minimalista.

---

## Problema Principal

La imagen muestra que el dropdown del selector de fuentes tiene:
- Fondo oscuro (#1c1c1c)
- Selección con fondo morado/violeta
- Necesita: fondo blanco con selección azul

---

## Cambios Requeridos

### 1. `src/index.css` - Eliminar Morado de Variables CSS

**Cambio**: Reemplazar todos los valores de color morado (hue 263) por azul (#3D5AFE = 231° 99% 62% en HSL)

| Variable | Antes (Morado) | Después (Azul) |
|----------|----------------|----------------|
| `--primary` | `263 70% 58%` | `231 99% 62%` |
| `--accent` | `263 70% 58%` | `231 99% 62%` |
| `--ring` | `263 70% 58%` | `231 99% 62%` |
| `--border` | `263 30% 25%` | `220 13% 91%` (gris claro) |
| `--popover` | `222 47% 8%` | `0 0% 100%` (blanco) |
| `--popover-foreground` | `210 40% 98%` | `222 47% 11%` (negro) |

Esto afectará globalmente todos los componentes que usen `bg-accent`, `focus:ring`, etc.

---

### 2. `src/components/ui/select.tsx` - Estilo del SelectContent

**Cambio**: Asegurar que el dropdown tenga fondo blanco y selección azul

```tsx
// SelectContent - fondo blanco
className="... bg-white text-gray-900 ..."

// SelectItem - selección azul con texto blanco
className="... focus:bg-[#3D5AFE] focus:text-white ..."
```

---

### 3. `src/components/AuthenticatedHeader.tsx` - Navbar Blanco Sólido

**Cambio**: Quitar el glassmorphism, usar blanco sólido con borde sutil

```tsx
// Antes
className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md"

// Después
className="sticky top-0 z-50 border-b border-gray-100 bg-white"
```

---

### 4. `src/pages/Projects.tsx` - Hero Limpio Sin Fondo Azul

**Cambios**:
- Eliminar el fondo azul (`bg-[#3D5AFE]`)
- Eliminar el WaveDivider
- Texto: título negro, subtítulo gris
- Mantener el botón CTA azul (ahora resaltará más)
- Fondo uniforme blanco/crema

```tsx
// Hero Section - Fondo limpio
<section className="bg-white pt-12 pb-8">
  <div className="container mx-auto px-4 md:px-6">
    <header className="relative text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-[#1c1c1c] mb-4">
        Hecho por Vibecoders
      </h1>
      <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
        Apps reales creadas por gente como tú. Inspírate y lanza la tuya.
      </p>
      
      {/* Botón CTA - Mantiene estilo azul */}
      <Button className="bg-[#3D5AFE] text-white hover:bg-[#3D5AFE]/90 rounded-full px-6">
        Quiero aparecer aquí
      </Button>
    </header>
  </div>
</section>

{/* SIN WaveDivider */}

<main className="flex-1 bg-[#F6F5F4] pb-16 pt-8">
```

---

## Archivos a Modificar

| Archivo | Acción |
|---------|--------|
| `src/index.css` | Cambiar variables CSS de morado a azul |
| `src/components/ui/select.tsx` | Fondo blanco, selección azul |
| `src/components/AuthenticatedHeader.tsx` | Navbar blanco sólido |
| `src/pages/Projects.tsx` | Hero limpio sin fondo azul |

---

## Detalles Técnicos

### Variables CSS Actualizadas

```css
:root {
  --primary: 231 99% 62%;           /* #3D5AFE */
  --primary-foreground: 0 0% 100%;  /* blanco */
  
  --accent: 231 99% 62%;            /* #3D5AFE */
  --accent-foreground: 0 0% 100%;   /* blanco */
  
  --popover: 0 0% 100%;             /* blanco */
  --popover-foreground: 222 47% 11%; /* negro */
  
  --ring: 231 99% 62%;              /* #3D5AFE */
  --border: 220 13% 91%;            /* gris claro */
}
```

### SelectItem con Selección Azul

```tsx
<SelectPrimitive.Item
  className={cn(
    "... focus:bg-[#3D5AFE] focus:text-white",
    className,
  )}
>
```

---

## Resultado Visual Esperado

1. **Dropdown de fuentes**: Fondo blanco, opciones en negro, selección con fondo azul (#3D5AFE) y texto blanco
2. **Navbar**: Fondo blanco sólido, borde gris muy sutil, sin blur
3. **Hero de Proyectos**: Fondo blanco, título negro, subtítulo gris, botón azul destacado
4. **Sin morado**: En ningún lugar de la aplicación

