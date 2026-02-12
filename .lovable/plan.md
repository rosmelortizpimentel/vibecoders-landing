

# Rediseno de la seccion "Acceso Cerrado" en la Landing

## Objetivo
Reemplazar el actual `FreemiumBanner` (seccion blanca basica con botones de login) por una seccion premium estilo dark con multiples bloques informativos cuando los cupos de fundador se agotan.

## Estructura de la nueva seccion

La seccion reemplazara el `FreemiumBanner` actual (lineas 547-620 de `NewLanding.tsx`) con un componente de fondo oscuro (`#000519`) que contiene los siguientes bloques en orden vertical:

```text
+-----------------------------------------------+
|  ACCESO CERRADO (badge)                        |
|  Los primeros 100 vibecoders ya estan dentro   |
|  [Avatar stack con fotos reales]               |
|  Texto de acceso completado                    |
+-----------------------------------------------+
|  LANZAMIENTO OFICIAL (label)                   |
|  [Countdown: DD : HH : MM : SS]               |
|  (basado en timezone Toronto, Canada)          |
+-----------------------------------------------+
|  Lo que viene: Vibecoders Communication Suite  |
|  Widgets embebibles que reemplazan +$500/mes   |
|  [Grid 2x5 de widgets con iconos]              |
+-----------------------------------------------+
|  Quieres saber un poco mas y estar en la       |
|  lista de espera?                              |
|  [Boton LinkedIn] [Boton Google]               |
+-----------------------------------------------+
|  Precio exclusivo de lanzamiento               |
|  (solo para lista de espera)                   |
|  Texto de urgencia y sin tarjeta               |
+-----------------------------------------------+
```

## Cambios por archivo

### 1. `src/pages/NewLanding.tsx`
- Reescribir el componente `FreemiumBanner` con la nueva estructura premium
- Agregar un hook `useCountdown` local (mismo patron que `Closed.tsx`) con fecha objetivo `2026-03-01T00:00:00-05:00` (timezone Toronto/EST)
- Reutilizar las mismas URLs de avatar que ya existen en el componente actual
- Reutilizar los iconos de widgets del array `WIDGET_ICONS` (mismo patron que `Closed.tsx`)
- Mantener los botones de LinkedIn y Google con los mismos handlers existentes

### 2. Archivos de traduccion (4 idiomas)
Agregar nuevas claves bajo `pricing.closed` en cada archivo:

**`src/i18n/es/newLanding.json`** - Agregar:
- `pricing.closed.badge`: "ACCESO CERRADO"
- `pricing.closed.title`: "Los primeros 100 vibecoders ya estan dentro"
- `pricing.closed.joinedText`: "+{{count}} builders activos"
- `pricing.closed.subtitle`: "El acceso exclusivo para founders se ha completado."
- `pricing.closed.comingSoon`: "Pero algo grande viene el 1 de marzo."
- `pricing.closed.launchLabel`: "Lanzamiento oficial"
- `pricing.closed.days/hours/minutes/seconds`: labels del countdown
- `pricing.closed.suiteTitle`: "Lo que viene: Vibecoders Communication Suite"
- `pricing.closed.suiteSubtitle`: "Widgets embebibles que reemplazan +$500/mes en herramientas SaaS"
- `pricing.closed.waitlistTitle`: "Quieres saber un poco mas y estar en la lista de espera?"
- `pricing.closed.ctaLinkedIn`: "Continuar con LinkedIn"
- `pricing.closed.ctaGoogle`: "Continuar con Google"
- `pricing.closed.priceTitle`: "Precio exclusivo de lanzamiento"
- `pricing.closed.priceSubtitle`: "(solo para lista de espera)"
- `pricing.closed.priceNote`: "Este lanzamiento es diferente: solo sera accesible por tiempo limitado."
- `pricing.closed.trustText`: "Sin tarjeta. Te avisamos cuando lanzamos."

Lo mismo para `en/newLanding.json`, `fr/newLanding.json`, `pt/newLanding.json`.

Tambien se reutilizaran las claves de widgets ya existentes en `closed.json` (`suite.widgets.*`) referenciando desde el namespace `closed`.

### 3. Detalle de diseno visual
- Fondo: `bg-[#000519]` con bordes superior/inferior suaves
- Badge "ACCESO CERRADO" con icono Lock, borde sutil, estilo pill
- Avatar stack: las 6 fotos reales ya existentes con texto "+N builders activos"
- Countdown: estilo monospace con cajas semi-transparentes (mismo patron visual de `Closed.tsx`)
- Grid de widgets: 2 columnas mobile, 5 columnas desktop, iconos de Lucide
- Botones de auth: LinkedIn (azul profesional) y Google (blanco con borde) dentro de un contenedor con sombra sutil
- Seccion de precio: texto `$24/ano` destacado en color secondary/dorado, nota de urgencia debajo
- Sin emojis en ningun lugar
- Tipografia limpia, tracking amplio en labels, peso bold en titulos

### 4. Widgets reutilizados
Se importaran los mismos iconos que usa `Closed.tsx`: Bug, Map, Activity, Megaphone, FileText, Vote, HelpCircle, Star, Users, Compass. Se definira el array de widgets directamente en el componente.

## Seccion tecnica

- El countdown usa `Date.now()` vs fecha fija `2026-03-01T00:00:00-05:00` (EST/Toronto)
- Se mantiene la logica condicional existente: `if (spotsLeft <= 0)` renderiza el nuevo componente en vez del pricing normal
- Los handlers `onLinkedInClick` y `onGoogleClick` se pasan como props igual que antes
- No se elimina el codigo del `PricingSection` original (se mantiene para cuando haya cupos)
