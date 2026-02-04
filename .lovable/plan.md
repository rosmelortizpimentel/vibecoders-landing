

## Objetivo
Resolver el error 500 que LinkedIn Post Inspector recibe al inspeccionar URLs como `https://building.vibecoders.la/@hgf`, mientras WhatsApp y Twitter funcionan correctamente.

---

## Diagnóstico completo

### Lo que funciona ✅
- **WhatsApp**: Muestra los metadatos correctamente
- **Twitter**: Título y descripción se muestran (imagen pendiente)
- **curl directo a `/api/og/`**: Devuelve "Rosmel Ortiz" correctamente
- **Edge Function de Supabase**: Responde 200 OK con los metadatos correctos

### Lo que falla ❌
- **LinkedIn Post Inspector**: Recibe 500 cuando inspecciona `/@username`

### Evidencia técnica
| Componente | Status | Timestamp |
|------------|--------|-----------|
| Supabase Edge Function | 200 OK | 1770177766889 |
| LinkedIn recibe | 500 | 1770177766923 |
| Diferencia | **34ms** | - |

El 500 se genera **después** de que Supabase responde exitosamente, lo que indica que **Vercel está fallando al procesar la respuesta proxy**.

---

## Causa probable
El header `Content-Security-Policy: default-src 'none'; sandbox` que Supabase agrega automáticamente puede estar causando que Vercel rechace o modifique la respuesta de manera incompatible con LinkedIn.

Además, la Edge Function no tiene headers CORS explícitos, lo cual algunos proxies intermedios pueden requerir.

---

## Solución propuesta

### Cambio 1: Agregar CORS headers a la Edge Function
Agregar headers CORS permisivos para asegurar que cualquier proxy/crawler pueda recibir la respuesta correctamente:

```typescript
// En og-profile-meta/index.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
}

// En generateHtmlResponse()
return new Response(html, {
  status: 200,
  headers: {
    ...corsHeaders,
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    'X-Content-Type-Options': 'nosniff',
  },
})
```

### Cambio 2: Agregar handler OPTIONS
Para manejar preflight requests que algunos proxies pueden enviar:

```typescript
// Al inicio de Deno.serve()
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders })
}
```

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/og-profile-meta/index.ts` | Agregar CORS headers y handler OPTIONS |

---

## Verificación post-deploy

### 1. Desplegar Edge Function
Los cambios se desplegarán automáticamente.

### 2. Probar con curl
```bat
curl -A "LinkedInBot" "https://building.vibecoders.la/@hgf" 2>nul | findstr /i "og:title title"
```

### 3. Re-inspeccionar en LinkedIn
1. Ir a [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/inspect/https%3A%2F%2Fbuilding.vibecoders.la%2F%40hgf)
2. Click "Inspect" nuevamente
3. Verificar que ya no muestre 500

---

## Por qué esto debería funcionar
1. Los headers CORS explícitos aseguran que Vercel no bloquee/modifique la respuesta
2. El handler OPTIONS maneja cualquier preflight request que pueda estar causando el 500
3. Los headers adicionales (`X-Content-Type-Options`) ayudan a que los proxies traten la respuesta correctamente

---

## Riesgo / Fallback
Si después de estos cambios LinkedIn sigue dando 500, la alternativa sería cambiar de estrategia y usar Vercel Serverless Functions en vez de rewrites externos (esto requeriría habilitar Node.js functions en el proyecto).

