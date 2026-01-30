
# Plan: Corregir Validacion de Username

## Problemas Identificados

### 1. Bucle Infinito en useEffect
La funcion `checkUsernameAvailable` en `useProfile.ts` no esta envuelta en `useCallback`, por lo que se recrea en cada render. Esto causa que el `useEffect` en `ProfileCard.tsx` se ejecute infinitamente porque tiene `checkUsernameAvailable` como dependencia.

### 2. Validacion Case-Sensitive Incorrecta
- `checkUsernameAvailable` busca el username exactamente como se escribe (ej: "RosmelOrtiz")
- `updateUsername` convierte a minusculas antes de guardar (ej: "rosmelortiz")
- Resultado: la validacion pasa pero al guardar falla porque "rosmelortiz" ya existe

### 3. Color del Check
Actualmente verde, deberia ser azul (#3D5AFE) para mantener consistencia con el branding.

---

## Solucion

### Archivo 1: `src/hooks/useProfile.ts`

**Cambio 1**: Envolver `checkUsernameAvailable` en `useCallback`

```typescript
const checkUsernameAvailable = useCallback(async (username: string): Promise<boolean> => {
  if (!user || !username) return false;

  // Convertir a minusculas para validacion consistente
  const normalizedUsername = username.toLowerCase();

  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', normalizedUsername)
    .neq('id', user.id)
    .maybeSingle();

  return !data;
}, [user]);
```

Esto resuelve:
- El bucle infinito (funcion estable entre renders)
- La inconsistencia de mayusculas/minusculas (normaliza a lowercase)

---

### Archivo 2: `src/components/ProfileCard.tsx`

**Cambio 1**: Color del check de verde a azul

Linea 214:
```tsx
// Antes
<Check className="h-4 w-4 text-green-500" />

// Despues
<Check className="h-4 w-4 text-[#3D5AFE]" />
```

---

## Resumen de Cambios

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useProfile.ts` | Envolver checkUsernameAvailable en useCallback + normalizar a lowercase |
| `src/components/ProfileCard.tsx` | Cambiar color del check de verde a azul |

---

## Flujo Corregido

```text
1. Usuario escribe "RosmelOrtiz"
   |
   v
2. Espera 2 segundos (debounce)
   |
   v
3. checkUsernameAvailable("RosmelOrtiz")
   |
   v
4. Normaliza a "rosmelortiz"
   |
   v
5. Busca en DB: SELECT id FROM profiles WHERE username = 'rosmelortiz'
   |
   +-- Si existe --> isAvailable = false, muestra X roja
   |
   +-- Si NO existe --> isAvailable = true, muestra check azul
   |
   v
6. Usuario hace clic en Guardar
   |
   v
7. updateUsername normaliza a "rosmelortiz" y guarda
   |
   v
8. Exito (porque la validacion ya verifico el mismo valor normalizado)
```

---

## Seccion Tecnica

El problema del bucle infinito ocurre porque:

```typescript
// En useProfile.ts - funcion SIN useCallback
const checkUsernameAvailable = async (username: string) => { ... };
// Esta funcion se RECREA en cada render del hook

// En ProfileCard.tsx
useEffect(() => {
  // ... logica del debounce
}, [username, profile?.username, checkUsernameAvailable]);
// ^^^ Esta dependencia CAMBIA en cada render, disparando el efecto
```

La solucion con `useCallback`:

```typescript
// En useProfile.ts - funcion CON useCallback
const checkUsernameAvailable = useCallback(async (username: string) => { ... }, [user]);
// Esta funcion se mantiene ESTABLE entre renders (solo cambia si 'user' cambia)
```
