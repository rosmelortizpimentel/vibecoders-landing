
# Plan: Mejorar Legibilidad y Estilo Visual de /inspiration

## Problema Identificado

1. **Texto ilegible**: El título "Hecho por Vibecoders" usa `text-foreground` que en el tema actual resulta en un color muy claro sobre el fondo crema `#F6F5F4`
2. **Falta de estilo profesional**: La página carece del efecto de onda curva que le da carácter distintivo a la landing page

## Solución

### 1. Corregir colores de texto

Cambiar las clases de color a valores explícitos:

| Elemento | Antes | Después |
|----------|-------|---------|
| Título `<h1>` | `text-foreground` | `text-[#1c1c1c]` |
| Subtítulo `<p>` | `text-muted-foreground` | `text-[#1c1c1c]/70` |
| Texto en estado vacío | `text-foreground` | `text-[#1c1c1c]` |
| Texto secundario vacío | `text-muted-foreground` | `text-[#1c1c1c]/60` |

### 2. Añadir sección Hero con onda curva

Restructurar la página para incluir:

1. **Header azul** con el título y CTA sobre fondo `#3D5AFE`
2. **WaveDivider** que transiciona de azul a crema (igual que landing)
3. **Grid de proyectos** sobre fondo crema `#F6F5F4`

### Estructura Visual Final

```text
┌─────────────────────────────────────────────────────────────────┐
│  PublicHeader (logo + menú usuario)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ████████████████ FONDO AZUL #3D5AFE ████████████████████████   │
│                                                                 │
│           "Hecho por Vibecoders" (texto blanco)                 │
│           "Apps reales creadas por..." (texto blanco/80)        │
│                                          [Quiero aparecer aquí] │
│                                                                 │
│  ╭───────────────── WAVE DIVIDER ─────────────────────────╮     │
├──╯                                                        ╰─────┤
│                                                                 │
│  ████████████████ FONDO CREMA #F6F5F4 ██████████████████████    │
│                                                                 │
│     [Card 1]      [Card 2]      [Card 3]                        │
│     [Card 4]      [Card 5]      [Card 6]                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Footer                                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Archivo a Modificar

**`src/pages/Inspiration.tsx`**

### Cambios específicos:

1. Importar `WaveDivider` del componente existente
2. Crear sección Hero con fondo azul `#3D5AFE`
3. Texto del título en blanco (`text-white`)
4. Texto del subtítulo en blanco con opacidad (`text-white/80`)
5. Añadir `WaveDivider` después del Hero
6. Mantener el grid de proyectos en la sección crema
7. Ajustar padding del botón CTA para que esté dentro del Hero azul

### Código resultante (estructura):

```tsx
<div className="min-h-screen flex flex-col">
  <PublicHeader />
  
  {/* Hero Section - Fondo Azul */}
  <section className="bg-[#3D5AFE] pt-12 pb-16 md:pb-20">
    <div className="container mx-auto px-4 md:px-6">
      <header className="relative">
        {/* Desktop: Button positioned absolute right */}
        <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2">
          <Button className="bg-white text-[#3D5AFE] hover:bg-white/90 rounded-full ...">
            Quiero aparecer aquí
          </Button>
        </div>

        {/* Centered text - BLANCO */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Hecho por Vibecoders
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Apps reales creadas por gente como tú...
          </p>
        </div>

        {/* Mobile button */}
        <div className="flex justify-center mt-6 md:hidden">
          <Button className="bg-white text-[#3D5AFE] ...">...</Button>
        </div>
      </header>
    </div>
  </section>

  {/* Wave Divider */}
  <WaveDivider fromColor="#3D5AFE" toColor="#F6F5F4" />

  {/* Main Content - Fondo Crema */}
  <main className="flex-1 bg-[#F6F5F4] pb-16">
    {/* Grid de proyectos */}
  </main>

  <Footer />
</div>
```

## Beneficios

1. **Consistencia visual**: Mismo estilo que la landing page principal
2. **Mejor legibilidad**: Texto blanco sobre azul tiene excelente contraste
3. **Profesionalismo**: El efecto de onda añade dinamismo y estilo distintivo
4. **Identidad de marca**: Usa los colores corporativos correctamente (azul #3D5AFE)
