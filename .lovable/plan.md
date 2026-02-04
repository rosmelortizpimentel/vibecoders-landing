
## Objetivo
Resolver el error 500 de LinkedIn haciendo que la función de Vercel pueda acceder a los datos de perfiles usando la **anon key pública** (que ya tenemos).

---

## Diagnóstico actualizado

### Problema actual
La función de Vercel (`api/og/[username].ts`) necesita `SUPABASE_SERVICE_ROLE_KEY` porque la tabla `profiles` tiene RLS que **solo permite que cada usuario vea su propio perfil**:

```sql
-- Política actual en profiles
SELECT: "Users can view own profile" → qual: (auth.uid() = id)
```

Esto significa que con la anon key, nadie puede leer perfiles de otros usuarios.

### Solución
Agregar una política RLS que permita **lectura pública** de la tabla profiles. Esto es seguro porque:
1. Solo exponemos campos que ya son públicos (nombre, username, avatar, tagline, bio, etc.)
2. La Edge Function `get-public-profile` ya hace exactamente esto (usa service_role para leer)
3. Los perfiles públicos están diseñados para ser... públicos

---

## Cambios necesarios

### Paso 1: Agregar política RLS para lectura pública de profiles
Nueva política en la tabla `profiles`:
```sql
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
TO anon, authenticated
USING (true);
```

### Paso 2: Actualizar la función de Vercel para usar anon key
Cambiar `api/og/[username].ts` para usar la anon key pública (que ya está hardcodeada en el proyecto) en lugar de la service role key:

```typescript
// Cambiar de:
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// A:
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // La que ya tenemos
```

---

## ¿Por qué es seguro?

| Campo | ¿Ya es público? | Notas |
|-------|-----------------|-------|
| username | ✅ | Visible en URL |
| name | ✅ | Visible en perfil público |
| tagline | ✅ | Visible en perfil público |
| bio | ✅ | Visible en perfil público |
| avatar_url | ✅ | Visible en perfil público |
| banner_url | ✅ | Visible en perfil público |
| og_image_url | ✅ | Para metadatos OG |
| redes sociales | ✅ | Usuario las hace públicas |

La Edge Function `get-public-profile` ya expone todos estos campos. Solo estamos permitiendo el mismo acceso vía RLS.

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| Migración SQL | Agregar política RLS de lectura pública |
| `api/og/[username].ts` | Usar anon key en lugar de service role key |

---

## Beneficios de esta solución

1. **No requiere configurar secretos en Vercel** - usa la anon key pública
2. **Consistente con el diseño actual** - los perfiles ya son públicos
3. **Funciona inmediatamente** - sin dependencias externas
4. **LinkedIn recibirá 200 OK** - Vercel genera el HTML directamente sin proxy
