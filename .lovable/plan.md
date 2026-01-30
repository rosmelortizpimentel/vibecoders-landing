

# Plan: Rediseñar Bento Grid con Visuales Personalizados

## Resumen
Transformar las 4 tarjetas del BentoGrid de simples íconos a visuales interactivos y representativos de cada feature, manteniendo la estética premium estilo Lovable/Linear.

## Estructura de las 4 Tarjetas

### Tarjeta 1: Tu URL Oficial
**Visual:** Mini mock de barra de navegador estilo Safari/Chrome minimalista mostrando `vibecoders.la/@usuario`

```text
┌─────────────────────────────────────────────┐
│ ● ● ●  │  🔒 vibecoders.la/@rosmel         │
└─────────────────────────────────────────────┘
```

- **Título:** Tu URL Oficial
- **Cuerpo:** "Reclama tu nombre de usuario único. Un enlace limpio y profesional para compartir en tu bio de X o LinkedIn."

### Tarjeta 2: Transparencia de Stack
**Visual:** Fila horizontal de logos de tecnologías con efecto de scroll infinito sutil (React, Vercel, Supabase, OpenAI, Tailwind)

```text
[React] [Vercel] [Supabase] [OpenAI] [Tailwind] →
```

- **Título:** Transparencia de Stack
- **Cuerpo:** "No es magia, es ingeniería. Muestra los iconos de las herramientas exactas que usaste para construir cada proyecto."

### Tarjeta 3: Conecta tu Ecosistema
**Visual:** Diagrama con íconos de GitHub, LinkedIn, X y Lovable conectándose con líneas hacia el logo de Vibecoders en el centro

```text
     [GitHub]
         \
[LinkedIn]—[VC]—[Lovable]
         /
       [X]
```

- **Título:** Conecta tu Ecosistema
- **Cuerpo:** "Deja de fragmentar tu identidad. Integra tus repos de GitHub, LinkedIn y tus perfiles de builder en un solo dashboard central."

### Tarjeta 4: Reputación Profesional
**Visual:** Badge de verificación minimalista con efecto de brillo sutil

```text
    ┌──────────────┐
    │  ✓ Verified  │
    │   Builder    │
    └──────────────┘
```

- **Título:** Reputación Profesional
- **Cuerpo:** "Un portafolio visual listo para enviar a recruiters. Que te contraten por lo que has construido, no por un PDF."

## Archivos a Modificar/Crear

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/components/BentoGrid.tsx` | Modificar | Reestructurar para incluir componentes visuales personalizados |
| `src/components/bento/BrowserUrlMock.tsx` | Crear | Componente de barra de navegador minimalista |
| `src/components/bento/TechStackCarousel.tsx` | Crear | Carrusel/fila de logos de tecnologías |
| `src/components/bento/EcosystemHub.tsx` | Crear | Diagrama de conexiones GitHub/LinkedIn/X/Lovable |
| `src/components/bento/VerifiedBadge.tsx` | Crear | Badge de verificación con efecto de brillo |

## Detalles Técnicos de Cada Componente

### 1. BrowserUrlMock
- Barra con 3 círculos de colores (rojo, amarillo, verde) estilo macOS
- Ícono de candado
- URL estilizada: `vibecoders.la/@rosmel`
- Fondo gris claro (#F8F8F8) con bordes redondeados
- Sombra sutil

### 2. TechStackCarousel
- Fila horizontal de logos SVG inline
- Logos a incluir: React, Vercel, Supabase, OpenAI, Tailwind CSS
- Animación CSS de scroll infinito horizontal (marquee)
- Logos en escala de grises que pasan a color on hover
- Altura fija de ~60px

### 3. EcosystemHub
- SVG con íconos de:
  - GitHub (arriba)
  - LinkedIn (izquierda)
  - X/Twitter (abajo)
  - Lovable (derecha)
- Líneas conectoras hacia el centro
- Logo de Vibecoders (o "VC") en el centro
- Animación sutil de pulse en el centro

### 4. VerifiedBadge
- Escudo/badge minimalista con checkmark
- Texto "Verified Builder"
- Efecto de brillo (shimmer) sutil animado
- Colores: fondo gradiente suave azul/violeta

## Estilos Generales
- Mantener fondo crema `#F6F5F4`
- Tarjetas blancas con `border-stone-200`
- Esquinas redondeadas `rounded-2xl`
- Hover con elevación (`hover:-translate-y-1 hover:shadow-lg`)
- Tipografía: títulos en `text-stone-900`, cuerpo en `text-stone-600`
- Sin links al final (remover "Ver ejemplo →")

## Resultado Visual Esperado

```text
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│          Todo lo que tu portafolio necesitaba.                   │
│                                                                  │
│  ┌─────────────────────────┐  ┌─────────────────────────┐       │
│  │  ● ● ●  vibecoders...   │  │ [React][Vercel][Supa]→ │       │
│  │                         │  │                         │       │
│  │  Tu URL Oficial         │  │  Transparencia de Stack │       │
│  │  Reclama tu nombre...   │  │  No es magia, es...     │       │
│  └─────────────────────────┘  └─────────────────────────┘       │
│                                                                  │
│  ┌─────────────────────────┐  ┌─────────────────────────┐       │
│  │      [GH]               │  │    ┌────────────┐       │       │
│  │    [LI]—●—[LV]          │  │    │ ✓ Verified │       │       │
│  │      [X]                │  │    └────────────┘       │       │
│  │  Conecta tu Ecosistema  │  │  Reputación Profesional │       │
│  │  Deja de fragmentar...  │  │  Un portafolio visual...│       │
│  └─────────────────────────┘  └─────────────────────────┘       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

