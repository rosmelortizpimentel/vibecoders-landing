
# Plan: Reorganizar Layout del Hero en Móvil

## Objetivo
Cambiar el orden de los elementos en móvil para que el efecto de los logos cayendo sea lo primero que llame la atención, manteniendo el layout actual en desktop.

## Layout Actual vs Propuesto (Solo Móvil)

```text
ACTUAL (Móvil):                    PROPUESTO (Móvil):
┌─────────────────────┐            ┌─────────────────────┐
│ El portafolio...    │            │ El portafolio...    │  ← Badge (igual)
│                     │            │                     │
│ Construyes a la...  │            │     🔵  🟢  🔴      │  ← Logos + File 
│                     │            │   🟣 [FILE] 🟠      │     (AHORA AQUÍ)
│ Deja de enviar...   │            │     🔵  🟢  🔴      │
│                     │            │                     │
│     🔵  🟢  🔴      │            │ Construyes a la...  │  ← Headline (abajo)
│   🟣 [FILE] 🟠      │            │                     │
│     🔵  🟢  🔴      │            │ Deja de enviar...   │  ← Subheadline
│                     │            │                     │
│ [email] [button]    │            │ [email] [button]    │  ← Form
│ Social proof        │            │ Social proof        │
└─────────────────────┘            └─────────────────────┘
```

**Desktop permanece igual** - solo se reorganiza en móvil.

## Cambios Requeridos

### Archivo: `src/components/HeroSection.tsx`

**Estrategia:** Crear dos secciones separadas - una para móvil y otra para desktop - usando clases `md:hidden` y `hidden md:block` para mostrar/ocultar según el breakpoint.

**Cambios específicos:**

1. **Badge (Eyebrow)**: Queda igual en ambas versiones, siempre primero

2. **Sección de Logos + Card (Móvil)**:
   - Crear un contenedor `md:hidden` que incluya el `ProfileFileCard` con los logos flotando alrededor
   - Esta sección se muestra solo en móvil, justo después del badge

3. **Headline y Subheadline**:
   - En móvil: Aparecen DESPUÉS de los logos/file
   - En desktop: Mantener la posición actual (antes del file)
   - Usar clases condicionales para reordenar

4. **ProfileFileCard (Desktop)**:
   - Crear un contenedor `hidden md:block` para la versión desktop
   - Mantiene su posición actual en desktop

**Estructura de código propuesta:**

```tsx
<div className="relative z-10 mx-auto max-w-4xl text-center">
  {/* Badge - siempre primero */}
  <p className="mb-6 animate-fade-in ...">
    {t.badge}
  </p>

  {/* DESKTOP: Headline → Subheadline → File (orden actual) */}
  <div className="hidden md:block">
    <h1 className="mb-6 ...">{t.headline}</h1>
    <p className="mb-8 ...">{t.subheadline}</p>
  </div>

  {/* ProfileFileCard - visible en ambos, pero posición diferente por flex order */}
  <div className="mb-8 flex justify-center ...">
    <ProfileFileCard ... />
  </div>

  {/* MÓVIL: Headline → Subheadline después del file */}
  <div className="md:hidden">
    <h1 className="mb-4 ...">{t.headline}</h1>
    <p className="mb-6 ...">{t.subheadline}</p>
  </div>

  {/* Form y Social Proof - igual en ambos */}
  <form ...>...</form>
  <p ...>{t.socialProof}</p>
</div>
```

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/HeroSection.tsx` | Reorganizar orden de elementos usando `hidden`/`md:hidden` y `md:block` para crear layouts diferentes por breakpoint |

## Notas Técnicas

- Se duplica el contenido de headline/subheadline en el JSX (uno para móvil, otro para desktop), pero solo uno se renderiza visualmente
- Los FloatingLogos ya tienen lógica separada para móvil/desktop, así que funcionarán correctamente
- El ProfileFileCard puede quedar en un solo lugar ya que su posición visual cambia por el orden del flex
- Se ajustarán los márgenes (`mb-`) para móvil vs desktop según sea necesario
