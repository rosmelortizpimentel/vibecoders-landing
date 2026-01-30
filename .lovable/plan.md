
# Plan: Validacion en linea de username + Paginas publicas de perfil

## Resumen
Implementar dos funcionalidades:
1. Validacion en tiempo real del username con debounce de 2 segundos
2. Paginas publicas accesibles en `/@username` con tarjeta simple

---

## Parte 1: Validacion en linea del username

### Cambios en `ProfileCard.tsx`

Agregar logica de debounce para verificar disponibilidad del username mientras el usuario escribe:

```text
Estado adicional:
- isChecking: boolean (indica si esta verificando)
- isAvailable: boolean | null (resultado de la verificacion)

Flujo:
1. Usuario escribe en el input
2. Se inicia timer de 2 segundos
3. Si escribe de nuevo, se reinicia el timer
4. Cuando pasan 2 segundos sin escribir:
   - Se llama a checkUsernameAvailable()
   - Se muestra resultado (check verde o X roja)
```

### Indicadores visuales

```text
+------------------------------------+
| @ mi_username                    [?] |  <- Verificando (loader)
+------------------------------------+

+------------------------------------+
| @ mi_username                    [✓] |  <- Disponible (check verde)
+------------------------------------+

+------------------------------------+
| @ mi_username                    [✗] |  <- No disponible (X roja)
+------------------------------------+
```

---

## Parte 2: Paginas publicas de perfil

### Migracion de base de datos

Agregar campos `full_name` y `avatar_url` a la tabla `profiles` para poder mostrar datos publicamente sin depender de `auth.users`:

```sql
ALTER TABLE public.profiles 
  ADD COLUMN full_name TEXT,
  ADD COLUMN avatar_url TEXT;

-- Politica RLS para lectura publica de perfiles con username
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (username IS NOT NULL);
```

### Nueva ruta en `App.tsx`

Agregar ruta dinamica para usernames:

```tsx
<Route path="/@:username" element={<PublicProfile />} />
```

### Nuevo componente `PublicProfile.tsx`

Pagina publica que muestra:

```text
+----------------------------------+
|                                  |
|         [Avatar 80x80]           |
|                                  |
|        Nombre Completo           |
|                                  |
|    +------------------------+    |
|    |     Vibecoder          |    |  <- Badge azul
|    +------------------------+    |
|                                  |
+----------------------------------+
```

### Nuevo hook `usePublicProfile.ts`

Hook para obtener perfil publico por username:

```typescript
export function usePublicProfile(username: string) {
  // Buscar perfil por username (sin autenticacion)
  // Retorna: { profile, loading, error, notFound }
}
```

### Sincronizacion de datos

Actualizar `useProfile.ts` para guardar `full_name` y `avatar_url` cuando se actualiza el perfil:

```typescript
// Al crear/actualizar perfil, sincronizar datos de auth.users
const { error: updateError } = await supabase
  .from('profiles')
  .update({ 
    username,
    full_name: user.user_metadata?.full_name,
    avatar_url: user.user_metadata?.avatar_url
  })
  .eq('id', user.id);
```

---

## Archivos a crear/modificar

| Archivo | Accion |
|---------|--------|
| `supabase/migrations/xxx.sql` | Agregar full_name, avatar_url y RLS publica |
| `src/components/ProfileCard.tsx` | Agregar debounce y feedback visual |
| `src/pages/PublicProfile.tsx` | Nueva pagina publica |
| `src/hooks/usePublicProfile.ts` | Nuevo hook para perfiles publicos |
| `src/hooks/useProfile.ts` | Sincronizar full_name y avatar_url |
| `src/App.tsx` | Agregar ruta /@:username |

---

## Flujo de validacion de username

```text
Usuario escribe "carlos"
        |
        v
  [Timer 2 seg]  <-- Si escribe mas, reinicia
        |
        v
  Consulta a DB: SELECT id FROM profiles WHERE username = 'carlos'
        |
        +---> Existe otro usuario --> Mostrar "No disponible" (rojo)
        |
        +---> No existe --> Mostrar "Disponible" (verde)
```

---

## Diseno del badge "Vibecoder"

```text
+--------------------+
|  ✦  Vibecoder     |   <- Fondo azul #3D5AFE, texto blanco
+--------------------+       Icono de estrella/diamante
```

---

## Consideraciones tecnicas

- El debounce usa `setTimeout` con cleanup en `useEffect`
- La verificacion excluye el username actual del usuario si ya tiene uno
- Los perfiles publicos solo son visibles si tienen username configurado
- Se usa el componente `Badge` existente con estilo personalizado
