
# Plan: Tarjeta de perfil con efecto flip y cambio de username

## Resumen
Implementar una tarjeta de perfil con animacion de volteo 3D (flip) que permita al usuario ver y cambiar su username. El reverso de la tarjeta mostrara un formulario similar a la imagen de referencia, usando el azul corporativo (#3D5AFE) en lugar del rosa.

---

## Cambios necesarios

### 1. Base de datos: Crear tabla `profiles`

Crear una nueva tabla para almacenar los usernames de los usuarios autenticados:

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restriccion: username solo letras, numeros y guion bajo, max 20 caracteres
ALTER TABLE public.profiles 
  ADD CONSTRAINT username_format 
  CHECK (username ~ '^[a-zA-Z0-9_]{1,20}$');

-- RLS: Solo el usuario puede ver/editar su propio perfil
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

---

### 2. Animacion CSS flip card en `tailwind.config.ts`

Agregar keyframes para la rotacion 3D:

```typescript
keyframes: {
  // ... existentes ...
  "flip-to-back": {
    "0%": { transform: "rotateY(0deg)" },
    "100%": { transform: "rotateY(180deg)" }
  },
  "flip-to-front": {
    "0%": { transform: "rotateY(180deg)" },
    "100%": { transform: "rotateY(360deg)" }
  }
},
animation: {
  // ... existentes ...
  "flip-to-back": "flip-to-back 0.6s ease-in-out forwards",
  "flip-to-front": "flip-to-front 0.6s ease-in-out forwards"
}
```

---

### 3. Componente `ProfileCard.tsx`

Nuevo componente con dos caras:

**Cara frontal (actual):**
- Avatar, nombre, email
- Mensaje "Tu nombre esta reservado"
- Boton "Cambiar username" que activa el flip

**Cara trasera (formulario):**
- Header azul con preview: `vibecoding.la/@username`
- Formulario con:
  - Titulo: "Cambia tu nombre de usuario"
  - Input con prefijo `@`
  - Texto de ayuda: "Hasta 20 caracteres (letras, numeros o _)"
  - Botones: "Cancelar" y "Guardar"

**Estructura del flip:**
```tsx
<div className="perspective-1000">
  <div className={`relative transition-transform duration-600 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
    {/* Cara frontal */}
    <div className="backface-hidden">
      ...contenido actual...
      <Button onClick={() => setIsFlipped(true)}>Cambiar username</Button>
    </div>
    
    {/* Cara trasera */}
    <div className="backface-hidden rotate-y-180 absolute inset-0">
      ...formulario...
    </div>
  </div>
</div>
```

---

### 4. Hook `useProfile.ts`

Nuevo hook para manejar la logica de perfil:

```typescript
export function useProfile() {
  // Obtener perfil del usuario
  const fetchProfile = async (userId: string) => { ... }
  
  // Actualizar username
  const updateUsername = async (username: string) => { ... }
  
  // Verificar disponibilidad
  const checkUsernameAvailable = async (username: string) => { ... }
  
  return { profile, loading, updateUsername, checkUsernameAvailable }
}
```

---

### 5. Actualizacion de `Profile.tsx`

Reemplazar la tarjeta actual con el nuevo componente `ProfileCard`:

```tsx
import ProfileCard from '@/components/ProfileCard';

const Profile = () => {
  const { user, loading } = useAuth();
  // ...

  return (
    <div className="flex min-h-screen ...">
      <UserMenu />
      <ProfileCard user={user} />
    </div>
  );
};
```

---

## Diseno visual del reverso de la tarjeta

```text
+------------------------------------------+
|                                          |
|     vibecoding.la/@tu_username           |  <-- Fondo azul #3D5AFE
|                                          |
+------------------------------------------+
|                                          |
|  Cambia tu nombre de usuario             |  <-- Titulo negro
|                                          |
|  +------------------------------------+  |
|  | @ technical_founder                |  |  <-- Input con prefijo @
|  +------------------------------------+  |
|                                          |
|  Hasta 20 caracteres (letras, numeros    |  <-- Texto gris
|  o _)                                    |
|                                          |
|                   [ Cancelar ] [ Guardar]|  <-- Botones
|                                          |
+------------------------------------------+
     Fondo blanco, sombra suave
```

---

## Validaciones del username

| Regla | Descripcion |
|-------|-------------|
| Longitud | 1-20 caracteres |
| Caracteres | Solo letras (a-z, A-Z), numeros (0-9) y guion bajo (_) |
| Unicidad | No puede estar en uso por otro usuario |
| Formato | Sin espacios, sin caracteres especiales |

---

## Archivos a crear/modificar

| Archivo | Accion |
|---------|--------|
| `supabase/migrations/xxx_profiles.sql` | Crear tabla profiles |
| `tailwind.config.ts` | Agregar animaciones flip |
| `src/components/ProfileCard.tsx` | Nuevo componente con flip |
| `src/hooks/useProfile.ts` | Nuevo hook para perfil |
| `src/pages/Profile.tsx` | Usar nuevo ProfileCard |
| `src/index.css` | Agregar clases CSS para 3D flip |

---

## Flujo de usuario

1. Usuario ve su tarjeta de perfil (cara frontal)
2. Hace clic en "Cambiar username"
3. La tarjeta gira 180 grados con efecto 3D
4. Ve el formulario con preview de URL
5. Ingresa su username deseado
6. Sistema valida formato y disponibilidad
7. Al guardar, se actualiza la BD y la tarjeta vuelve a girar
8. Ve su perfil actualizado con el nuevo username
