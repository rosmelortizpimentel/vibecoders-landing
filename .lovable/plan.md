
# Plan: Validacion en Tiempo Real de Username con Debounce

## Problema Actual
1. El error "Error al guardar" es muy generico - no muestra "Este username ya esta en uso"
2. No hay validacion en tiempo real mientras el usuario escribe
3. No hay feedback visual (loading/check/X) junto al input

---

## Solucion

### Cambios en `src/components/ProfileCard.tsx`

**Nuevos estados a agregar:**
- `isChecking: boolean` - indica si esta verificando disponibilidad
- `isAvailable: boolean | null` - resultado de la verificacion (null = no verificado, true = disponible, false = no disponible)

**Logica de debounce con useEffect:**
```text
Usuario escribe --> Timer 2 segundos
                    |
                    +--> Si escribe de nuevo, reinicia timer
                    |
                    +--> Si pasan 2 seg sin escribir:
                         1. isChecking = true (mostrar loader)
                         2. Llamar checkUsernameAvailable()
                         3. isAvailable = resultado
                         4. isChecking = false
```

**UI del input con indicadores visuales:**
```text
+----------------------------------------+
| @ mi_username                   [   ]  |  <- Sin verificar (vacio)
+----------------------------------------+

+----------------------------------------+
| @ mi_username                   [o ]   |  <- Verificando (Loader2 girando)
+----------------------------------------+

+----------------------------------------+
| @ mi_username                   [✓]    |  <- Disponible (Check verde)
+----------------------------------------+

+----------------------------------------+
| @ mi_username                   [✗]    |  <- No disponible (X roja)
+----------------------------------------+
```

**Modificaciones al boton Guardar:**
- Deshabilitar si `isChecking === true` (aun verificando)
- Deshabilitar si `isAvailable === false` (no disponible)
- Antes de guardar, verificar una vez mas la disponibilidad

**Mejora del mensaje de error:**
- Si el username no esta disponible, mostrar: "Este username ya esta en uso"
- Si es el mismo que ya tiene el usuario, no mostrar error

---

## Cambios Especificos

### 1. Importar iconos adicionales
```tsx
import { CheckCircle, Edit3, Loader2, Lock, Check, X } from 'lucide-react';
```

### 2. Agregar nuevos estados
```tsx
const [isChecking, setIsChecking] = useState(false);
const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
```

### 3. Agregar useEffect para debounce
```tsx
useEffect(() => {
  // Si no hay username o es muy corto, resetear estado
  if (!username.trim() || username.length < 3) {
    setIsAvailable(null);
    return;
  }

  // Si es el mismo username que ya tiene, marcar como disponible
  if (username === profile?.username) {
    setIsAvailable(true);
    return;
  }

  // Configurar debounce de 2 segundos
  const timer = setTimeout(async () => {
    setIsChecking(true);
    const available = await checkUsernameAvailable(username);
    setIsAvailable(available);
    setIsChecking(false);
    
    if (!available) {
      setError('Este username ya esta en uso');
    } else {
      setError(null);
    }
  }, 2000);

  return () => clearTimeout(timer);
}, [username, profile?.username, checkUsernameAvailable]);
```

### 4. Modificar el Input para incluir indicador visual
```tsx
<div className="relative">
  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
    @
  </span>
  <Input
    value={username}
    onChange={handleUsernameChange}
    className="pl-7 pr-10 ..." // Agregar padding derecho
  />
  {/* Indicador de estado a la derecha */}
  <div className="absolute right-3 top-1/2 -translate-y-1/2">
    {isChecking && (
      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
    )}
    {!isChecking && isAvailable === true && (
      <Check className="h-4 w-4 text-green-500" />
    )}
    {!isChecking && isAvailable === false && (
      <X className="h-4 w-4 text-red-500" />
    )}
  </div>
</div>
```

### 5. Modificar handleSave para doble verificacion
```tsx
const handleSave = async () => {
  if (!username.trim()) {
    setError('Ingresa un username');
    return;
  }

  // Verificar disponibilidad antes de guardar
  setSaving(true);
  const available = await checkUsernameAvailable(username);
  
  if (!available && username !== profile?.username) {
    setError('Este username ya esta en uso');
    setSaving(false);
    setIsAvailable(false);
    return;
  }

  const result = await updateUsername(username.trim().toLowerCase());
  // ... resto del codigo
};
```

### 6. Modificar condicion de deshabilitado del boton
```tsx
<Button
  onClick={handleSave}
  disabled={saving || !username.trim() || isChecking || isAvailable === false}
>
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/ProfileCard.tsx` | Agregar debounce, estados, indicadores visuales |

---

## Flujo Visual Completo

```text
1. Usuario abre formulario
   - Input vacio, sin indicador
   
2. Usuario escribe "carlos"
   - Timer de 2 seg comienza
   - Sin indicador aun
   
3. Usuario sigue escribiendo "carlos123"
   - Timer se reinicia
   
4. Usuario deja de escribir por 2 segundos
   - Aparece loader girando a la derecha
   - Se consulta DB
   
5a. Username disponible:
    - Loader desaparece
    - Check verde aparece
    - Boton Guardar habilitado
    
5b. Username NO disponible:
    - Loader desaparece  
    - X roja aparece
    - Mensaje "Este username ya esta en uso"
    - Boton Guardar deshabilitado

6. Usuario hace clic en Guardar
   - Se verifica una vez mas
   - Si OK, guarda y voltea tarjeta
   - Si no, muestra error
```
