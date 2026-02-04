

## Objetivo
Corregir el rewrite para bots en `/@:username` para que devuelva metadatos dinámicos (ej. "Rosmel Ortiz") en lugar del SPA genérico.

---

## Diagnóstico
- `/api/og/:username` → Supabase funciona correctamente (verificado con curl)
- `/@:username` con User-Agent de bot → Sigue sirviendo `index.html` del SPA
- **Causa**: Vercel no encadena rewrites internos. El destino `/api/og/:username` no se re-evalúa contra la regla que apunta a Supabase.

---

## Solución
Modificar el rewrite de bots para que apunte **directamente** a la Edge Function de Supabase, eliminando el encadenamiento interno.

### Cambio en `vercel.json`

```text
ANTES (no funciona - encadena):
/@:username (bot) → /api/og/:username → (no re-evalúa) → SPA

DESPUÉS (funciona - directo):
/@:username (bot) → https://...supabase.../og-profile-meta?username=:username
```

### Nueva configuración:

```json
{
  "rewrites": [
    {
      "source": "/api/og/:username",
      "destination": "https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/og-profile-meta?username=:username"
    },
    {
      "source": "/@:username",
      "has": [
        {
          "type": "header",
          "key": "User-Agent",
          "value": ".*(facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Googlebot|bingbot|Baiduspider|yandex|Applebot|Pinterest|vkShare|Viber|Skype|Line|Tumblr|Embed|redditbot|Mastodon|Pleroma).*"
        }
      ],
      "destination": "https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/og-profile-meta?username=:username"
    },
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

---

## Archivos a modificar
1. **`vercel.json`** - Cambiar destination del rewrite de bots de `/api/og/:username` a URL externa completa

---

## Verificación post-deploy (Windows)

```bat
curl -A "LinkedInBot" "https://building.vibecoders.la/@rosmelortiz" 2>nul | findstr /i "og:title title"
```

**Esperado**:
```
<title>Rosmel Ortiz</title>
<meta property="og:title" content="Rosmel Ortiz">
```

---

## Post-verificación en redes sociales
Una vez confirmado con curl:
- **LinkedIn Post Inspector**: Volver a inspeccionar la URL
- **Facebook Debug**: Hacer "Scrape Again"
- **WhatsApp**: Enviar en un chat nuevo (cachea fuerte)

