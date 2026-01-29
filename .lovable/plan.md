
# Vibecoders.la - Waitlist Landing Page

## Visión General
Una landing page con estética **Cyber-Garage**: fondo negro profundo, acentos neón en violeta/cian, tipografía grande y bold. Un espacio digital que transmite exclusividad underground pero acogedor para builders de IA. **Sin emojis** - solo iconos premium de Lucide para mantener la estética limpia y profesional.

---

## Estructura del Proyecto

### 1. Sistema de Fuentes
- Configurar la fuente **CameraPlainVariable** como tipografía principal del sitio
- Fallbacks apropiados para carga rápida

### 2. Sistema i18n (Multi-idioma)
Archivos organizados por idioma y sección:
```
src/i18n/
  └── es/
      ├── common.json (navbar, footer)
      ├── hero.json
      └── features.json
```
- Hook `useTranslation` para acceso fácil
- Preparado para añadir más idiomas en el futuro

### 3. Paleta de Colores
- **Fondo**: Negro profundo (`slate-950`)
- **Acentos primarios**: Violeta neón (`violet-500/600`)
- **Acentos secundarios**: Cian neón (`cyan-400/500`)
- **Texto**: Blanco con variaciones de opacidad

---

## Secciones de la Página

### Navbar
- Logo "Vibecoders.la" en fuente CameraPlainVariable, estilo bold
- Icono de Twitter/X a la derecha con hover sutil en cian
- Diseño limpio y minimalista

### Hero Section (Centrado)
- **Badge**: Pill con icono `Rocket` + "Construyendo en público" con borde gradient sutil
- **Headline H1**: "Menos bla bla bla. Más 'Mira lo que construí'."
- **Subheadline**: Descripción de la comunidad
- **Formulario de email**:
  - Input con placeholder "tucorreo@ejemplo.com"
  - Botón "Unirme al Club" con icono `ArrowRight`
  - Estado success: "Anotado" con icono `Check` o `Sparkles`
  - Console.log del email al submit
- **Social proof**: Icono `Users` + "Únete a los primeros fundadores en espera"

### Features Grid (3 Cards)
Diseño responsive: 3 columnas en desktop, 1 en móvil

| Card | Título | Descripción | Icono |
|------|--------|-------------|-------|
| 1 | Presume tu Build | Tus proyectos merecen un escenario | `Eye` |
| 2 | Feedback de Barrio | Opiniones honestas de gente real | `MessageSquare` |
| 3 | Zona Builder | Cero spam, pura energía creativa | `Zap` |

Cada card con:
- Borde sutil con degradado violeta/cian
- Hover con efecto de elevación suave
- Iconos con glow neón en violeta

### Footer
- Icono `MapPin` + "Hecho una madrugada en Canadá"
- "© 2026 Vibecoders.la"
- Estilo minimalista, centrado

---

## Animaciones (Sutiles y Elegantes)
- **Fade-in**: Elementos aparecen suavemente al cargar
- **Hover effects**: Botones y cards con transiciones de 200-300ms
- **Glow sutil**: En iconos y bordes de cards (no agresivo)
- **Transición del botón**: Cambio de texto/icono con animación suave

## Responsive Design
- Mobile-first approach
- Navbar adaptativo
- Grid de features en columna única en móvil
- Inputs y botones de tamaño adecuado para touch

---

## Componentes a Crear
1. `WaitlistPage.tsx` - Página principal
2. `Navbar.tsx` - Navegación superior
3. `HeroSection.tsx` - Sección hero con formulario
4. `FeaturesGrid.tsx` - Grid de features con cards
5. `Footer.tsx` - Pie de página
6. Hook `useTranslation.ts` - Sistema de traducciones
7. Archivos de traducción en español
