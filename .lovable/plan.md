
# Plan: Mostrar contenido diferente para usuarios logueados en la landing

## Problema
Actualmente el `HeroSection` siempre muestra el formulario de email para unirse a la waitlist, incluso cuando el usuario ya está autenticado. Esto no tiene sentido porque ya completó el flujo de registro.

## Solución
Modificar `HeroSection.tsx` para:
1. Usar el hook `useAuth` para detectar si hay un usuario logueado
2. Mostrar contenido diferente según el estado de autenticación:
   - **No logueado**: Formulario de email + social proof (como está ahora)
   - **Logueado**: Mensaje de bienvenida + botón para ir al perfil

---

## Cambios a realizar

### Archivo: `src/components/HeroSection.tsx`

**1. Importar useAuth:**
```typescript
import { useAuth } from '@/hooks/useAuth';
```

**2. Usar el hook en el componente:**
```typescript
const { user, loading } = useAuth();
```

**3. Renderizado condicional en lugar del formulario:**

Si el usuario está logueado, mostrar:
```tsx
<div className="mx-auto mb-8 flex max-w-md animate-fade-in flex-col items-center gap-4 opacity-0">
  <p className="text-lg text-white/90">
    ¡Hola, {user.user_metadata?.full_name?.split(' ')[0] || 'Vibecoder'}!
  </p>
  <Button
    onClick={() => navigate('/profile')}
    className="h-12 gap-2 px-6 font-semibold bg-[#1c1c1c] text-white hover:bg-[#1c1c1c]/80"
  >
    Ver mi perfil
    <ArrowRight className="h-4 w-4" />
  </Button>
</div>
```

Si NO está logueado, mostrar el formulario actual + social proof.

**4. Importar useNavigate:**
```typescript
import { useNavigate } from 'react-router-dom';
```

---

## Estructura condicional

```text
┌─────────────────────────────────────┐
│  Si usuario NO está logueado:       │
│  ┌─────────────────────────────────┐│
│  │ [Email input] [Unirme a Waitlist]│
│  └─────────────────────────────────┘│
│  👥 Únete a los primeros fundadores │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Si usuario ESTÁ logueado:          │
│                                     │
│  ¡Hola, {nombre}!                   │
│  ┌─────────────────────────────────┐│
│  │      Ver mi perfil  →           ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## Resultado esperado

- **Usuario no autenticado**: Ve el formulario de email y el texto de social proof
- **Usuario autenticado**: Ve un saludo personalizado y un botón para ir a su perfil
- El UserMenu sigue funcionando igual (aparece arriba a la derecha cuando está logueado)
- Experiencia fluida sin elementos redundantes
