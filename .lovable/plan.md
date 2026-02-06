

## Mejoras al panel de Feedback del Admin

### Cambios planificados

### 1. Redisenar la lista de hilos (panel izquierdo)
- Priorizar el **nombre** del usuario como texto principal (fuente mas grande, negrita)
- Mostrar el **@username** debajo en texto mas pequeno y muted
- Ajustar el ancho de la columna izquierda para que los nombres no se corten (aumentar de `320px` a `360px` o usar `min-w-0` con mejor truncado)
- Mover el timestamp debajo del nombre/username junto al conteo de mensajes

**Archivo:** `src/components/admin/FeedbackThreadList.tsx`

### 2. Acciones sobre mensajes individuales (editar, eliminar, enviar por correo)
- Agregar un menu contextual (tres puntos) en cada mensaje del admin en el chat
- Opciones del menu:
  - **Editar mensaje**: permite modificar el contenido inline
  - **Eliminar mensaje**: confirmacion y eliminacion del mensaje y sus adjuntos
  - **Enviar por correo**: abre Gmail con `mailto:` usando el email del usuario del hilo como destinatario y el contenido del mensaje como cuerpo

**Archivos:**
- `src/components/feedback/ChatMessage.tsx` - agregar menu de acciones y modo edicion
- `src/hooks/useFeedback.ts` - agregar mutaciones `deleteMessage` y `updateMessage`

### 3. Obtener el email del usuario para Gmail
- El email del usuario no esta en la tabla `profiles` directamente. Se necesita obtenerlo del hilo
- Agregar `email_public` del perfil al query de threads en `useFeedback.ts`, y como fallback usar el email de auth (que ya esta en `auth.users` pero no accesible por RLS)
- Se usara el campo `email_public` de la tabla `profiles` si esta disponible

**Archivo:** `src/hooks/useFeedback.ts` - incluir `email_public` en el select de profiles

### 4. Agregar eliminacion de mensajes individuales al hook
- Nueva mutacion `deleteMessage` que elimina adjuntos del storage, registros de attachments y el mensaje
- Nueva mutacion `updateMessage` que actualiza el contenido del mensaje

**Archivo:** `src/hooks/useFeedback.ts`

### 5. Traducciones
- Agregar claves para: editMessage, deleteMessage, sendEmail, editConfirm, deleteMessageConfirm, messageDeleted, messageUpdated

**Archivos:** `src/i18n/es/feedback.json`, `src/i18n/en/feedback.json`

---

### Detalle tecnico

**ChatMessage.tsx** recibira nuevas props:
- `isAdmin`: boolean - para mostrar el menu solo en el panel admin
- `onDelete`: callback
- `onUpdate`: callback con nuevo contenido
- `userEmail`: string | null - para la opcion de Gmail
- El componente tendra un estado `isEditing` para modo edicion inline

**useFeedback.ts** nuevas mutaciones:
```text
deleteMessage(messageId: string)
  -> Eliminar attachments del storage
  -> Eliminar registros de feedback_attachments
  -> Eliminar feedback_messages
  -> Invalidar queries

updateMessage(messageId: string, content: string)
  -> UPDATE feedback_messages SET content WHERE id
  -> Invalidar queries
```

**Gmail link format:**
```text
https://mail.google.com/mail/?view=cm&to={email}&body={encodedContent}
```

**FeedbackThreadList.tsx** layout refactored:
```text
[Avatar] [Name (bold, principal)]     
         [@username (small, muted)]
         [N mensajes - hace X min]
                              [trash icon on hover]
```

**FeedbackManager.tsx**: ajustar grid de `320px` a `380px` para dar mas espacio a la lista.

### RLS necesaria
- `feedback_messages` ya tiene policy de DELETE y UPDATE para admins? Revisando: tiene DELETE para admins, pero NO tiene UPDATE. Se necesita agregar una migration para permitir que admins puedan hacer UPDATE en `feedback_messages`.

**Archivo nuevo:** migration SQL para agregar policy UPDATE en `feedback_messages` para admins.

