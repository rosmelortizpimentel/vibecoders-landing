
Objetivo: eliminar el error **`AuthApiError: Nonces mismatch`** en el flujo de **Google One Tap + Supabase `signInWithIdToken`**, sin depender de los cambios de FedCM/Chrome (que están en transición y están rompiendo el manejo de `nonce`).

Contexto (lo que ya sabemos con certeza)
- El login con botón (OAuth redirect) funciona, así que **Google provider en Supabase está bien configurado**.
- El flujo que falla es el **grant_type=id_token** (One Tap), y Supabase rechaza el intercambio por **nonce mismatch**.
- Con FedCM/One Tap, el `nonce` está entrando en un “periodo de cambio” (warning de Chrome 145), y en la práctica hay combinaciones donde Google/FedCM y Supabase no coinciden en cómo se “representa” ese nonce (raw/hash/encoding), produciendo este error.

Decisión técnica (la más confiable hoy)
- Para que One Tap sea estable, vamos a **NO usar nonce** en One Tap:
  - No enviar `nonce` a `google.accounts.id.initialize`.
  - No enviar `nonce` a `supabase.auth.signInWithIdToken`.
- Esto evita por completo el chequeo de nonce en Supabase (y por tanto elimina el “mismatch”) y también elimina el warning de Chrome 145 relacionado con nonce.
- Es el único enfoque “definitivo” del lado del cliente mientras FedCM/Google/Supabase no estén totalmente alineados con nonce.

Cambios a implementar (código)
1) `src/components/GoogleOneTap.tsx`
   - Eliminar todo lo relacionado a `nonce`:
     - Borrar `generateNonce()` si ya no se usa.
     - Quitar `nonceRef`.
     - En `initialize`: quitar `params: { nonce: ... }` (y también cualquier `nonce` top-level si existe).
     - En `signInWithIdToken`: llamar sin `nonce`.
   - Mantener `use_fedcm_for_prompt: true` (si queremos FedCM) pero sin nonce, o incluso dejarlo en `true` ya que no debería afectar el intercambio con Supabase al no haber nonce.
   - Mantener el control `initializedRef` para no inicializar varias veces.

   Resultado esperado del código:
   - La request a `POST /auth/v1/token?grant_type=id_token` ya no incluirá `nonce`.
   - El token de Google no traerá nonce.
   - Supabase no intentará validar nonce.
   - Se elimina el 400 por “Nonces mismatch”.

2) (Opcional recomendado) Mejorar diagnóstico en consola (sin filtrar tokens)
   - Cuando falle, mostrar solo `error.message` y `error.status` (sin imprimir credenciales) para poder distinguir “provider not configured” vs “bad audience” vs etc.

Pasos de verificación (end-to-end)
1) Probar en ventana incógnito:
   - Abrir `/`
   - Esperar One Tap, click “Continuar”
   - Debe redirigir a `/me` sin 400 en consola.
2) Verificar que el warning de nonce de Chrome 145 desaparece:
   - Ya no estamos pasando nonce a Google.
3) Si aún aparece 400 en Supabase:
   - Revisar el mensaje exacto del error (ya no debería ser “Nonces mismatch”; si cambia a “invalid aud” o similar, eso apunta a configuración de Google OAuth “Client ID / origins / authorized domains”).

Riesgos / trade-offs (transparente)
- Quitar nonce reduce una protección anti-replay específica del flujo OIDC, pero:
  - El ID token sigue firmado y validado por Supabase.
  - En la práctica, para One Tap en web, esto es un workaround común mientras FedCM/nonce se estabiliza.
- Si en el futuro Supabase/Google/FedCM estandarizan el nonce definitivamente, podemos reintroducirlo con un enfoque compatible (y sin warnings).

Siguientes mejoras sugeridas (para cuando esto funcione)
1) Testear el flujo end-to-end en Chrome y Safari (y móvil) para confirmar comportamiento consistente.
2) Agregar un fallback: si One Tap falla, mostrar botón “Continuar con Google” (OAuth redirect) y/o un CTA visible.
3) Añadir manejo de estados de `prompt()` (dismissed/skipped) para no re-spamear el One Tap.
4) Añadir un pequeño panel de debug (solo en dev) para ver razones de prompt y errores de auth sin exponer tokens.
5) Centralizar auth en un `AuthProvider` para evitar instancias múltiples de `useAuth()` y asegurar redirecciones consistentes.
