
## Objetivo
Asignar automáticamente un username basado en el email cuando el usuario se registra. Por ejemplo, si el correo es `abc@yopmail.com`, el username por defecto será `abc`.

---

## Flujo propuesto

1. Usuario se registra con Google (o email)
2. Al cargar el perfil por primera vez, si no existe:
   - Extraer la parte local del email (antes del @)
   - Limpiar caracteres no permitidos (solo letras, numeros, guion bajo)
   - Truncar a 20 caracteres maximo
   - Verificar disponibilidad usando la Edge Function existente
   - Si esta disponible, crear el perfil con ese username
   - Si no esta disponible, crear el perfil sin username (el usuario lo elige despues)
3. La card muestra el username asignado y la URL correspondiente

---

## Cambios

### 1. Archivo: `src/hooks/useProfile.ts`

Agregar funcion helper para extraer username del email:

```typescript
const extractUsernameFromEmail = (email: string): string => {
  // Obtener parte antes del @
  const localPart = email.split('@')[0] || '';
  // Limpiar: solo letras, numeros y guion bajo, minusculas
  const cleaned = localPart.toLowerCase().replace(/[^a-z0-9_]/g, '');
  // Truncar a 20 caracteres
  return cleaned.slice(0, 20);
};
```

Modificar la logica de creacion de perfil (lineas 36-44) para:
1. Extraer username candidato del email del usuario
2. Verificar disponibilidad con la Edge Function
3. Insertar perfil con username si esta disponible, o sin username si no lo esta

### 2. Archivo: `src/components/ProfileCard.tsx`

Actualizar el mensaje de la card frontal:
- Si tiene username: mostrar "Tu @username esta reservado" con la URL
- Si no tiene username: mantener el mensaje generico actual

---

## Consideraciones tecnicas

- La verificacion de disponibilidad requiere un usuario autenticado, por lo que se usara directamente una query con service role desde el frontend (o se hara un intento de insert con manejo de error de constraint)
- Si el username extraido del email contiene caracteres invalidos o esta vacio despues de limpiar, se crea el perfil sin username
- El username minimo debe tener al menos 1 caracter valido

---

## Resultado esperado

Cuando un usuario con email `rosmel@betto.today` se registra:
1. Se extrae "rosmel" como username candidato
2. Se verifica si "rosmel" esta disponible
3. Si esta disponible, el perfil se crea con username "rosmel"
4. La card muestra: "Tu @rosmel esta reservado" y la URL `vibecoders.la/@rosmel`
5. El usuario puede cambiar su username en cualquier momento usando el boton "Cambiar username"
