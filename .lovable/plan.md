

## Resumen

Cuando alguien visite un perfil público (ej: `vibecoders.la/@rosmel`), el favicon de la pestaña del navegador mostrará la foto de perfil de ese usuario en lugar del logo de Vibecoders.

---

## Cómo funcionará

1. El usuario navega a `/@rosmel`
2. Se carga el perfil con su `avatar_url`
3. El favicon de la pestaña cambia automáticamente a la foto del usuario
4. Cuando se sale de esa página, el favicon vuelve al original de Vibecoders

---

## Implementación

### 1. Crear hook `useFavicon`

Nuevo archivo: `src/hooks/useFavicon.ts`

Este hook se encarga de:
- Guardar el favicon original al montarse
- Cambiar el `<link rel="icon">` al nuevo valor
- Restaurar el original cuando el componente se desmonta

```
Lógica:
1. Buscar el elemento <link rel="icon"> existente
2. Guardar su href original en una ref
3. Cambiar el href al nuevo favicon (avatar_url)
4. En cleanup (useEffect return), restaurar el original
```

### 2. Usar el hook en PublicProfileCard

Modificar: `src/components/PublicProfileCard.tsx`

Agregar el hook después de los otros efectos existentes:

```
useFavicon(profile.avatar_url || undefined);
```

El hook solo cambiará el favicon si `avatar_url` existe. Si no tiene foto, se mantiene el favicon por defecto.

---

## Detalles técnicos

| Aspecto | Solución |
|---------|----------|
| **Encontrar el favicon** | `document.querySelector('link[rel="icon"]')` |
| **Restaurar al salir** | `useEffect` cleanup function |
| **Sin avatar** | No se modifica el favicon (mantiene el original) |
| **Compatibilidad** | Los navegadores modernos soportan cambiar favicon dinámicamente |

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useFavicon.ts` | **Crear** - Hook para gestionar el favicon dinámico |
| `src/components/PublicProfileCard.tsx` | **Modificar** - Importar y usar `useFavicon` con el avatar del perfil |

---

## Experiencia del usuario

- **Entrando a un perfil**: El favicon cambia a la foto del usuario
- **Saliendo del perfil**: El favicon vuelve al logo de Vibecoders
- **Perfil sin foto**: Se mantiene el favicon de Vibecoders

