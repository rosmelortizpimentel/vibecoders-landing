
# Plan: Corregir Google One Tap con FedCM y Nonce Hasheado

## Problema
Cuando se usa `use_fedcm_for_prompt: true`, Google hashea el nonce con SHA-256 antes de incluirlo en el ID token. Actualmente estamos enviando el nonce original a Supabase, pero el token contiene el hash, causando "Nonces mismatch".

## Solución

### Archivo a Modificar: `src/components/GoogleOneTap.tsx`

**Cambios necesarios:**

1. **Agregar función para hashear nonce con SHA-256**:
```tsx
const hashNonce = async (nonce: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(nonce);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
};
```

2. **Almacenar el hash además del nonce original**:
```tsx
const nonceRef = useRef<string>('');
const nonceHashRef = useRef<string>(''); // Nuevo: para el hash
```

3. **Calcular y guardar el hash al inicializar**:
```tsx
// En initializeOneTap
nonceRef.current = generateNonce();
nonceHashRef.current = await hashNonce(nonceRef.current);
```

4. **Enviar el HASH a Supabase (no el nonce original)**:
```tsx
const { data, error } = await supabase.auth.signInWithIdToken({
  provider: 'google',
  token: response.credential,
  nonce: nonceHashRef.current, // Enviar el hash, no el original
});
```

5. **Hacer `initializeOneTap` async** para poder usar await en el hash

## Flujo Corregido

```text
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │   Google        │      │   Supabase      │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         │ 1. Generar nonce       │                        │
         │    "abc123"            │                        │
         │                        │                        │
         │ 2. Calcular hash       │                        │
         │    SHA-256("abc123")   │                        │
         │    = "def456..."       │                        │
         │                        │                        │
         │ 3. Enviar nonce ───────▶                        │
         │    original "abc123"   │                        │
         │                        │                        │
         │◀── 4. ID Token ────────│                        │
         │    (contiene hash      │                        │
         │     "def456...")       │                        │
         │                        │                        │
         │ 5. Enviar token + hash ─────────────────────────▶
         │    nonce: "def456..."  │                        │
         │                        │                        │
         │◀───────────────────────────── 6. OK ────────────│
         │                        │                        │
```

## Resultado Esperado
El login con Google One Tap funcionará correctamente porque:
- El hash que enviamos a Supabase coincidirá con el hash incluido en el ID token de Google
- Se elimina el error "Nonces mismatch"
