

## Fix: Normalizar URLs en la verificacion de dominio

### Problema
Cuando un usuario registra su app sin `https://` (ej: `n8nlicensechecker.lovable.app`), la verificacion falla porque:
1. La Edge Function `verify-app-domain` hace `fetch(app.url)` directamente sin protocolo, lo cual no es una URL valida para fetch
2. El modal usa `new URL(appUrl)` para extraer el hostname, que tambien falla sin protocolo

### Solucion

Aplicar normalizacion de URL en **dos puntos**:

**1. Edge Function (`supabase/functions/verify-app-domain/index.ts`)**
- Antes de hacer `fetch(app.url)`, normalizar la URL agregando `https://` si no tiene protocolo
- Linea ~95: agregar logica de normalizacion antes del fetch

```typescript
// Normalize URL
let fetchUrl = app.url.trim();
if (!fetchUrl.startsWith('http://') && !fetchUrl.startsWith('https://')) {
  fetchUrl = `https://${fetchUrl}`;
}
console.log(`[verify-app-domain] Fetching ${fetchUrl}`);
const response = await fetch(fetchUrl, { ... });
```

Tambien normalizar la URL en el mensaje de error y en `verified_url` al guardar.

**2. Modal de verificacion (`src/components/me/VerifyDomainModal.tsx`)**
- Usar la funcion `normalizeUrl` de `src/lib/utils.ts` (ya existe) para normalizar `appUrl` al extraer el hostname en la linea ~75

```typescript
import { normalizeUrl } from '@/lib/utils';
// ...
const hostname = (() => {
  try {
    return new URL(normalizeUrl(appUrl)).hostname;
  } catch {
    return appUrl;
  }
})();
```

### Archivos a modificar
- `supabase/functions/verify-app-domain/index.ts` - Normalizar URL antes del fetch
- `src/components/me/VerifyDomainModal.tsx` - Normalizar URL para extraccion de hostname

