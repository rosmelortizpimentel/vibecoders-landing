
## Qué pasó (explicación clara)

- La Edge Function de Supabase **sí está generando HTML correcto por usuario** (tu prueba directa con `.../og-profile-meta?username=ros2` lo confirma: título “Rosmel Ortiz”, description y og:image correctos).
- Pero cuando las redes sociales (y tu prueba `/?og=1`) piden `https://building.vibecoders.la/@ros2`, **no están recibiendo ese HTML**, sino el `index.html` de la SPA.
- Por eso todas las redes muestran el preview genérico: están parseando los OG tags estáticos de `index.html`.

La señal más fuerte es esta:  
- `/@ros1?og=1` te muestra “tu página” (SPA) y **no** el HTML “simple” que genera OG.  
Eso significa que el rewrite a `/api/og/...` no está ejecutándose o no está llegando a una Function.

## Causa probable (la que vamos a atacar)

Hay 2 fallas típicas en Vercel con SPAs + Functions:

1) **El “catch-all” de la SPA está ganando/interfiriendo**, y al final se termina sirviendo `index.html` en lugar de ejecutar `/api/og/...`.

2) **La ruta dinámica `api/og/[username].ts` no está siendo alcanzable** en tu setup (según configuración/framework), entonces `/api/og/ros2` no “existe” para Vercel y se cae al fallback de SPA.

En ambos casos el resultado es el mismo: nunca se ejecuta la function => no hay logs => previews genéricos.

## Objetivo del fix

Garantizar 100% que:

- `GET /@ros2?og=1` → reescribe a un endpoint de Vercel que **sí corre** → proxy a Supabase → devuelve HTML OG.
- Los bots (LinkedInBot/WhatsApp/etc) → también reciben ese HTML OG.
- La navegación normal en browser `GET /@ros2` (sin `og=1` y sin bot UA) → sigue sirviendo la SPA.

---

## Implementación (cambios a realizar)

### A) Hacer el routing “a prueba de balas” en `vercel.json`

1) **Proteger explícitamente `/api/*`** para que nunca se lo trague el catch-all de la SPA.
   - Opción 1 (recomendada): cambiar el catch-all para que **excluya** `api/`.
     - Ejemplo: `"/((?!api/).*)"` en vez de `"/(.*)"`.
   - Opción 2: agregar una regla prioritaria de “passthrough” para `/api/(.*)` antes del catch-all.

2) Mantener las reglas actuales para:
   - `?og=1`
   - User-Agent bots

3) Ajuste adicional recomendado: excluir también otros paths “de infraestructura” si aplica (por ejemplo `favicon.ico`, `robots.txt`, `images/*`) para evitar efectos colaterales del catch-all.

### B) Evitar dependencia de ruta dinámica `[username]` (robustez máxima)

Aunque `api/og/[username].ts` debería funcionar, para eliminar la duda al 100%:

1) Crear un endpoint **no-dinámico**:
   - `api/og.ts` (o `api/og/index.ts`) que lea `username` desde query:
     - `/api/og?username=ros2`

2) Actualizar `vercel.json` para que los rewrites apunten a:
   - **Destino:** `/api/og?username=:username`
   - En vez de `/api/og/:username`

3) Mantener `api/og/[username].ts` como compatibilidad (opcional):
   - Puede seguir existiendo, pero el routing principal usará el endpoint “seguro” con query param.

### C) Headers / caching (para que las redes lo lean bien y puedas debuggear)

En el proxy de Vercel (`api/og.ts`):

1) Forzar siempre:
   - `Content-Type: text/html; charset=utf-8`

2) Mantener headers de debug:
   - `X-Og-Source: vercel-proxy`
   - `X-Og-Username: ...`
   - `X-Og-Upstream-Status: ...`
   - y reenviar `X-Og-Profile-Found` si existe

3) (Opcional para diagnóstico rápido) Reducir cache temporalmente:
   - `Cache-Control: public, max-age=60, s-maxage=60`
   - Esto no elimina la cache de LinkedIn, pero ayuda a no “pelearte” con cache intermedia/CDN mientras verificamos.

---

## Verificación (paso a paso, sin herramientas raras)

Después del deploy:

1) Probar directamente la Function (esto debe generar logs sí o sí en Vercel):
   - `https://building.vibecoders.la/api/og?username=ros2`
   - Resultado esperado: HTML simple con `<title>Rosmel Ortiz</title>`.

2) Probar el rewrite manual:
   - `https://building.vibecoders.la/@ros2?og=1`
   - Resultado esperado: el mismo HTML simple (no la SPA).

3) “Ver código fuente”:
   - View Source del URL anterior debe mostrar OG tags de Rosmel, no el `index.html` con `<script type="module" src="/src/main.tsx">`.

4) Re-scrape:
   - LinkedIn Post Inspector con `https://building.vibecoders.la/@ros2`
   - WhatsApp share del mismo link

Si (1) funciona pero (2) no, el problema quedó 100% reducido a `vercel.json` (matching/precedencia).  
Si (1) no funciona, el problema es que la Function no está desplegada/alcanzable (y entonces ajustamos de inmediato la estructura del endpoint).

---

## Archivos que se van a tocar

- `vercel.json` (prioridad: routing correcto + excluir `/api`)
- `api/og.ts` (nuevo, endpoint estable con query param)
- (Opcional) `api/og/[username].ts` (dejarlo o ajustar para compatibilidad)

---

## Riesgos / edge cases contemplados

- Username inválido: se devuelve HTML default (pero siempre HTML válido).
- Error llamando a Supabase: fallback HTML (ya lo tienes) para no romper previews.
- Bots que no matchean el regex de UA: seguirá funcionando `?og=1` para test y se puede ampliar el regex luego.

