
# Plan Actualizado: Resolver Error 500 de LinkedIn + Meta Tags Faltantes

## Diagnóstico Confirmado

### El problema principal:
El analizador está leyendo el `index.html` de la SPA en lugar de la Edge Function. Los meta tags que muestra son:
- `og:title` = "The Official Home for Vibe Coders" (default de la SPA)
- `og:image` = URL de storage.googleapis.com (imagen default de la SPA)

Esto confirma que **Vercel no está redirigiendo correctamente los bots a la Edge Function**.

### Meta tags faltantes identificados:
- `og:url` - Ya existe en la Edge Function pero no se está ejecutando
- `og:logo` - No existe, debemos agregarlo

---

## Solución en Dos Partes

### Parte 1: Arreglar el Routing de Vercel

**Problema:** Los `rewrites` de Vercel a URLs externas (Supabase) están fallando con error 500.

**Solución:** Cambiar de `rewrites` (proxy) a `redirects` (HTTP 302):

```text
ANTES (rewrite = proxy que falla):
LinkedIn → Vercel → Supabase → ERROR 500

DESPUÉS (redirect = directo):
LinkedIn → Vercel (302) → LinkedIn sigue a Supabase directamente → OK
```

**Archivo:** `vercel.json`

```json
{
  "redirects": [
    {
      "source": "/@:username",
      "has": [
        {
          "type": "header",
          "key": "user-agent",
          "value": ".*(facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Googlebot|bingbot|Baiduspider|yandex|Applebot|Pinterest|vkShare|Viber|Skype|Line|Tumblr|Embed|redditbot|Mastodon|Pleroma).*"
        }
      ],
      "destination": "https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/og-profile-meta?username=:username",
      "permanent": false
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

---

### Parte 2: Agregar Meta Tags Faltantes

**Archivo:** `supabase/functions/og-profile-meta/index.ts`

Agregar los siguientes meta tags al HTML generado:

| Tag | Valor | Propósito |
|-----|-------|-----------|
| `og:locale` | `es_LA` | Idioma del contenido |
| `og:logo` | Logo de Vibecoders | Branding en previews (opcional) |
| `og:image:width` | `1200` | Dimensiones para mejor rendering |
| `og:image:height` | `630` | Dimensiones para mejor rendering |
| `og:image:alt` | Descripción de imagen | Accesibilidad |

**Código a agregar en la Edge Function:**

```html
<!-- Open Graph / Facebook -->
<meta property="og:locale" content="es_LA">
<meta property="og:type" content="profile">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${title} - Vibecoders">
<meta property="og:site_name" content="Vibecoders">
<meta property="og:logo" content="${settings.site_url}/images/vibecoders-logo.png">
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `vercel.json` | Cambiar `rewrites` por `redirects` para bots |
| `supabase/functions/og-profile-meta/index.ts` | Agregar `og:locale`, `og:logo`, `og:image:width`, `og:image:height`, `og:image:alt` |
| `public/images/vibecoders-logo.png` | Copiar logo si no existe en esa ruta |

---

## Flujo Después de los Cambios

```text
1. LinkedIn solicita: https://building.vibecoders.la/@rosmelortiz
2. Vercel detecta User-Agent de LinkedIn
3. Vercel responde con 302 Redirect a Edge Function
4. LinkedIn sigue el redirect
5. Edge Function devuelve HTML con todos los meta tags
6. LinkedIn lee correctamente: título, descripción, imagen, URL
```

---

## Prueba Post-Implementación

1. Publicar cambios a Vercel
2. Esperar 1-2 minutos para propagación
3. Ir a LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/inspect/
4. Pegar URL: `https://building.vibecoders.la/@rosmelortiz`
5. Verificar que muestre:
   - Nombre del usuario (no "The Official Home for Vibe Coders")
   - Tagline correcta
   - Imagen OG subida por el usuario
   - URL correcta
