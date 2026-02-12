

## Asignar Founders existentes y corregir errores de build

### Problema
Solo Luciana esta registrada como Founder #1 en `user_subscriptions`, pero hay 75 usuarios previos en `profiles` que se registraron antes que ella y deberian ser founders. Luciana deberia ser Founder #76, no #1.

Ademas, hay multiples errores de build pre-existentes que deben corregirse.

### Paso 1: Datos - Insertar founders en user_subscriptions

Ejecutar un INSERT masivo usando la herramienta de datos (no migracion) que:

1. **Eliminar** el registro actual de Luciana (Founder #1 incorrecto)
2. **Insertar** los 75 usuarios de `profiles` como founders, ordenados por `created_at`, con `founder_number` del 1 al 75
3. **Re-insertar** a Luciana como Founder #76

```sql
DELETE FROM user_subscriptions WHERE user_id = 'f1959bb1-f3a2-4c35-b055-c587a178889b';

INSERT INTO user_subscriptions (user_id, tier, founder_number, price)
SELECT id, 'founder', ROW_NUMBER() OVER (ORDER BY created_at ASC), 0
FROM profiles
WHERE id != 'f1959bb1-f3a2-4c35-b055-c587a178889b'
ON CONFLICT (user_id) DO UPDATE SET
  tier = 'founder',
  founder_number = EXCLUDED.founder_number;

INSERT INTO user_subscriptions (user_id, tier, founder_number, price)
VALUES ('f1959bb1-f3a2-4c35-b055-c587a178889b', 'founder', 76, 0)
ON CONFLICT (user_id) DO UPDATE SET
  tier = 'founder',
  founder_number = 76;
```

### Paso 2: Corregir errores de build

Se corregiran los siguientes archivos con errores de TypeScript:

| Archivo | Error | Solucion |
|---------|-------|----------|
| `UsersManager.tsx` | `toast` no encontrado | Agregar import de `toast` desde sonner |
| `FoundersMarquee.tsx` | `@ts-expect-error` innecesario | Eliminar la directiva (ya existe en tipos) |
| `AppsTab.tsx` | `AppsTabProps` no encontrado | Definir la interfaz o importarla |
| `ProfileTab.tsx` | Atributo duplicado en JSX | Eliminar el atributo repetido |
| `UsernameEditor.tsx` | Atributo duplicado en JSX | Eliminar el atributo repetido |
| `PromptFormModal.tsx` | `TOOL_OPTIONS` no exportado, tipos faltantes | Corregir import y agregar campos faltantes |
| `useDashboardStats.ts` | `tagline` no existe en tipo | Agregar `tagline` al select query |
| `useNotifications.ts` | Tipo incompatible | Agregar cast apropiado |
| `usePrompts.ts` | Spread de tipo no-objeto | Corregir el spread |
| `Vibers.tsx` | `tagline` no existe en `ProfileSummary` | Agregar `tagline` a la interfaz |

### Orden de ejecucion

1. Ejecutar las queries SQL para asignar founders (3 queries)
2. Corregir los 10+ archivos con errores de build en paralelo
