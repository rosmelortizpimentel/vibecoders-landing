
## Objetivo
Corregir el desfase y el “congelamiento” en **vista desktop**, donde el ProfileFileCard se transforma antes de que caiga el último logo y luego el ciclo se queda trabado.

---

## Diagnóstico (confirmado)
En **desktop** se están montando (aunque estén ocultos por CSS) **dos** componentes que ejecutan lógica y timers:

1) **FloatingLogos mobile** dentro del bloque `md:hidden` (está oculto visualmente en desktop, pero igual corre JS y actualiza `absorbedCount`).
2) **ProfileFileCard mobile** también se monta en desktop (oculto por CSS), y ejecuta la secuencia completa.

Esto se confirma con los logs duplicados:
- `ProfileFileCard: Starting transformation sequence...` aparece 2 veces
- Todas las fases (Verified / Counting / Exploding / Resetting) salen duplicadas

Ese doble montaje provoca:
- `absorbedCount` se incrementa “antes de tiempo” (por la instancia oculta).
- El card se transforma mientras visualmente aún falta el último logo.
- Explosión/reset se disparan dos veces, y el estado queda desincronizado, generando el “no avanza”.

---

## Cambios propuestos (mínimos y directos)

### 1) Montar SOLO el layout correcto (desktop o mobile) usando `isMobile`
En `src/components/HeroSection.tsx`:
- Donde hoy usamos clases tipo `hidden md:block` / `md:hidden`, vamos a **reemplazar o envolver** con render condicional:
  - Desktop: renderizar únicamente si `!isMobile`
  - Mobile: renderizar únicamente si `isMobile`

Esto asegura que en desktop:
- No exista el `<FloatingLogos isMobileContainer />` oculto.
- No exista el `<ProfileFileCard />` mobile oculto.
- Por lo tanto, desaparece el doble update de `absorbedCount` y la secuencia deja de duplicarse.

#### Qué bloques se ajustan:
- FloatingLogos desktop: se queda con `!isMobile` (ya está bien).
- Headline/subheadline desktop: pasar a `!isMobile` (hoy están con `hidden md:block`).
- ProfileFileCard desktop: pasar a `!isMobile` (hoy `hidden md:flex`).
- Headline/subheadline mobile: pasar a `isMobile` (hoy `md:hidden`).
- Bloque completo de animación mobile (logos + file): pasar a `isMobile` (hoy `md:hidden`).

### 2) (Recomendado) Reset “limpio” al cambiar entre mobile/desktop
Agregar un `useEffect` en `HeroSection.tsx` que, cuando `isMobile` cambie, haga:
- `setAbsorbedCount(0)`
- `setTriggerExplosion(false)`

Esto evita estados “arrastrados” si el usuario cambia el ancho de la ventana durante una animación.

### 3) (Opcional, hardening) Proteger FloatingLogos al explotar
En `src/components/FloatingLogos.tsx`, dentro de `triggerExplosionAnimation`, llamar primero a `clearAllTimeouts()` para evitar timers viejos si alguna vez la explosión se dispara antes de que terminen los “fall/absorb”.

No debería ser necesario una vez arreglado el montaje duplicado, pero lo hace más robusto.

---

## Resultado esperado (desktop)
1) Los logos caen uno por uno.
2) El **último logo cae completo** y recién ahí el file se transforma.
3) Los contadores suben.
4) Explosión alrededor del perfil.
5) Reset limpio y el ciclo vuelve a iniciar sin quedarse congelado.
6) En consola, cada fase del `ProfileFileCard` debe aparecer **solo una vez** (sin duplicados).

---

## Plan de verificación (rápido)
1) Abrir en desktop (>768px).
2) Mirar consola: ya no deben salir logs duplicados de `ProfileFileCard`.
3) Confirmar visualmente que el card no cambia antes del último logo.
4) Esperar 1-2 ciclos completos para confirmar que no se queda pegado.
5) Repetir en mobile para asegurar que no se reintroduce el problema.

---

## Archivos a tocar
- `src/components/HeroSection.tsx` (principal)
- `src/components/FloatingLogos.tsx` (opcional hardening)

