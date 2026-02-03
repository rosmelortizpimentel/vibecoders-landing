
# Plan: Servir OG Metadata desde el Mismo Dominio (Sin Redirect)

## Problema Confirmado

El curl muestra que Vercel **sí hace el redirect** correctamente:
```
HTTP/1.1 307 Temporary Redirect
Location: https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/og-profile-meta?username=rosmelortiz
```

Pero **LinkedIn no sigue redirects a dominios externos** (de `building.vibecoders.la` a `supabase.co`), lo que causa el error 500.

Tu screenshot confirma que la Edge Function funciona perfectamente - el problema es solo el redirect cross-domain.

---

## Solución: Vercel Serverless Function como Proxy

Crear una función en Vercel que:
1. Reciba la petición del bot
2. Haga fetch internamente a la Edge Function de Supabase
3. Devuelva el HTML directamente (sin redirect)

```text
ANTES (redirect que LinkedIn no sigue):
LinkedIn → Vercel (307) → ❌ LinkedIn no sigue

DESPUÉS (proxy interno):
LinkedIn → Vercel → fetch(Supabase) → HTML directo → ✅ LinkedIn lee tags
```

---

## Archivos a Crear/Modificar

### 1. Nueva carpeta y función: `api/og/[username].ts`

Vercel detecta automáticamente funciones en la carpeta `api/`. Esta función:
- Extrae el username del path
- Hace fetch a la Edge Function de Supabase
- Devuelve el HTML con los headers correctos

```typescript
// api/og/[username].ts
export default async function handler(req, res) {
  const { username } = req.query;
  
  const response = await fetch(
    `https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/og-profile-meta?username=${username}`
  );
  
  const html = await response.text();
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(html);
}
```

### 2. Actualizar `vercel.json`

Cambiar el destino del redirect para que apunte a la función local en vez de Supabase:

```json
{
  "redirects": [
    {
      "source": "/@:username",
      "has": [
        {
          "type": "header",
          "key": "user-agent",
          "value": ".*(LinkedInBot|facebookexternalhit|Twitterbot|WhatsApp|...).*"
        }
      ],
      "destination": "/api/og/:username",
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

## Flujo Después del Cambio

```text
1. LinkedIn solicita: https://building.vibecoders.la/@rosmelortiz
2. Vercel detecta User-Agent de LinkedIn
3. Vercel redirige internamente a /api/og/rosmelortiz (mismo dominio)
4. La función hace fetch a Supabase Edge Function
5. Devuelve HTML directamente a LinkedIn
6. LinkedIn lee todos los meta tags correctamente
```

---

## Ventajas de Esta Solución

| Aspecto | Beneficio |
|---------|-----------|
| Mismo dominio | LinkedIn no ve redirect cross-domain |
| Edge Function intacta | No duplicamos lógica, solo proxy |
| Cache | Podemos cachear en Vercel Edge |
| Escalable | Funciona para todos los bots sin cambios |

---

## Consideraciones Técnicas

1. **La Edge Function es pública** (`verify_jwt = false`) - No hay problema de autenticación
2. **Latencia mínima** - Es un fetch simple, ~100-200ms adicionales
3. **Sin secretos expuestos** - La función solo hace un fetch público

---

## Archivos Finales

| Archivo | Acción |
|---------|--------|
| `api/og/[username].ts` | Crear - Serverless function proxy |
| `vercel.json` | Modificar - Apuntar a `/api/og/:username` |

---

## Prueba Post-Implementación

1. Publicar cambios
2. Probar con curl:
   ```bash
   curl -I -A "LinkedInBot" "https://building.vibecoders.la/@rosmelortiz"
   ```
   - Debería mostrar `200 OK` con `Content-Type: text/html`
   
3. LinkedIn Post Inspector:
   - Ya no debería mostrar 500
   - Debería leer "Rosmel Ortiz" y la imagen OG
