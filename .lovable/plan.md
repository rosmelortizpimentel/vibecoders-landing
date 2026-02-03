

# Plan: Migrar Google One Tap a FedCM

## Resumen

Actualizar el componente `GoogleOneTap.tsx` para ser compatible con FedCM (Federated Credential Management API), que será obligatorio próximamente. Esto elimina el warning actual y asegura compatibilidad futura.

---

## ¿Qué es FedCM?

FedCM es una nueva API del navegador que mejora la privacidad al manejar la autenticación federada de forma nativa, sin depender de cookies de terceros.

---

## Cambios Necesarios

### 1. Habilitar FedCM en la configuración

Añadir `use_fedcm_for_prompt: true` a las opciones de `initialize()`:

```typescript
window.google.accounts.id.initialize({
  client_id: GOOGLE_CLIENT_ID,
  callback: handleCredentialResponse,
  auto_select: false,
  cancel_on_tap_outside: false,
  context: 'signin',
  itp_support: true,
  use_fedcm_for_prompt: true,  // ← NUEVO: Habilitar FedCM
});
```

### 2. Simplificar el callback del prompt

Los métodos `isNotDisplayed()`, `isDismissedMoment()`, `isSkippedMoment()` no funcionarán con FedCM. Simplificamos la lógica:

**Antes (código actual):**
```typescript
window.google.accounts.id.prompt((notification) => {
  if (notification.isNotDisplayed()) {
    // ... lógica compleja
  }
  if (notification.isDismissedMoment()) {
    // ... lógica compleja
  }
  if (notification.isSkippedMoment()) {
    // ... lógica compleja
  }
});
```

**Después (compatible con FedCM):**
```typescript
window.google.accounts.id.prompt((notification) => {
  // Con FedCM, solo podemos verificar si hubo un dismiss
  // La lógica de "moments" ya no está disponible
  if (notification.getDismissedReason?.() === 'credential_returned') {
    // Éxito - el credential fue enviado al callback principal
    return;
  }
  
  // Para cualquier otro caso, marcamos como dismissed
  // para no molestar al usuario en esta sesión
  const dismissReason = notification.getDismissedReason?.();
  if (dismissReason && dismissReason !== 'credential_returned') {
    sessionStorage.setItem('oneTapDismissed', 'true');
  }
});
```

### 3. Actualizar tipos TypeScript

Añadir el nuevo campo al tipo de configuración en `src/types/google.d.ts`:

```typescript
export interface GoogleOneTapConfig {
  // ... campos existentes
  use_fedcm_for_prompt?: boolean;  // ← NUEVO
}
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/GoogleOneTap.tsx` | Añadir `use_fedcm_for_prompt: true`, simplificar callback |
| `src/types/google.d.ts` | Añadir tipo `use_fedcm_for_prompt` |

---

## Comportamiento Esperado

| Escenario | Con FedCM |
|-----------|-----------|
| Usuario hace clic en cuenta | `callback` recibe el credential ✓ |
| Usuario cierra el popup | `getDismissedReason()` retorna el motivo |
| Navegador bloquea popup | Simplemente no se muestra, sin callback detallado |

---

## Notas Importantes

1. **FedCM requiere HTTPS** - Ya estamos en HTTPS, así que no hay problema
2. **Compatibilidad** - FedCM tiene fallback automático en navegadores antiguos
3. **El warning desaparecerá** - Al usar `use_fedcm_for_prompt: true` y eliminar los métodos deprecados

