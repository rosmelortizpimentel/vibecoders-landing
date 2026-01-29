

# Rediseño Hero Section - Estilo Lovable Community

## Objetivo
Transformar la sección Hero para que tenga el mismo impacto visual que la página de referencia, con logos de herramientas de AI/vibe-coding flotando alrededor del headline principal.

---

## Cambios Visuales Principales

### 1. Logos Flotantes (En lugar de avatares)
Círculos con borde oscuro posicionados estratégicamente alrededor del texto:

```text
          [Lovable]
    [Cursor]            [v0]
              HEADLINE
    [Bolt]              [Replit]
          [Windsurf]
```

**Herramientas a incluir:**
- Lovable
- Cursor
- v0 (Vercel)
- Bolt
- Replit
- Windsurf

**Diseño de cada círculo:**
- Tamaño: 60-80px en desktop, 40-50px en móvil
- Borde oscuro grueso (border-4 border-slate-900)
- Fondo con gradiente sutil o color de marca
- Posicionamiento absoluto con coordenadas específicas
- Animación sutil de flotación (float)

### 2. Ajustes al Layout
- Mantener el gradiente de fondo actual (ya es similar)
- Aumentar el área del hero para dar espacio a los logos flotantes
- Centrar mejor el contenido principal

### 3. Responsive Design
- En móvil: logos más pequeños y posiciones ajustadas
- Algunos logos ocultos en pantallas muy pequeñas

---

## Archivos a Modificar

### `src/components/HeroSection.tsx`
- Agregar componente `FloatingLogos` con los círculos posicionados
- Cada logo tendrá:
  - Posición absoluta con coordenadas responsivas
  - Animación de flotación con delay escalonado
  - Placeholder con inicial o nombre corto (reemplazable por imagen)

### `tailwind.config.ts`
- Agregar animación `float` para el efecto de flotación suave:
```javascript
keyframes: {
  float: {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
  }
}
```

### `src/index.css` (opcional)
- Estilos adicionales si son necesarios para las posiciones

---

## Estructura del Componente FloatingLogos

```tsx
const logos = [
  { name: 'Lovable', position: 'top-[15%] left-[30%]', delay: '0s' },
  { name: 'Cursor', position: 'top-[25%] left-[15%]', delay: '0.5s' },
  { name: 'v0', position: 'top-[20%] right-[20%]', delay: '1s' },
  { name: 'Bolt', position: 'top-[45%] left-[10%]', delay: '0.3s' },
  { name: 'Replit', position: 'top-[40%] right-[12%]', delay: '0.8s' },
  { name: 'Windsurf', position: 'top-[55%] left-[25%]', delay: '0.6s' },
];
```

---

## Siguiente Paso: Logos Reales
Una vez aprobado el plan, implementaré los placeholders. Luego podrás subir los logos reales de:
- Lovable
- Cursor  
- v0
- Bolt
- Replit
- Windsurf

Y los reemplazaré en los círculos correspondientes.

---

## Sección Técnica

**Dependencias:** Ninguna nueva requerida

**Animación Float (keyframes):**
```javascript
float: {
  '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
  '50%': { transform: 'translateY(-12px) rotate(2deg)' },
}
```

**Posicionamiento Responsive:**
- Desktop: posiciones absolutas en porcentaje del contenedor
- Tablet: posiciones ajustadas, tamaños reducidos
- Móvil: solo 3-4 logos visibles, posiciones simplificadas

**Placeholder temporal:**
Cada logo mostrará la inicial o nombre corto del IDE en un círculo con gradiente hasta que subas las imágenes reales.

