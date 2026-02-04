
## Diagnóstico Final

La Edge Function de Supabase funciona perfectamente (logs confirman: "Found profile: Rosmel Ortiz", responde 200 con todos los datos correctos). El problema es que **Vercel está fallando al hacer el rewrite externo a Supabase** para el User-Agent de LinkedIn.

### Por qué WhatsApp funciona y LinkedIn no:
- Vercel `rewrites` a URLs externas puede tener comportamiento inconsistente
- El rewrite externo puede funcionar para algunos bots pero fallar para otros
- LinkedIn reporta exactamente HTTP 500 desde `building.vibecoders.la`, lo que indica que Vercel falla al hacer proxy de la respuesta

---

## Solución Propuesta

En lugar de hacer rewrite externo a Supabase (que es problemático), hacer que `vercel.json` redirija a la **función local de Vercel** (`/api/og/:username`) y **convertir esa función en un proxy** que llama a la Edge Function de Supabase.

### Ventajas de este enfoque:
1. Los rewrites internos de Vercel son 100% confiables
2. La función de Vercel actúa como proxy transparente
3. La Edge Function de Supabase sigue manejando la lógica (con service_role)
4. No hay keys críticas expuestas adicionales

---

## Cambios a Implementar

### 1) `vercel.json` - Volver a rewrites internos

```json
{
  "rewrites": [
    {
      "source": "/@:username",
      "has": [{ "type": "query", "key": "og", "value": "1" }],
      "destination": "/api/og/:username"
    },
    {
      "source": "/@:username/",
      "has": [{ "type": "query", "key": "og", "value": "1" }],
      "destination": "/api/og/:username"
    },
    {
      "source": "/@:username",
      "has": [{
        "type": "header",
        "key": "user-agent",
        "value": ".*(facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|...).*"
      }],
      "destination": "/api/og/:username"
    },
    {
      "source": "/@:username/",
      "has": [{
        "type": "header",
        "key": "user-agent",
        "value": ".*(facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|...).*"
      }],
      "destination": "/api/og/:username"
    },
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

### 2) `api/og/[username].ts` - Convertir en proxy a Supabase Edge Function

En lugar de hacer las consultas directamente a la DB con anon key, la función hará:

```typescript
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { username } = req.query;
  const usernameStr = Array.isArray(username) ? username[0] : username || '';

  try {
    // Proxy a la Edge Function de Supabase
    const response = await fetch(
      `https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/og-profile-meta?username=${encodeURIComponent(usernameStr)}`
    );

    // Copiar headers relevantes
    res.setHeader('Content-Type', response.headers.get('Content-Type') || 'text/html');
    res.setHeader('Cache-Control', response.headers.get('Cache-Control') || 'public, max-age=3600');
    
    // Headers de debug
    res.setHeader('X-Og-Source', 'vercel-proxy');
    res.setHeader('X-Og-Username', usernameStr);
    res.setHeader('X-Og-Upstream-Status', response.status.toString());

    const html = await response.text();
    return res.status(response.status).send(html);

  } catch (error) {
    console.error('[og-proxy] Error:', error);
    // Fallback a HTML genérico
    return res.status(500).send('Error fetching OG metadata');
  }
}
```

Este enfoque:
- Elimina la `anon_key` hardcodeada de la función de Vercel
- Usa la Edge Function de Supabase que ya funciona y tiene `service_role`
- Los rewrites internos de Vercel son confiables
- Mantiene logs en ambos lados (Vercel + Supabase) para debugging

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `vercel.json` | Cambiar destination de URL externa a `/api/og/:username` |
| `api/og/[username].ts` | Convertir en proxy simple que llama a la Edge Function de Supabase |

---

## Verificación Post-Deploy

1. **Test manual**: `https://building.vibecoders.la/@ros1?og=1` debe mostrar HTML con datos de Rosmel
2. **LinkedIn Post Inspector**: Re-scrape de `https://building.vibecoders.la/@ros1`
3. **WhatsApp**: Compartir link (debería seguir funcionando)

---

## Por qué esto funciona

El flujo será:
```text
LinkedIn Bot → Vercel (rewrite) → /api/og/ros1 → Proxy → Supabase Edge Function → HTML OG
```

En lugar de:
```text
LinkedIn Bot → Vercel (rewrite externo) → ??? → 500 Error
```

Los rewrites internos de Vercel son 100% confiables, el problema estaba en el rewrite externo.
