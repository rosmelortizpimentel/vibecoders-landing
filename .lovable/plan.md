

## Diagnóstico

El problema identificado es que las políticas RLS de `general_settings` no especifican explícitamente el rol `anon`:

```sql
-- Política actual (sin rol explícito)
CREATE POLICY "Anyone can view settings" ON public.general_settings 
FOR SELECT USING (true);

-- vs la de profiles que sí lo tiene
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles 
FOR SELECT TO anon, authenticated USING (true);
```

Cuando Vercel hace la llamada con la anon key, Supabase puede no aplicar correctamente la política si no está explícitamente asignada al rol `anon`.

---

## Solución

### Paso 1: Actualizar política de `general_settings`

Recrear la política incluyendo explícitamente los roles:

```sql
DROP POLICY IF EXISTS "Anyone can view settings" ON public.general_settings;

CREATE POLICY "Anyone can view settings"
  ON public.general_settings 
  FOR SELECT 
  TO anon, authenticated
  USING (true);
```

### Paso 2: Agregar logs de debugging a la función de Vercel

Agregar más información en los logs para diagnosticar si los datos llegan correctamente:

```typescript
// Después de fetch settings
console.log(`[og-profile-meta] Settings response status: ${settingsResponse.status}`);
console.log(`[og-profile-meta] Settings data:`, JSON.stringify(settingsData));

// Después de fetch profile
console.log(`[og-profile-meta] Profile response status: ${profileResponse.status}`);
console.log(`[og-profile-meta] Profile data:`, JSON.stringify(profiles));
```

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| Migración SQL | Recrear política de `general_settings` con roles explícitos |
| `api/og/[username].ts` | Agregar logs de debugging para ver exactamente qué retorna Supabase |

---

## Resultado esperado

Después de estos cambios:
1. La función de Vercel podrá leer `general_settings` correctamente con la anon key
2. Los logs mostrarán exactamente qué datos está recibiendo la función
3. LinkedIn, WhatsApp y X mostrarán los metadatos del perfil específico (nombre, tagline, avatar)

