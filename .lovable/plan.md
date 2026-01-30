
# Plan: Actualizar URL y Redireccion de Login

## Resumen
Tres cambios principales:
1. Actualizar la URL en la barra del navegador a `https://vibecoders.la/@username`
2. Agregar la URL en la vista frontal del perfil
3. Redirigir usuarios autenticados automaticamente a /profile

---

## Cambio 1: Actualizar URL del navegador mock

### Archivo: `src/components/ProfileCard.tsx`

**Linea 137** - Cambiar la URL en la cara trasera (formulario):
```tsx
// Antes
vibecoding.la/<span className="text-white font-bold">@{username || 'tu_username'}</span>

// Despues
https://vibecoders.la/<span className="text-white font-bold">@{username || 'tu_username'}</span>
```

**Linea 94** - Cambiar la URL en la cara frontal:
```tsx
// Antes
vibecoding.la/@{profile.username}

// Despues  
vibecoders.la/@{profile.username}
```

---

## Cambio 2: Agregar URL en vista frontal del perfil

### Archivo: `src/components/ProfileCard.tsx`

Agregar la URL debajo del email en la cara frontal, visible siempre que haya username configurado:

```tsx
{profile?.username && (
  <p className="mt-2 text-xs sm:text-sm text-white/70">
    vibecoders.la/@{profile.username}
  </p>
)}
```

Este codigo ya existe en la linea 92-96, solo necesita actualizarse el dominio.

---

## Cambio 3: Redirigir usuarios autenticados a /profile

### Archivo: `src/pages/Index.tsx`

Modificar para verificar autenticacion y redirigir:

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
// ... otros imports

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/profile');
    }
  }, [user, loading, navigate]);

  // Si esta cargando o hay usuario, mostrar loading
  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-pulse text-[#3D5AFE] text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    // ... landing normal
  );
};
```

---

## Cambio 4: Actualizar BrowserUrlMock del landing

### Archivo: `src/components/bento/BrowserUrlMock.tsx`

Agregar `https://` al URL mock del landing para consistencia:

```tsx
// Linea 18-19, cambiar:
vibecoders.la/<span className="text-stone-900">@username</span>

// A:
https://vibecoders.la/<span className="text-stone-900">@username</span>
```

---

## Resumen de archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/ProfileCard.tsx` | Actualizar URLs a vibecoders.la con https:// |
| `src/pages/Index.tsx` | Agregar redireccion automatica si usuario autenticado |
| `src/components/bento/BrowserUrlMock.tsx` | Agregar https:// para consistencia |

---

## Flujo de usuario despues del cambio

```text
Usuario NO autenticado:
  / (landing) --> Muestra landing normal

Usuario autenticado:
  / (landing) --> Redirige automaticamente a /profile
  /profile --> Muestra tarjeta de perfil

Login con Google:
  Clic en login --> OAuth Google --> Redirige a /profile
```
