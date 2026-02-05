

## Plan: Sistema de Feedback "Hablemos" - Chat Usuario/Admin

### Resumen

Implementar un sistema de feedback tipo chat donde los usuarios pueden enviar mensajes y adjuntar imágenes, y los administradores pueden responder. La funcionalidad se llamará **"Hablemos"**.

---

### Arquitectura de Base de Datos

```text
feedback_threads (conversaciones)
├── id (uuid, PK)
├── user_id (uuid, FK → profiles.id)
├── status (text: 'open' | 'closed')
├── created_at (timestamp)
├── updated_at (timestamp)
└── last_message_at (timestamp) -- Para ordenar en admin

feedback_messages (mensajes)
├── id (uuid, PK)
├── thread_id (uuid, FK → feedback_threads.id)
├── sender_id (uuid, FK → profiles.id) -- Usuario o Admin
├── content (text) -- Mensaje de texto
├── is_admin_reply (boolean) -- Para distinguir visualmente
├── created_at (timestamp)
└── read_at (timestamp, nullable) -- Para marcar como leído

feedback_attachments (adjuntos)
├── id (uuid, PK)
├── message_id (uuid, FK → feedback_messages.id)
├── file_url (text)
├── file_name (text)
├── file_type (text)
└── created_at (timestamp)
```

---

### Storage Bucket

Crear bucket público `feedback-attachments` para almacenar las imágenes adjuntas:
- Máximo 5 imágenes por mensaje
- Políticas RLS: usuarios pueden subir a su carpeta, admins pueden leer todo

---

### Componentes del Sistema

#### Vista Usuario (`/hablemos`)

```text
┌─────────────────────────────────────────┐
│ 💬 Hablemos                             │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [Mensaje del usuario]           │   │  ← Alineado derecha
│  │ 📷📷📷 (thumbnails)              │   │
│  │                     12:30 PM    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [Respuesta del admin]           │   │  ← Alineado izquierda
│  │                     12:45 PM    │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│ [📎] [___________________] [Enviar →]  │
└─────────────────────────────────────────┘
```

- Estilo minimalista tipo chat
- Burbujas de mensaje (derecha = usuario, izquierda = admin)
- Botón para adjuntar hasta 5 imágenes
- Scroll automático al último mensaje
- Timestamps discretos

#### Vista Admin (`/admin/feedback`)

```text
┌────────────────────┬────────────────────────────────────┐
│ Conversaciones     │  Chat con @username                │
├────────────────────┼────────────────────────────────────┤
│ ┌────────────────┐ │                                    │
│ │ 🔵 @user1      │ │  [Mensaje del usuario]             │
│ │ 5 mensajes     │ │  12:30 PM                          │
│ │ hace 5 min     │ │                                    │
│ └────────────────┘ │  [Respuesta del admin - TÚ]        │
│ ┌────────────────┐ │  12:45 PM                          │
│ │ ○ @user2       │ │                                    │
│ │ 3 mensajes     │ │  [___________________] [Enviar →]  │
│ │ hace 2 días    │ │                                    │
│ └────────────────┘ │                                    │
└────────────────────┴────────────────────────────────────┘
```

- Panel izquierdo: lista de threads ordenados por `last_message_at DESC`
- Cada item muestra: avatar, username, contador mensajes, tiempo desde último
- Panel derecho: chat completo con la conversación seleccionada
- Admin puede responder en línea
- Indicador visual de mensajes no leídos (punto azul)

---

### Sección Técnica: Estructura de Archivos

#### Nuevos Archivos

| Archivo | Propósito |
|---------|-----------|
| `src/pages/Feedback.tsx` | Página de feedback para usuarios |
| `src/components/feedback/ChatMessage.tsx` | Componente de mensaje individual |
| `src/components/feedback/ChatInput.tsx` | Input con upload de imágenes |
| `src/components/feedback/ImageAttachment.tsx` | Componente para mostrar imágenes |
| `src/components/admin/FeedbackManager.tsx` | Vista admin de feedback |
| `src/components/admin/FeedbackThreadList.tsx` | Lista de conversaciones |
| `src/components/admin/FeedbackChat.tsx` | Chat para admin |
| `src/hooks/useFeedback.ts` | Hook para manejar mensajes y threads |
| `src/i18n/es/feedback.json` | Traducciones español |
| `src/i18n/en/feedback.json` | Traducciones inglés |

#### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/App.tsx` | Agregar ruta `/hablemos` en AuthenticatedLayout |
| `src/pages/Admin.tsx` | Agregar ruta `/admin/feedback` |
| `src/components/admin/AdminSidebar.tsx` | Agregar link a Feedback |
| `src/components/AuthenticatedHeader.tsx` | Agregar link a "Hablemos" en navegación |

---

### Migraciones SQL

#### 1. Crear tablas

```sql
-- Tabla de threads (conversaciones)
CREATE TABLE feedback_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de mensajes
CREATE TABLE feedback_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES feedback_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_admin_reply BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- Tabla de adjuntos
CREATE TABLE feedback_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES feedback_messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_feedback_threads_user_id ON feedback_threads(user_id);
CREATE INDEX idx_feedback_threads_last_message ON feedback_threads(last_message_at DESC);
CREATE INDEX idx_feedback_messages_thread_id ON feedback_messages(thread_id);
CREATE INDEX idx_feedback_attachments_message_id ON feedback_attachments(message_id);
```

#### 2. Políticas RLS

