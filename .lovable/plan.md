
# Plan: Corregir Creación Automática de Perfil para Nuevos Usuarios

## El Problema

Cuando un usuario nuevo inicia sesión (especialmente desde el popup de "Seguir"), la aplicación redirige a `/me` donde se usa el hook `useProfileEditor`. Este hook:

1. Usa `.single()` para obtener el perfil (línea 100)
2. **NO tiene lógica para crear el perfil** si no existe

Esto causa el error:
```
GET /rest/v1/profiles?select=*&id=eq.XXX 406 (Not Acceptable)
Error: Cannot coerce the result to a single JSON object (PGRST116)
```

## La Solución

Modificar `useProfileEditor.ts` para que cree automáticamente el perfil si no existe, usando lógica similar a `useProfile.ts`.

---

## Cambios Detallados

### Archivo: `src/hooks/useProfileEditor.ts`

**Cambio en la función `fetchProfile`:**

```text
Antes (líneas 96-102):
├── Consulta con .single()
└── Si hay error → lanza excepción (pantalla rota)

Después:
├── Consulta con .maybeSingle()
├── Si data es null → CREAR perfil nuevo
│   ├── Extraer username del email (si disponible)
│   ├── Verificar disponibilidad con edge function
│   └── Insertar perfil nuevo con .maybeSingle()
│       └── Manejar race condition (error 23505)
└── Aplicar defaults y datos de Google
```

**Código específico a modificar (líneas 88-123):**

```typescript
useEffect(() => {
  async function fetchProfile() {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();  // ← Cambiar de .single() a .maybeSingle()

      // Manejar errores específicos
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let profileData = data;

      // Si no existe el perfil, crearlo automáticamente
      if (!profileData) {
        let usernameToInsert: string | null = null;
        
        // Extraer username del email
        if (user.email) {
          const localPart = user.email.split('@')[0] || '';
          const candidateUsername = localPart
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '')
            .slice(0, 20);
          
          if (candidateUsername.length >= 1) {
            try {
              const { data: availabilityData } = await supabase.functions.invoke(
                'check-username-available',
                { body: { username: candidateUsername } }
              );
              
              if (availabilityData?.success && availabilityData?.available) {
                usernameToInsert = candidateUsername;
              }
            } catch (err) {
              console.log('Could not check username, creating profile without it');
            }
          }
        }
        
        // Insertar nuevo perfil
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: user.id, username: usernameToInsert })
          .select()
          .maybeSingle();

        if (insertError) {
          // Race condition: el perfil ya existe
          if (insertError.code === '23505') {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
            
            if (existingProfile) {
              profileData = existingProfile;
            } else {
              throw insertError;
            }
          } else {
            throw insertError;
          }
        } else {
          profileData = newProfile;
        }
      }

      // Aplicar defaults y datos de Google
      const googleName = user.user_metadata?.full_name;
      const googleAvatar = user.user_metadata?.avatar_url;
      
      setProfile({
        ...DEFAULT_PROFILE,
        ...profileData,
        name: profileData?.name || googleName || null,
        avatar_url: profileData?.avatar_url || googleAvatar || null,
      } as ProfileData);

    } catch (err) {
      console.error('Error fetching/creating profile:', err);
      setError(err instanceof Error ? err : new Error('Error al cargar perfil'));
    } finally {
      setLoading(false);
    }
  }

  fetchProfile();
}, [user]);
```

---

## Flujo Corregido

```text
Usuario nuevo hace login desde popup "Seguir"
         │
         ▼
    App redirige a /me
         │
         ▼
  MeLayout usa useProfileEditor
         │
         ▼
  fetchProfile() con .maybeSingle()
         │
         ├─── data existe? → Cargar y mostrar
         │
         └─── data es null? → CREAR perfil
                    │
                    ├─── Extraer username del email
                    ├─── Verificar disponibilidad
                    └─── Insert con manejo de race condition
                              │
                              ▼
                    Perfil creado → Usuario ve su dashboard
```

---

## Resumen de Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useProfileEditor.ts` | Modificar `fetchProfile` para crear perfil automáticamente si no existe |

---

## Sección Técnica

### Puntos Clave:
- **`.maybeSingle()` vs `.single()`**: El primero retorna `null` si no hay filas, el segundo lanza error
- **Race condition (23505)**: Código de error PostgreSQL para violación de unicidad - puede pasar si dos tabs crean el perfil simultáneamente
- **Edge function `check-username-available`**: Ya existe y usa service role para bypasear RLS

### Manejo de Errores:
- `PGRST116`: No hay filas - esperado para usuarios nuevos, no lanzar error
- `23505`: Perfil ya existe - re-fetch en lugar de error
- Otros errores: Propagar al estado de error
