

# Plan: Corregir Meta Tags OG para LinkedIn y WhatsApp

## Diagnóstico Confirmado

### Lo que está pasando:

1. **La Edge Function funciona perfectamente** - Devuelve "Rosmel Ortiz" con todos los meta tags correctos

2. **Vercel hace redirect 307 a `/api/og/:username`** - El proxy funciona

3. **Pero LinkedIn/WhatsApp ven datos default** por dos razones:
   - La `site_url` está configurada como `vibecoders.la` pero tú usas `building.vibecoders.la`
   - LinkedIn puede estar leyendo el `index.html` antes de seguir el redirect

### Evidencia en la imagen de Facebook Debug:
```
URL canónica: https://building.vibecoders.la/api/og/rosmelortiz
              https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/og-profile-meta?username=rosmelortiz (hace 25 minutos)
```
Facebook está cacheando la versión de hace 25 minutos, antes de que el proxy funcionara.

---

## Solución en 3 Partes

### Parte 1: Cambiar de Redirect a Rewrite Interno

El problema con `redirect 307` es que LinkedIn puede parsear el HTML original antes de seguir el redirect.

Cambiar en `vercel.json`:
- De `redirects` → `rewrites` (para rutas que van al proxy interno)

Esto hace que Vercel sirva el HTML del proxy directamente sin que el bot vea ningún redirect.

```text
ANTES (redirect):
Bot → Vercel (307) → Bot sigue → /api/og/username → HTML
                  ↓
         Bot ve index.html primero (problema!)

DESPUÉS (rewrite):
Bot → Vercel → /api/og/username → HTML directo
         (sin redirect visible para el bot)
```

### Parte 2: Actualizar site_url para Building

Actualizar la base de datos para que `site_url` sea `https://building.vibecoders.la` en lugar de `https://vibecoders.la`.

Esto asegura que:
- `og:url` sea consistente con la URL real
- `canonical` apunte al dominio correcto
- Los redirects de JavaScript vayan al lugar correcto

**Nota:** Este cambio afecta a todo el sitio. Si necesitas mantener ambos dominios, habría que agregar lógica para detectar el dominio del request.

### Parte 3: Forzar Invalidación de Cache

Una vez aplicados los cambios, usar las herramientas de debug de cada plataforma para forzar re-scraping:
- LinkedIn Post Inspector: hacer clic en "Inspect" de nuevo
- Facebook Debug: hacer clic en "Scrape Again"

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `vercel.json` | Cambiar `redirects` por `rewrites` para bots (mismo dominio) |

## Base de Datos

| Tabla | Key | Valor Nuevo |
|-------|-----|-------------|
| `general_settings` | `site_url` | `https://building.vibecoders.la` |

---

## Cambio Específico en vercel.json

```json
{
  "rewrites": [
    {
      "source": "/@:username",
      "has": [
        {
          "type": "header",
          "key": "user-agent",
          "value": ".*(facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|...).*"
        }
      ],
      "destination": "/api/og/:username"
    },
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

**Importante:** Cuando usamos `rewrites` en lugar de `redirects`, las reglas con `has` (condiciones) deben evaluarse primero, antes del catch-all `/(.*) → /`.

---

## Verificación Post-Implementación

1. Probar con curl:
```bash
curl -A "LinkedInBot" "https://building.vibecoders.la/@rosmelortiz" | head -20
```
Debería mostrar directamente el HTML con "Rosmel Ortiz" sin ningún redirect

2. LinkedIn Post Inspector - hacer nuevo Inspect
3. Facebook Debug Tool - hacer "Scrape Again"

---

## Consideración Alternativa: Soporte Multi-Dominio

Si necesitas soportar tanto `vibecoders.la` como `building.vibecoders.la`, la Edge Function tendría que detectar el dominio del request y generar URLs acordes. Esto requeriría pasar el dominio como parámetro desde el proxy de Vercel.