```sql
-- feedback_threads
ALTER TABLE feedback_threads ENABLE ROW LEVEL SECURITY;

-- Usuarios ven solo sus threads
CREATE POLICY "Users can view own threads" ON feedback_threads
  FOR SELECT USING (auth.uid() = user_id);

-- Admins ven todos
CREATE POLICY "Admins can view all threads" ON feedback_threads
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Usuarios pueden crear threads
CREATE POLICY "Users can create threads" ON feedback_threads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Solo admins pueden actualizar (cerrar threads)
CREATE POLICY "Admins can update threads" ON feedback_threads
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- feedback_messages
ALTER TABLE feedback_messages ENABLE ROW LEVEL SECURITY;

-- Ver mensajes de threads propios
CREATE POLICY "Users can view own thread messages" ON feedback_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM feedback_threads WHERE id = thread_id AND user_id = auth.uid())
  );

-- Admins ven todos los mensajes
CREATE POLICY "Admins can view all messages" ON feedback_messages
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Usuarios insertan mensajes en sus threads
CREATE POLICY "Users can insert messages in own threads" ON feedback_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM feedback_threads WHERE id = thread_id AND user_id = auth.uid())
  );

-- Admins insertan mensajes en cualquier thread
CREATE POLICY "Admins can insert messages" ON feedback_messages
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- feedback_attachments
ALTER TABLE feedback_attachments ENABLE ROW LEVEL SECURITY;

-- Similar pattern para attachments
CREATE POLICY "Users can view own attachments" ON feedback_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM feedback_messages m
      JOIN feedback_threads t ON t.id = m.thread_id
      WHERE m.id = message_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all attachments" ON feedback_attachments
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert attachments" ON feedback_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM feedback_messages m
      JOIN feedback_threads t ON t.id = m.thread_id
      WHERE m.id = message_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert attachments" ON feedback_attachments
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
```

#### 3. Storage Bucket

```sql
-- Crear bucket para attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-attachments', 'feedback-attachments', true);

-- Políticas de storage
CREATE POLICY "Users upload to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'feedback-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'feedback-attachments');

CREATE POLICY "Users delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'feedback-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins full access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'feedback-attachments' AND
    has_role(auth.uid(), 'admin')
  );
```

---

### Trigger para actualizar last_message_at

```sql
CREATE OR REPLACE FUNCTION update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE feedback_threads 
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_feedback_message_insert
  AFTER INSERT ON feedback_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_last_message();
```

---

### Flujo de Usuario

1. Usuario navega a `/hablemos` desde el header
2. Si no tiene thread existente, ve input vacío con "Escribe tu mensaje..."
3. Al enviar primer mensaje:
   - Se crea automáticamente un thread
   - Se inserta el mensaje
   - Se suben attachments si hay
4. Los mensajes aparecen como chat
5. Cuando admin responde, aparece en el otro lado

### Flujo de Admin

1. Admin ve `/admin/feedback` con lista de threads
2. Ordenados por último mensaje (más reciente arriba)
3. Al seleccionar un thread, ve la conversación completa
4. Puede responder directamente
5. Los mensajes del admin se marcan con `is_admin_reply = true`

---

### Archivos de Traducción

**`src/i18n/es/feedback.json`**:
```json
{
  "title": "Hablemos",
  "subtitle": "Envíanos tus comentarios, sugerencias o reporta problemas",
  "placeholder": "Escribe tu mensaje...",
  "send": "Enviar",
  "attachImages": "Adjuntar imágenes",
  "maxImages": "Máximo 5 imágenes",
  "you": "Tú",
  "admin": "Admin",
  "empty": "Aún no hay mensajes. ¡Sé el primero en escribir!",
  "sending": "Enviando...",
  "sent": "Enviado",
  "adminTitle": "Feedback de Usuarios",
  "adminSubtitle": "Conversaciones con usuarios",
  "noConversations": "No hay conversaciones aún",
  "messages": "mensajes",
  "selectConversation": "Selecciona una conversación",
  "timeAgo": {
    "now": "ahora",
    "minutes": "hace {n} min",
    "hours": "hace {n} h",
    "days": "hace {n} días"
  }
}
```

**`src/i18n/en/feedback.json`**:
```json
{
  "title": "Let's Talk",
  "subtitle": "Send us your feedback, suggestions, or report issues",
  "placeholder": "Write your message...",
  "send": "Send",
  "attachImages": "Attach images",
  "maxImages": "Maximum 5 images",
  "you": "You",
  "admin": "Admin",
  "empty": "No messages yet. Be the first to write!",
  "sending": "Sending...",
  "sent": "Sent",
  "adminTitle": "User Feedback",
  "adminSubtitle": "Conversations with users",
  "noConversations": "No conversations yet",
  "messages": "messages",
  "selectConversation": "Select a conversation",
  "timeAgo": {
    "now": "now",
    "minutes": "{n} min ago",
    "hours": "{n} h ago",
    "days": "{n} days ago"
  }
}
```

---

### Orden de Implementación

1. **Migración DB**: Crear tablas, RLS, storage bucket
2. **Hook**: Crear `useFeedback.ts` con lógica de threads/mensajes
3. **Componentes base**: ChatMessage, ChatInput, ImageAttachment
4. **Página usuario**: `/hablemos` con chat completo
5. **Componentes admin**: FeedbackThreadList, FeedbackChat
6. **Página admin**: `/admin/feedback` con split view
7. **Navegación**: Agregar links en header y sidebar admin
8. **Traducciones**: Archivos JSON ES/EN
9. **Testing**: Verificar flujo completo

---

### Diseño Visual (Minimalista)

- **Colores**: Burbujas del usuario en `primary`, admin en `muted`
- **Tipografía**: Texto regular, timestamps en `text-xs text-muted-foreground`
- **Espaciado**: Gap de `4px` entre mensajes del mismo sender, `16px` entre diferentes
- **Imágenes**: Grid de thumbnails con lightbox al hacer click
- **Inputs**: Bordes sutiles, botón de enviar como ícono
- **Animaciones**: Transición suave al aparecer nuevos mensajes

