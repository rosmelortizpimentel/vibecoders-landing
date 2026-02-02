
# Plan: Solución Robusta de Seguridad para Admin

## Resumen Ejecutivo

El backend ya está correctamente asegurado con RLS. El problema actual es una **condición de carrera** en el frontend que causa redirecciones prematuras. Este plan corrige el frontend y añade capas adicionales de seguridad.

---

## Estado Actual de Seguridad

| Componente | Estado | Notas |
|------------|--------|-------|
| RLS `showcase_gallery` | Seguro | Solo admins pueden INSERT/UPDATE/DELETE |
| RLS `user_roles` | Seguro | Solo SELECT del propio rol, sin modificaciones |
| Storage `showcase-assets` | Seguro | Solo admins pueden subir/modificar/eliminar |
| Función `has_role()` | Seguro | Security definer, evita recursión |
| Frontend `useUserRole` | Bug | No espera a que auth termine de cargar |
| Frontend `Admin.tsx` | Bug | Redirige antes de verificar rol real |

---

## Solución Propuesta

### 1. Corregir `useUserRole.ts`

Incluir el estado de carga de autenticación y usar flags adicionales de React Query:

```typescript
export function useUserRole() {
  const { user, loading: authLoading } = useAuth();

  const { 
    data: isAdmin = false, 
    isLoading, 
    isFetching 
  } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('[useUserRole] Error:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: 1, // Limitar reintentos para no bloquear UI
  });

  // Loading es true si:
  // - Auth está cargando
  // - La query de roles está en proceso inicial
  // - Está refetching sin datos confirmados
  const loading = authLoading || isLoading || (isFetching && !isAdmin);

  return { isAdmin, loading };
}
```

### 2. Robustecer `Admin.tsx`

Añadir protección contra redirecciones prematuras con un flag de verificación:

```typescript
const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { profile } = useProfile();
  const [accessChecked, setAccessChecked] = useState(false);

  // Combinar todos los estados de carga
  const loading = authLoading || roleLoading;

  useEffect(() => {
    // No hacer nada hasta que la carga termine
    if (loading) return;
    
    // Solo verificar acceso una vez
    if (accessChecked) return;
    
    setAccessChecked(true);
    
    if (!user) {
      navigate('/', { replace: true });
    } else if (!isAdmin) {
      navigate('/me/profile', { replace: true });
    }
  }, [user, isAdmin, loading, accessChecked, navigate]);

  // Mostrar loader mientras carga O mientras no hemos verificado acceso
  if (loading || !accessChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#3D5AFE]" />
      </div>
    );
  }

  // Doble verificación: si pasó el loader pero no tiene acceso
  if (!user || !isAdmin) {
    return null;
  }

  // ... resto del componente
};
```

### 3. Añadir Logging de Seguridad (Opcional)

Para auditoría, añadir logs cuando se detecten intentos de acceso:

```typescript
// En Admin.tsx useEffect
if (!isAdmin && user) {
  console.warn('[Security] Non-admin user attempted to access /admin:', user.id);
}
```

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/hooks/useUserRole.ts` | Incluir `authLoading` y `isFetching` en el cálculo de loading |
| `src/pages/Admin.tsx` | Añadir flag `accessChecked` y mejorar lógica de redirección |

---

## Por Qué Esta Solución es Segura

1. **Defensa en profundidad**: Aunque el frontend falle, RLS siempre protege el backend
2. **No depende del cliente**: Los roles se verifican server-side con `has_role()`
3. **No usa localStorage**: No hay tokens ni roles almacenados localmente que puedan manipularse
4. **Sin hardcoding**: No hay credenciales o IDs de admin en el código
5. **Race condition eliminada**: El nuevo flag asegura que no se redirija hasta tener datos reales

---

## Sección Técnica

### Flujo de Verificación Mejorado

```text
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario navega a /admin                                      │
├─────────────────────────────────────────────────────────────────┤
│ 2. Admin.tsx se monta                                           │
│    - loading = true (authLoading || roleLoading)                │
│    - accessChecked = false                                      │
│    - Muestra Loader                                             │
├─────────────────────────────────────────────────────────────────┤
│ 3. useAuth completa → authLoading = false                       │
│    - roleLoading aún true                                       │
│    - Sigue mostrando Loader                                     │
├─────────────────────────────────────────────────────────────────┤
│ 4. useUserRole completa → roleLoading = false                   │
│    - loading = false                                            │
│    - useEffect ejecuta verificación                             │
│    - accessChecked = true                                       │
├─────────────────────────────────────────────────────────────────┤
│ 5a. Si isAdmin = true → Renderiza AdminLayout                   │
│ 5b. Si isAdmin = false → Redirige a /me/profile                 │
│ 5c. Si !user → Redirige a /                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Comportamiento de React Query

El hook `useQuery` tiene varios estados que debemos considerar:

- `isLoading`: true solo en la primera carga (no hay datos en cache)
- `isFetching`: true cuando hay una request en curso (incluyendo refetch)
- `data`: el valor cacheado (puede ser stale)

Al incluir `(isFetching && !isAdmin)` en el cálculo de loading, nos aseguramos de:
1. No reportar loading=false con datos stale negativos
2. Permitir que pase si ya tenemos confirmación positiva de admin

### Resumen de Cambios

**useUserRole.ts:**
- Línea 6: Desestructurar `loading as authLoading` de `useAuth()`
- Línea 8: Añadir `isFetching` a la desestructuración de `useQuery`
- Línea final: Cambiar cálculo de loading a `authLoading || isLoading || (isFetching && !isAdmin)`

**Admin.tsx:**
- Añadir estado `const [accessChecked, setAccessChecked] = useState(false)`
- Modificar useEffect para usar el flag
- Ajustar condición del loader para incluir `!accessChecked`
