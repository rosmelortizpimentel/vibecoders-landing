

# Plan: Arreglar Perfiles Públicos

## Problema
Las URLs públicas de perfil (`/@founder`, `/@rosmelortiz`) redirigen a la landing porque la Edge Function `get-public-profile` no está deployada en Supabase.

## Causa Raíz
1. La Edge Function existe en el código pero no está activa en Supabase
2. El deploy automático falló o nunca se ejecutó para esta función

## Solución

### Paso 1: Forzar Re-deploy de la Edge Function
Hacer un cambio mínimo en el archivo `supabase/functions/get-public-profile/index.ts` para forzar el re-deploy automático del sistema.

**Cambio:** Agregar un comentario con timestamp para que el sistema detecte el cambio:
```typescript
// Force deploy: 2026-01-30
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
```

### Paso 2: Limpiar código duplicado en usePublicProfile.ts
El hook tiene una llamada a `supabase.functions.invoke` que no se usa (líneas 36-39). Esto es código muerto que debe eliminarse:

**Antes:**
```typescript
try {
  const { data, error: fnError } = await supabase.functions.invoke('get-public-profile', {
    body: null,
    headers: {},
  });

  // Use query params approach since we're calling via URL
  const response = await fetch(
    `https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/get-public-profile?username=${encodeURIComponent(username)}`,
    ...
  );
```

**Después:**
```typescript
try {
  const response = await fetch(
    `https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/get-public-profile?username=${encodeURIComponent(username)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
```

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/get-public-profile/index.ts` | Agregar comentario para forzar deploy |
| `src/hooks/usePublicProfile.ts` | Eliminar código duplicado/muerto |

## Verificación Post-Implementación
1. Esperar 30 segundos después del cambio
2. Probar la URL: `https://vibecoders.la/@founder`
3. Debe mostrar la tarjeta del perfil con:
   - Avatar del usuario
   - Nombre
   - Badge "Vibecoder"

## Nota
Si el deploy sigue fallando después de estos cambios, será necesario verificar el dashboard de Supabase manualmente para confirmar que la función existe.

