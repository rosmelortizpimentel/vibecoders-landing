
## Objetivo
Restaurar previews OG por usuario (nombre/tagline/imagen) en **LinkedIn + WhatsApp + X** al compartir:
- `https://building.vibecoders.la/@ros1`
sin exponer claves críticas (service role) y con un método de debugging verificable.

---

## Lo que ya comprobamos (y por qué NO es “permisos”)
1. **RLS en Supabase está bien para lectura pública**:
   - `general_settings`: `SELECT` para `anon, authenticated`
   - `profiles`: existe `Public profiles are viewable by everyone` para `anon, authenticated`
2. En DB existe el perfil y datos de `ros1`:
   - `name = "Rosmel Ortiz"`, `tagline` y `og_image_url` existen.
3. La razón más probable de que **todas las redes muestren genérico** es que los bots están recibiendo **el `index.html` del SPA** (OG genérico), porque el rewrite condicional por User-Agent **no está activándose** (config de `vercel.json`) o porque el HTML OG actual induce redirect/fallback.

Esto encaja perfecto con tu síntoma: “todo responde 200 pero con datos genéricos” → significa que el crawler no está viendo el HTML OG dinámico.

---

## Causa raíz más probable en `vercel.json`
Tu `vercel.json` usa:
```json
"has": [{ "type": "header", "key": "User-Agent", ... }]
```
En Vercel, el matching de headers en `has` suele requerir el header key en minúscula (`user-agent`). Con `User-Agent`, el match puede no ocurrir y entonces **cae al catch-all**:
```json
{ "source": "/(.*)", "destination": "/" }
```
y eso sirve el SPA con OG genérico.

---

## Estrategia (robusta y sin claves críticas)
En vez de depender de la Function de Vercel que consulta Supabase con anon key, vamos a hacer que Vercel entregue el HTML OG desde **la Edge Function de Supabase** (`og-profile-meta`), que:
- ya está construida para esto,
- usa `SUPABASE_SERVICE_ROLE_KEY` guardada en **secrets de Supabase** (no en repo),
- y tiene logs en Supabase para debugging confiable.

Vercel solo hace rewrite de bots → Supabase Edge Function.

---

## Cambios a implementar (código)
### 1) `vercel.json`: arreglar “has header” + apuntar a Supabase Edge Function
- Cambiar header key a `user-agent` (minúscula).
- Cambiar el `destination` a URL externa (Supabase Edge Function):
  - `https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/og-profile-meta?username=:username`
- Agregar ruta de debug manual para forzar OG sin depender del User-Agent:
  - `https://building.vibecoders.la/@ros1?og=1` debe devolver HTML OG (aunque seas humano en Chrome).
- Agregar compatibilidad con trailing slash por si algún crawler pide `.../@ros1/`.

Resultado: si el bot es bot (o si usas `?og=1`), **no ve el SPA**, ve HTML OG dinámico.

### 2) `supabase/functions/og-profile-meta/index.ts`: eliminar el meta-refresh en `<noscript>` (muy importante)
Ahora la Edge Function incluye:
```html
<noscript>
  <meta http-equiv="refresh" content="0; url=...">
</noscript>
```
Algunos crawlers/parsers pueden tratar eso como redirect “real” y terminar en el SPA, lo cual vuelve a “genérico”.

Plan:
- Remover el `<noscript>` meta refresh.
- (Opcional) Mantener o remover el `<script>window.location.replace(...)`:
  - Como este endpoint idealmente lo reciben bots, se puede dejar sin redirect para hacerlo “crawler-puro”.
- Agregar headers de diagnóstico no sensibles:
  - `X-Og-Username: ros1`
  - `X-Og-Profile-Found: true/false`
  - `X-Og-Source: supabase-edge`

### 3) `api/og/[username].ts` (Vercel Function): dejarlo como fallback o desactivarlo
Para evitar más iteraciones:
- Opción A (recomendada): dejarlo pero ya no usarlo en rewrites (no importa si existe).
- Opción B: convertirlo en **proxy** que simplemente hace fetch a la Edge Function y devuelve el HTML (sin keys hardcodeadas).
- En ambos casos, no agregaremos service role ni claves críticas a Vercel.

---

## Deploy: qué tienes que hacer y qué NO
### Vercel
No hay “deploy especial” para functions.
- Si tu proyecto Vercel está conectado al repo, basta con:
  1) commit de cambios (`vercel.json` y si aplica `api/og/...`)
  2) Vercel hace build/deploy automáticamente
  3) verificar que el dominio `building.vibecoders.la` apunta al deployment “Production” correcto

No necesitas permisos extra en Vercel para rewrites.

### Supabase Edge Function
Si modificamos `og-profile-meta`, sí hay que asegurarse de que el código actualizado esté desplegado en Supabase.
- Lo validaremos por logs en Supabase Function Logs luego de probar.

---

## Cómo vamos a verificar (paso a paso, sin adivinar)
1) **Prueba directa (manual debug)**:
   - Abrir: `https://building.vibecoders.la/@ros1?og=1`
   - Debe mostrarse HTML con:
     - `<title>Rosmel Ortiz</title>`
     - `og:title = Rosmel Ortiz`
     - `og:image = (og_image_url o avatar_url)`
2) **Ver logs en Supabase Edge Function** (fuente de verdad):
   - Debe aparecer request con `username=ros1` y “Found profile”.
3) **Rescrape redes** (porque cachean fuerte):
   - LinkedIn Post Inspector: “Scrape again”
   - WhatsApp: compartir una vez con cache-buster si hace falta:
     - `https://building.vibecoders.la/@ros1?v=1700000000`
   (El preview final debe mostrar datos del usuario.)

---

## Seguridad (explícito)
- NO se agregará `SUPABASE_SERVICE_ROLE_KEY` a Vercel, repo, frontend ni functions de Vercel.
- La Edge Function de Supabase seguirá usando la service role desde **secrets del proyecto Supabase**.
- La anon key no es crítica, pero igualmente reduciremos su uso para minimizar superficie de ataque y confusión.

---

## Plan de rollback (si algo sale mal)
- Revertir `vercel.json` al estado actual para volver al comportamiento anterior del SPA.
- Mantener la Edge Function sin cambios si el rewrite externo no fuese viable (raro, pero posible).

---

## Próximas mejoras sugeridas (para evitar futuras iteraciones)
- Agregar un endpoint de “health/debug” tipo `/og-debug/@:username` que siempre entregue HTML OG (sin depender de User-Agent).
- Añadir tests automatizados (snapshot) para el HTML OG generado.

