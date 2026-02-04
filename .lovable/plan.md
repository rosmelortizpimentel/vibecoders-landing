

## Objetivo
Hacer que **/api/og/:username** y **/@username (solo bots)** devuelvan siempre el HTML de metadatos dinámicos (ej. “Rosmel Ortiz”), evitando que Vercel entregue el `index.html` genérico del SPA.

---

## Diagnóstico (por qué sigue saliendo genérico)
- El HTML que estás viendo en `curl` coincide exactamente con los meta tags de `index.html` (título “The Official Home for Vibe Coders” e imagen en `storage.googleapis.com/...social-images...`).
- Eso implica que **Vercel NO está sirviendo la función** `/api/og/[username].ts` (por no estar desplegada, por fallback del enrutamiento, o porque la configuración SPA está interceptando la ruta).
- Aunque ya intentamos “proteger” `/api/*` con un rewrite no-op, en la práctica **tu deploy sigue cayendo al catch-all** `/(.*) -> /`.

---

## Solución propuesta (robusta y sin depender de Serverless Functions)
En vez de depender de `/api/og/[username].ts`, haremos que Vercel **proxy/rewrite directamente** a la Edge Function de Supabase (destino externo).  
Esto funciona incluso si el proyecto está desplegado como “static SPA” y Vercel no está publicando funciones Node.

### Cambio clave
1) **Rewrite directo**:
- `/api/og/:username` → `https://<PROJECT>.supabase.co/functions/v1/og-profile-meta?username=:username`

2) Mantener el rewrite para bots:
- `/@:username` (si User-Agent es bot) → `/api/og/:username`

3) Mantener el catch-all del SPA:
- `/(.*)` → `/`

---

## Archivos a tocar
### 1) `vercel.json`
Reordenar/regenerar `rewrites` así (conceptualmente):
- Regla 1 (top priority): `source: /api/og/:username` → `destination: https://...supabase.../og-profile-meta?username=:username`
- Regla 2: `source: /@:username` + `has User-Agent bot regex` → `destination: /api/og/:username`
- Regla 3: catch-all SPA → `/`

> Nota: Con esto, **/api/og/rosmelortiz** ya no depende de `api/og/[username].ts`.

### 2) (Opcional pero recomendado) `api/og/[username].ts`
- Dejarlo como fallback/legacy, pero **quitar la importación de `@vercel/node`** (si Vercel no la resuelve, puede impedir el deploy de la función).
- Agregar un header de debug tipo `x-og-proxy: vercel-function` para saber si alguna vez se está usando.

(Esto opcional porque con el rewrite externo ya quedas cubierto.)

---

## Verificación (Windows)
Después de desplegar en Vercel:

### A) Probar el endpoint proxy en tu dominio
```bat
curl -A "LinkedInBot" "https://building.vibecoders.la/api/og/rosmelortiz" 2>nul | findstr /i "og:title title og:image"
```
Esperado:
- `<title>Rosmel Ortiz</title>` (o su username/nombre real)
- `og:image` apuntando al avatar/banner/og_image_url del perfil o al default del sitio (pero no el genérico de `index.html`)

### B) Probar el rewrite de bots en /@username
```bat
curl -A "LinkedInBot" "https://building.vibecoders.la/@rosmelortiz" 2>nul | findstr /i "og:title title og:image"
```

### C) Confirmación extra por headers (para saber si cae en SPA o proxy)
```bat
curl -I -A "LinkedInBot" "https://building.vibecoders.la/api/og/rosmelortiz"
```
- Si sigue cayendo en SPA, normalmente verás señales de asset estático y no del proxy.
- Si está funcionando, debe ser `200` y `content-type: text/html`.

---

## Post-verificación (caché de redes)
Cuando A y B ya den “Rosmel Ortiz” en curl:
- LinkedIn Post Inspector: “Inspect” otra vez
- Facebook Debug: “Scrape Again”
- WhatsApp: reenviar el link o usar un número/chat nuevo (WhatsApp cachea fuerte)

---

## Riesgos / Edge cases
- Si una plataforma usa un User-Agent no incluido en el regex, seguirá viendo el SPA genérico en `/@username`.
  - Mitigación: ampliar la lista si detectamos otro UA (ej. `Slackbot-LinkExpanding`, `WhatsApp`, `SkypeUriPreview`, etc.).

---

## Entregable final esperado
- `curl` a `https://building.vibecoders.la/api/og/rosmelortiz` muestra meta tags dinámicos.
- `curl` a `https://building.vibecoders.la/@rosmelortiz` con User-Agent de bot también muestra meta tags dinámicos.
- LinkedIn/WhatsApp dejan de mostrar datos default.

