

## Asignar plan Free automaticamente a usuarios despues del #100

### Problema actual
Cuando los 100 cupos de Founder se agotan, la funcion `assign_founder_tier` asigna el tier `'pending'` y el frontend redirige al usuario a `/choose-plan` para que elija manualmente entre Free o Pro. Esto agrega friccion innecesaria.

### Solucion
Cambiar el flujo para que los usuarios #101 en adelante reciban automaticamente el tier `'free'` y entren directo a la plataforma sin pasos intermedios.

### Cambios

**1. Funcion SQL `assign_founder_tier`**
- Cambiar `v_tier := 'pending'` a `v_tier := 'free'` en el bloque ELSE (cuando ya hay 100 founders)
- Esto hace que cualquier nuevo usuario despues del #100 sea Free automaticamente

**2. `src/hooks/useAuth.ts`**
- Eliminar la condicion `if (data?.needsPlanSelection)` que redirige a `/choose-plan`
- Siempre redirigir a `/me/profile` despues del login (si el usuario esta en `/`)
- Ya no se necesita la logica de `needsPlanSelection` en el frontend

**3. Edge Function `check-founder-status`**
- Actualizar para que `needsPlanSelection` siempre sea `false` (o simplemente no enviarlo)
- La funcion SQL ya se encarga de asignar el tier correcto

### Resultado
```text
Usuario nuevo se registra (despues del #100)
  -> assign_founder_tier asigna tier = 'free' automaticamente
  -> check-founder-status retorna needsPlanSelection = false
  -> Usuario es redirigido a /me/profile
  -> Empieza a usar la plataforma inmediatamente
```

### Nota
La pagina `/choose-plan` seguira existiendo pero ya no sera parte del flujo obligatorio. Podra usarse en el futuro cuando definas las features de paga y quieras mostrar un upgrade.

### Detalle tecnico

| Archivo | Cambio |
|---|---|
| Migracion SQL (assign_founder_tier) | `'pending'` -> `'free'` en el ELSE |
| `src/hooks/useAuth.ts` | Eliminar redireccion a `/choose-plan` |
| `supabase/functions/check-founder-status/index.ts` | `needsPlanSelection` siempre false |

