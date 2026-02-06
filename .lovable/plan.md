

## Mejoras en el Chat de Feedback (Admin + /hablemos)

### Problema
1. El encabezado del chat no tiene un enlace para ver el perfil publico del usuario en una nueva pestana
2. Cuando hay muchos mensajes, el scroll no funciona correctamente y el input queda oculto fuera de la vista
3. El textarea del input tiene altura fija y no crece al hacer saltos de linea

### Solucion

### 1. Link al perfil publico en el header del chat

**Archivos:** `src/components/admin/FeedbackChat.tsx`, `src/pages/Feedback.tsx`

- En el header del admin chat, hacer que el nombre/username sea un enlace clickeable que abra `/@username` en una nueva pestana (`target="_blank"`)
- En `/hablemos`, agregar un link similar en el header para que el usuario pueda ver su propio perfil publico

### 2. Corregir el scroll y visibilidad del input

**Archivos:** `src/components/admin/FeedbackChat.tsx`, `src/pages/Feedback.tsx`

El problema es que `ScrollArea` con `flex-1` no esta conteniendo correctamente los mensajes. La solucion:
- Cambiar la estructura del contenedor de mensajes para usar `overflow-y-auto` con `min-h-0` en el flex container, asegurando que el area de mensajes sea scrollable y el input siempre quede visible en la parte inferior
- Reemplazar `ScrollArea` por un `div` con `overflow-y-auto` y `flex-1 min-h-0` para que el layout flex funcione correctamente

### 3. Textarea auto-expandible

**Archivo:** `src/components/feedback/ChatInput.tsx`

- Cambiar el comportamiento del textarea para que crezca dinamicamente con el contenido
- Default: 1 linea (~40px)
- Crece automaticamente con cada salto de linea
- Maximo: 5 lineas (~120px), despues muestra scroll interno
- Implementar con un `useEffect` que ajuste `scrollHeight` del textarea en cada cambio de contenido
- Reset a 1 linea despues de enviar el mensaje

---

### Detalle tecnico

**Auto-resize del textarea:**
```text
- Usar ref al textarea
- En cada onChange, resetear height a 'auto', luego asignar scrollHeight
- Limitar con max-h-[120px] y overflow-y-auto
- Al enviar mensaje, resetear height manualmente
```

**Fix del scroll:**
```text
- Contenedor principal: flex flex-col h-full
- Area de mensajes: flex-1 min-h-0 overflow-y-auto p-4
- Input: shrink-0 (nunca se comprime)
```

**Link al perfil:**
```text
- Admin: <a href="/@{username}" target="_blank"> en nombre y username
- /hablemos: agregar boton/link "Ver mi perfil" en el header
```

### Archivos a modificar
- `src/components/feedback/ChatInput.tsx` - textarea auto-expandible
- `src/components/admin/FeedbackChat.tsx` - link al perfil + fix scroll
- `src/pages/Feedback.tsx` - link al perfil + fix scroll

