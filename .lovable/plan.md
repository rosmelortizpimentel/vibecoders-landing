
# Plan: Metadatos OG Dinámicos para Perfiles Públicos

## Problema
Cuando compartes una URL como `https://vibecoders.la/@rosmel`, los crawlers de redes sociales (Facebook, Twitter, LinkedIn, WhatsApp) no ejecutan JavaScript. Como la app es una SPA de React, los metadatos OG del `index.html` son estáticos y genéricos, resultando en previsualizaciones incorrectas.

## Solución
Crear un sistema de pre-renderizado de metadatos utilizando una Edge Function de Supabase que detecte crawlers y devuelva HTML con metadatos dinámicos del perfil.

## Arquitectura

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         Flujo de Solicitud                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Usuario normal:                                                    │
│   ┌────────┐    ┌─────────┐    ┌─────────────┐                      │
│   │ Browser │───▶│ Vercel  │───▶│ React SPA   │                      │
│   └────────┘    └─────────┘    │ (index.html)│                      │
│                                 └─────────────┘                      │
│                                                                      │
│   Crawler (Facebook, Twitter, etc):                                  │
│   ┌─────────┐    ┌─────────┐    ┌───────────────────┐               │
│   │ Crawler │───▶│ Vercel  │───▶│ Supabase Edge Fn  │               │
│   └─────────┘    │ (rewrite)│    │ og-profile-meta   │               │
│                  └─────────┘    └─────────┬─────────┘               │
│                                           │                          │
│                                           ▼                          │
│                                 ┌─────────────────────┐             │
│                                 │ HTML con meta tags  │             │
│                                 │ dinámicos + redirect│             │
│                                 │ a SPA para usuarios │             │
│                                 └─────────────────────┘             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Cambios a Implementar

### 1. Nueva Edge Function: `og-profile-meta`
Crear una función que:
- Reciba el username desde la URL
- Consulte el perfil en la base de datos
- Genere HTML mínimo con metadatos OG dinámicos
- Incluya un script de redirección para usuarios reales (no crawlers)
- Fallback a metadatos default si el perfil no existe

**Metadatos dinámicos generados:**
- `og:title` → Nombre del usuario
- `og:description` → Tagline del usuario
- `og:image` → Avatar del usuario
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- `link rel="icon"` → Avatar como favicon

### 2. Actualizar `vercel.json`
Configurar rewrites condicionales basados en User-Agent para detectar crawlers:
- Bots detectados: facebookexternalhit, Twitterbot, LinkedInBot, WhatsApp, TelegramBot, Slackbot, etc.
- Redirigir peticiones de bots a la Edge Function
- Mantener el comportamiento normal para usuarios

### 3. Lógica de Fallback
Si el username no existe o hay error:
- Usar los metadatos default del home (título genérico, imagen de Vibecoders)
- El usuario será redirigido a la landing page por la SPA

## Detalles Técnicos

### Edge Function `og-profile-meta`
```text
Endpoint: /functions/v1/og-profile-meta?username=rosmel

Respuesta (Content-Type: text/html):
- HTML mínimo con <head> conteniendo todos los meta tags
- Script que redirige al usuario real a la URL original
- Los crawlers leen los meta tags y no ejecutan JS
```

### Configuración Vercel (vercel.json)
```text
Rewrites con condición has[].type: "header" para User-Agent:
- Patrón: /@:username
- Destino para bots: URL de la Edge Function de Supabase
- Destino normal: / (SPA)
```

### Metadatos generados por perfil
| Campo | Valor |
|-------|-------|
| og:title | `{nombre}` (o username si no hay nombre) |
| og:description | `{tagline}` (o bio, o default si no hay) |
| og:image | `{avatar_url}` (o default Vibecoders) |
| og:url | `https://vibecoders.la/@{username}` |
| favicon | `{avatar_url}` dinámico |

## Archivos a Crear/Modificar

| Archivo | Acción |
|---------|--------|
| `supabase/functions/og-profile-meta/index.ts` | Crear nueva Edge Function |
| `vercel.json` | Modificar para agregar rewrites condicionales |

## Resultado Esperado
Al compartir `https://vibecoders.la/@rosmel` en cualquier red social:
- La miniatura mostrará el avatar del usuario
- El título será el nombre del usuario
- La descripción será su tagline
- Si el perfil no existe, se mostrarán los datos default de Vibecoders
