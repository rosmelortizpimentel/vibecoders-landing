# Plan: Sistema de Acceso Cerrado + Pagina de Waitlist con Vibecoders Suite

## Resumen

Cuando se alcancen los 100 founders registrados, los nuevos usuarios que intenten loguearse seran redirigidos a una pagina `/closed` que muestra la vision de la **Vibecoders Communication Suite** (los 10 widgets), un contador regresivo al 1 de marzo, y un formulario de waitlist para que dejen su email.

Los usuarios existentes (ya registrados) seguiran accediendo normalmente.

---

## Cambios a realizar

### 1. Modificar el edge function `check-founder-status`

Agregar un campo `accessClosed` en la respuesta cuando el usuario es nuevo y ya se llenaron los 100 cupos. Esto permite al frontend saber que debe redirigir.

- Si el usuario ya tiene suscripcion (no pending) -> acceso normal
- Si es nuevo y hay menos de 100 founders -> asignar tier founder (como ahora)
- Si es nuevo y hay 100+ founders -> retornar `{ accessClosed: true }` en vez de asignar tier free

### 2. Modificar `useAuth.ts`

En el bloque `SIGNED_IN`, despues de llamar a `check-founder-status`, verificar si la respuesta incluye `accessClosed: true`. Si es asi, redirigir a `/closed` en vez de `/me/profile`.

### 3. Crear pagina `/closed` (nuevo archivo `src/pages/Closed.tsx`) q

Pagina con:

- Header con logo de Vibecoders
- Mensaje principal: "El acceso esta cerrado" / "Los primeros 100 vibecoders ya estan dentro"
- Contador regresivo al **1 de marzo de 2026**
- Seccion visual de la **Vibecoders Communication Suite** mostrando los 10 widgets con iconos, nombres y descripciones cortas en cards atractivas
- Tabla/seccion comparativa de costos que reemplaza ($500-900/mes en herramientas vs incluido en Vibecoders)
- Formulario de waitlist (reutilizando la logica existente de `src/lib/waitlist.ts`)
- Footer minimalista

### 4. Agregar ruta en `App.tsx`

Agregar `<Route path="/closed" element={<Closed />} />` como ruta publica.

### 5. Traducciones (i18n)

Agregar archivo de traducciones `src/i18n/es/closed.json` (y en/fr/pt) con todos los textos de la pagina.

---

## Detalles tecnicos

### Edge function `check-founder-status` - Cambio clave

```typescript
// Despues de asignar tier via assign_founder_tier:
if (tier === 'free' && !existing) {
  // Usuario nuevo post-limite: marcar acceso cerrado
  return Response({ accessClosed: true, tier: 'free' });
}
```

La logica actual de `assign_founder_tier` ya asigna `free` cuando hay 100+ founders. El cambio es detectar que es un usuario **nuevo** (no tenia registro previo) y en ese caso senalar `accessClosed`.

### useAuth.ts - Redireccion

```typescript
supabase.functions.invoke('check-founder-status').then(({ data }) => {
  if (data?.accessClosed) {
    window.location.href = '/closed';
  } else if (window.location.pathname === '/') {
    window.location.href = '/me/profile';
  }
});
```

### Pagina /closed - Estructura visual

La pagina tendra estas secciones:

1. **Hero**: Mensaje de acceso cerrado + contador regresivo
2. **Suite Grid**: 10 cards (2x5 o 3-col responsive) mostrando cada widget con icono, nombre y descripcion
3. **Comparacion de valor**: Lo que ahorras vs herramientas individuales
4. **Waitlist CTA**: Input de email + boton para unirse a la lista de espera
5. **Footer**: Enlace a redes y legal

### Countdown Timer

Componente con `useEffect` + `setInterval` contando hasta `2026-03-01T00:00:00` mostrando dias, horas, minutos y segundos.

### Waitlist

Se reutiliza `registerToWaitlist()` de `src/lib/waitlist.ts` y el `WaitlistSuccessModal` existente.

---

## Archivos afectados


| Archivo                                            | Accion                                 |
| -------------------------------------------------- | -------------------------------------- |
| `supabase/functions/check-founder-status/index.ts` | Modificar para retornar `accessClosed` |
| `src/hooks/useAuth.ts`                             | Agregar redireccion a `/closed`        |
| `src/pages/Closed.tsx`                             | **Crear** - Pagina completa            |
| `src/App.tsx`                                      | Agregar ruta `/closed`                 |
| `src/i18n/es/closed.json`                          | **Crear** - Traducciones espanol       |
| `src/i18n/en/closed.json`                          | **Crear** - Traducciones ingles        |
| `src/i18n/fr/closed.json`                          | **Crear** - Traducciones frances       |
| `src/i18n/pt/closed.json`                          | **Crear** - Traducciones portugues     |


No se requieren migraciones de base de datos ya que la tabla `waitlist` ya existe.

El admin debe poder acceder a la pagina /closed para poder validar como luce, los otros usuarios fundadores no.