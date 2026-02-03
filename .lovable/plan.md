

# Plan: Actualizar Google Client ID para One Tap

## Problema
El componente `GoogleOneTap.tsx` tiene hardcodeado un Client ID incorrecto que no coincide con el configurado en Google Cloud Console.

## Solución
Actualizar el Client ID en línea 7 del archivo `src/components/GoogleOneTap.tsx`:

```text
Antes:  650134857892-uvvnuq2ivb55i7uoq48fqp4sddvngdph.apps.googleusercontent.com
Después: 787805030135-rm2nv0stobgiuivckbgo2jgoeq12caro.apps.googleusercontent.com
```

## Archivo a Modificar

### `src/components/GoogleOneTap.tsx`
- Cambiar la constante `GOOGLE_CLIENT_ID` al valor correcto proporcionado por el usuario

## Cambio Específico
```tsx
// Línea 7 - Antes
const GOOGLE_CLIENT_ID = '650134857892-uvvnuq2ivb55i7uoq48fqp4sddvngdph.apps.googleusercontent.com';

// Línea 7 - Después
const GOOGLE_CLIENT_ID = '787805030135-rm2nv0stobgiuivckbgo2jgoeq12caro.apps.googleusercontent.com';
```

## Resultado Esperado
Una vez actualizado, el popup automático de Google One Tap debería funcionar correctamente porque:
1. El Client ID coincidirá con la configuración de Google Cloud Console
2. Los dominios autorizados ya están configurados correctamente (vibecoders.la, building.vibecoders.la, etc.)

## Verificación Post-Implementación
1. Cerrar sesión si estás logueado
2. Ir a la página principal (`/`)
3. El popup de Google One Tap debería aparecer sin error 401

