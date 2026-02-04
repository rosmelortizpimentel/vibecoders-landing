

## Resumen

Vamos a hacer dos cosas:
1. **Crear una nueva entrada en Build Log** explicando cómo logramos mostrar perfiles dinámicos en redes sociales (LinkedIn, WhatsApp, X, etc.)
2. **Actualizar el campo Tagline en el perfil** para indicar que LinkedIn requiere al menos 100 caracteres en la descripción

---

## 1. Nueva Página: "OG Dinámico para Redes Sociales" (Build Log #02)

### Estructura del contenido

La página seguirá el mismo estilo editorial que el Build Log #01, con:

**Explicación Funcional (para no-técnicos):**
- El problema: cuando compartes un link en redes sociales, estas muestran una "tarjeta" con imagen, título y descripción
- Por defecto, las SPAs (apps de una sola página) muestran siempre la misma tarjeta genérica
- La solución: detectar cuando una red social pide el link y servirle HTML personalizado con los datos del usuario

**Explicación Técnica (en términos simples):**
- Arquitectura de 3 capas: Vercel (router) + Vercel Functions (proxy) + Supabase Edge Functions (generador de HTML)
- El flujo paso a paso de cómo una petición de LinkedIn termina mostrando los datos correctos
- Por qué necesitamos un "proxy" intermedio (evitar errores 500 de LinkedIn por redirects cross-domain)

**Diagrama visual:**
- Flujo desde que LinkedIn hace scrape hasta que recibe el HTML personalizado
- Implementado con componentes de React (boxes, arrows) o una imagen

### Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `src/pages/BuildLogOgDynamic.tsx` | **Crear** - Nueva página con el contenido del Build Log #02 |
| `src/components/buildlog/OgFlowDiagram.tsx` | **Crear** - Componente visual del diagrama de flujo |
| `src/components/buildlog/BuildLogSidebar.tsx` | **Modificar** - Agregar entrada #02 al sidebar |
| `src/App.tsx` | **Modificar** - Agregar ruta `/buildlog/og-dynamic` |

---

## 2. Advertencia de 100 caracteres para LinkedIn

### Ubicación del cambio

En la sección **Branding** (`/me/branding`), dentro del componente `OgImageSection.tsx`, agregaremos una nota informativa debajo del tagline preview en el mock de LinkedIn.

Alternativamente (y más útil), podemos agregar la advertencia en el campo **Tagline** del `ProfileTab.tsx` ya que es ahí donde el usuario ingresa la descripción que se usa como `og:description`.

### Implementación

**En `ProfileTab.tsx` - Campo Tagline:**
- Agregar un indicador visual cuando el tagline tenga menos de 100 caracteres
- Mostrar un mensaje tipo: "LinkedIn recomienda al menos 100 caracteres"
- Cambiar el maxLength de 100 a 160 (límite óptimo para SEO)

**En `OgImageSection.tsx` - Mock de LinkedIn:**
- Mostrar badge de advertencia si el tagline tiene menos de 100 caracteres
- Añadir nota en la sección informativa sobre el requisito de LinkedIn

---

## Sección Técnica: Detalles de Implementación

### Nueva página BuildLogOgDynamic.tsx

```text
Estructura:
├── Header (Badge #02, Título, Subtítulo, Meta)
├── Sección: El Problema (por qué las SPAs fallan)
├── Sección: La Solución Funcional
│   └── Explicación simple con analogía
├── Sección: Arquitectura Técnica
│   └── OgFlowDiagram component
│   └── Explicación paso a paso
├── Sección: Componentes Clave
│   └── StackCards para Vercel, Supabase
│   └── ProTipCallouts con tips
└── Conclusión
```

### Diagrama de Flujo (OgFlowDiagram.tsx)

```text
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  LinkedIn   │────▶│   Vercel    │────▶│   Vercel    │────▶│  Supabase   │
│   Scraper   │     │   Router    │     │  Function   │     │    Edge     │
│             │     │ (rewrite)   │     │  (proxy)    │     │  Function   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                   │
      │  GET /@username   │  /@username →     │  fetch() →        │  Query DB
      │  User-Agent:      │  /api/og?user=    │  Supabase         │  Return HTML
      │  LinkedInBot      │                   │                   │
      │                   │                   │                   │
      └───────────────────┴───────────────────┴───────────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   HTML Response     │
                         │   <og:title>        │
                         │   <og:description>  │
                         │   <og:image>        │
                         └─────────────────────┘
```

### Sidebar actualizado

```typescript
const entries: BuildLogEntry[] = [
  {
    id: '01',
    number: '01',
    title: 'El Stack & Arquitectura',
    subtitle: 'Lovable, Supabase & Vercel.',
    href: '/buildlog',
  },
  {
    id: '02',
    number: '02',
    title: 'OG Dinámico en Redes',
    subtitle: 'LinkedIn, WhatsApp & X.',
    href: '/buildlog/og-dynamic',
    isActive: false, // Dinámico según ruta
  },
];
```

### Campo Tagline con advertencia

```typescript
// En ProfileTab.tsx
<div className="space-y-2">
  <Label htmlFor="tagline">Tagline</Label>
  <Input
    value={profile.tagline || ''}
    onChange={e => onUpdate({ tagline: e.target.value.slice(0, 160) })}
    maxLength={160}
  />
  <div className="flex justify-between text-xs text-muted-foreground">
    <span className={cn(
      (profile.tagline?.length || 0) < 100 && "text-amber-600"
    )}>
      {(profile.tagline?.length || 0) < 100 && 
        "LinkedIn recomienda min. 100 caracteres"}
    </span>
    <span>{profile.tagline?.length || 0}/160</span>
  </div>
</div>
```

---

## Resumen de Archivos

| Archivo | Cambio |
|---------|--------|
| `src/pages/BuildLogOgDynamic.tsx` | Crear - Página completa del Build Log #02 |
| `src/components/buildlog/OgFlowDiagram.tsx` | Crear - Diagrama visual del flujo |
| `src/components/buildlog/BuildLogSidebar.tsx` | Modificar - Agregar entrada #02, hacer items clickeables |
| `src/App.tsx` | Modificar - Agregar ruta `/buildlog/og-dynamic` |
| `src/components/me/ProfileTab.tsx` | Modificar - Aumentar maxLength a 160, agregar warning |
| `src/components/me/OgImageSection.tsx` | Modificar - Agregar nota sobre requisito de LinkedIn |

