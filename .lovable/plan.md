
# Plan: Validar emails con alias (+) en Waitlist

## Problema

Actualmente un usuario puede registrarse múltiples veces usando aliases de email:
- `cesaras@gmail.com` ✓
- `cesaras+1@gmail.com` ✓ (no debería permitirse)
- `cesaras+2@gmail.com` ✓ (no debería permitirse)

Gmail (y otros proveedores) ignoran todo lo que está después del `+`, así que todos llegan al mismo buzón.

## Solución

Normalizar emails removiendo el alias `+algo` antes de verificar/guardar, y hacer una verificación previa contra la base de datos para detectar duplicados con alias.

```text
┌───────────────────────────────────────┐
│ Usuario ingresa: cesaras+1@gmail.com  │
└─────────────────┬─────────────────────┘
                  ▼
┌───────────────────────────────────────┐
│ Normalizar: cesaras@gmail.com         │
│ (remover +algo del local part)        │
└─────────────────┬─────────────────────┘
                  ▼
┌───────────────────────────────────────┐
│ ¿Existe email normalizado en BD?      │
└──────────┬─────────────────┬──────────┘
           │ SÍ              │ NO
           ▼                 ▼
┌─────────────────────┐  ┌────────────────────┐
│ Mostrar modal:      │  │ Registrar email    │
│ "¡Ya estás en       │  │ normalizado en BD  │
│ la lista!"          │  └────────────────────┘
└─────────────────────┘
```

## Implementación

### 1. Agregar función de normalización en `src/lib/waitlist.ts`

```typescript
/**
 * Normaliza un email removiendo aliases (+algo)
 * cesaras+test@gmail.com → cesaras@gmail.com
 */
function normalizeEmail(email: string): string {
  const [localPart, domain] = email.toLowerCase().trim().split('@');
  if (!domain) return email.toLowerCase().trim();
  
  // Remover todo después del + en la parte local
  const normalizedLocal = localPart.split('+')[0];
  return `${normalizedLocal}@${domain}`;
}
```

### 2. Modificar `registerToWaitlist()` en `src/lib/waitlist.ts`

Antes de insertar:
1. Normalizar el email ingresado
2. Verificar si ya existe el email normalizado en la BD
3. Si existe → retornar `alreadyExists: true`
4. Si no existe → insertar con el email normalizado

```typescript
export async function registerToWaitlist(email: string): Promise<WaitlistResult> {
  const deviceInfo = collectDeviceInfo();
  const normalizedEmail = normalizeEmail(email);

  // Verificar si ya existe (por email normalizado)
  const exists = await checkEmailExists(normalizedEmail);
  if (exists) {
    return { success: true, alreadyExists: true };
  }

  // Insertar con email normalizado
  const { error } = await supabase
    .from('waitlist')
    .insert({
      email: normalizedEmail,
      ...deviceInfo,
    });

  if (error) {
    if (error.code === '23505') {
      return { success: true, alreadyExists: true };
    }
    return { success: false, alreadyExists: false, error: error.message };
  }

  return { success: true, alreadyExists: false };
}
```

### 3. Actualizar `checkEmailExists()` en `src/lib/waitlist.ts`

También usar email normalizado para la verificación:

```typescript
export async function checkEmailExists(email: string): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);
  
  const { data, error } = await supabase
    .from('waitlist')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error('Error checking email:', error);
    return false;
  }

  return !!data;
}
```

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/lib/waitlist.ts` | Agregar `normalizeEmail()` y usarla en `registerToWaitlist()` y `checkEmailExists()` |

## Comportamiento Final

| Email ingresado | Email guardado/buscado | Resultado |
|-----------------|------------------------|-----------|
| `cesaras@gmail.com` | `cesaras@gmail.com` | ✓ Registrado |
| `cesaras+1@gmail.com` | `cesaras@gmail.com` | Ya existe |
| `cesaras+test@gmail.com` | `cesaras@gmail.com` | Ya existe |
| `otro@gmail.com` | `otro@gmail.com` | ✓ Registrado |

El modal de "¡Ya estás en la lista!" aparecerá automáticamente porque `alreadyExists: true` activa ese flujo existente.

## Nota sobre datos existentes

Si ya hay emails con `+` en la base de datos, esos registros quedarán como están. Solo los nuevos registros serán normalizados. Si deseas limpiar los existentes, se puede hacer una migración SQL separada.
