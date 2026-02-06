
# Plan: Sistema Completo de Beta Squads - Flujo de Unirse, Feedback con Imagenes y Workflow de Bugs

## Resumen Ejecutivo

Este plan implementa un sistema completo de gestion de Beta Squads con:
1. Popup de confirmacion para unirse (en el feed)
2. Vista de estado del usuario (pendiente/aprobado/rechazado) en lugar del boton "Unirse"
3. Nuevo sistema de feedback con soporte para hasta 10 imagenes por reporte
4. Workflow de bugs: Owner marca para revision, Tester puede confirmar solucion o devolver
5. Vista de feedback para testers (solo lectura de sus propios reportes)
6. Menu de tres puntos para acciones multiples
7. Detalle compacto de app con cabecera resumida
8. Filtros por estado en listas de testers

---

## 1. Cambios en Base de Datos

### 1.1 Modificar tabla `beta_feedback`

Agregar nuevas columnas para soportar el workflow de bugs:

```sql
ALTER TABLE beta_feedback ADD COLUMN status TEXT NOT NULL DEFAULT 'open';
-- Valores posibles: 'open', 'in_review', 'resolved', 'closed'

ALTER TABLE beta_feedback ADD COLUMN resolved_by_owner BOOLEAN DEFAULT FALSE;
ALTER TABLE beta_feedback ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE beta_feedback ADD COLUMN tester_response TEXT; -- 'confirmed' | 'reopened'
ALTER TABLE beta_feedback ADD COLUMN tester_response_at TIMESTAMP WITH TIME ZONE;
```

### 1.2 Crear tabla `beta_feedback_attachments`

Nueva tabla para imagenes adjuntas a feedback:

```sql
CREATE TABLE beta_feedback_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES beta_feedback(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE beta_feedback_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testers can insert own attachments" ON beta_feedback_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM beta_feedback
      WHERE beta_feedback.id = beta_feedback_attachments.feedback_id
      AND beta_feedback.tester_id = auth.uid()
    )
  );

CREATE POLICY "Owners and testers can view attachments" ON beta_feedback_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM beta_feedback bf
      JOIN apps ON apps.id = bf.app_id
      WHERE bf.id = beta_feedback_attachments.feedback_id
      AND (bf.tester_id = auth.uid() OR apps.user_id = auth.uid())
    )
  );
```

---

## 2. Componente Feed: Popup de Confirmacion para Unirse

### 2.1 Modificar `BetaSquadFeedCard.tsx`

Cambios:
- Agregar estado `userTesterStatus` al hook `useBetaSquadsPublic`
- Mostrar AlertDialog de confirmacion antes de enviar solicitud
- Reemplazar boton "Unirme" por badge de estado si ya hay una solicitud

```
Estado del boton segun user_tester_status:
- null → "Unirme al Squad" (abre popup confirmacion)
- pending → Badge "Solicitud pendiente" (deshabilitado)
- accepted → "Acceder a mision" (lleva a /app/:id)
- rejected → No mostrar boton o "No aceptado"
```

### 2.2 Crear `JoinConfirmDialog.tsx`

Nuevo componente Dialog que muestra:
- Nombre de la app y logo
- Texto: "¿Confirmas que quieres unirte al Beta Squad?"
- Instrucciones resumidas (si existen)
- Botones: "Cancelar" | "Confirmar y enviar solicitud"

---

## 3. Hook Actualizado: Estado del Usuario por App

### 3.1 Modificar `useBetaSquadsPublic.ts`

Agregar campo `user_tester_status` a cada app:
- Hacer query adicional a `beta_testers` para el usuario actual
- Agrupar por `app_id` para obtener status de cada app

```typescript
interface BetaSquadApp {
  // ... campos existentes
  user_tester_status: {
    id: string;
    status: 'pending' | 'accepted' | 'rejected';
  } | null;
}
```

---

## 4. Pagina de Detalle de App Compacta

### 4.1 Modificar `AppDetail.tsx`

Cabecera compacta (todo en una fila):
```
[Logo 48x48] [Nombre + Tagline] [Badge Status] [Boton "Ver App"]
```

Debajo (solo si beta_active y es tester aceptado):
- Seccion de instrucciones de mision
- Panel de feedback con historial

### 4.2 Crear `AppDetailCompactHeader.tsx`

Nuevo componente para la cabecera compacta:
- Logo pequeno (48x48)
- Nombre y tagline en linea
- Badges de categoria/status
- Boton CTA "Ver App" alineado a la derecha

---

## 5. Sistema de Feedback con Imagenes

### 5.1 Modificar `BetaFeedbackForm.tsx`

Agregar:
- Input para subir hasta 10 imagenes
- Preview de imagenes seleccionadas con opcion de eliminar
- Subir imagenes a bucket `feedback-attachments` antes de enviar
- Enviar array de URLs al edge function

### 5.2 Modificar Edge Function `submit-beta-feedback`

Actualizar para:
- Recibir array de `attachments: { url, name, type }[]`
- Insertar en tabla `beta_feedback_attachments`
- Limite maximo de 10 attachments

### 5.3 Crear `BetaFeedbackImageUploader.tsx`

Componente para:
- Drag and drop de imagenes
- Preview grid de imagenes
- Boton para eliminar cada imagen
- Indicador de progreso de subida
- Limite visual (X/10 imagenes)

---

## 6. Vista de Feedback para Testers (Solo Lectura)

### 6.1 Crear `TesterFeedbackHistory.tsx`

Lista de reportes enviados por el tester:
- Fecha y hora de envio
- Tipo (bug/ux/feature/other)
- Contenido del reporte
- Imagenes adjuntas (click para ampliar)
- Estado del reporte (abierto/en revision/resuelto/cerrado)
- Si esta "en revision": mostrar alerta para re-probar

### 6.2 Crear hook `useTesterFeedback.ts`

```typescript
function useTesterFeedback(appId: string) {
  // Query feedback del usuario actual para esta app
  // Incluir attachments
  // Ordenar por created_at DESC
}
```

---

## 7. Vista de Feedback para Owner (Gestion Completa)

### 7.1 Modificar `BetaManagement.tsx`

Mejorar seccion de Feedback Inbox:
- Filtros por estado: Todos | Abiertos | En revision | Resueltos
- Cada item muestra: tester, tipo, preview contenido, fecha
- Imagenes adjuntas en grid
- Menu de 3 puntos con acciones

### 7.2 Crear `FeedbackActionMenu.tsx`

Menu desplegable (DropdownMenu) con:
- "Marcar como util" (toggle)
- "Marcar como resuelto" → pone status='in_review', espera confirmacion tester
- "Cerrar reporte" → pone status='closed' directamente
- "Eliminar" (con confirmacion)

---

## 8. Workflow de Bugs (Ciclo Completo)

### 8.1 Estados del Feedback

```
Flujo:
1. Tester envia → status='open'
2. Owner marca resuelto → status='in_review', resolved_by_owner=true
3. Tester ve alerta "Pendiente de verificar"
4. Tester responde:
   a) "Confirmo solucionado" → status='closed', tester_response='confirmed'
   b) "Sigue sin funcionar" → status='open', tester_response='reopened'
5. Owner puede cerrar directamente → status='closed'
```

### 8.2 Crear `FeedbackStatusBadge.tsx`

Badge con colores segun estado:
- open: Azul "Abierto"
- in_review: Amarillo "Pendiente verificar"
- closed: Gris "Cerrado"

### 8.3 Crear `TesterFeedbackResponseDialog.tsx`

Dialog para que el tester responda cuando un bug esta "in_review":
- Pregunta: "El problema ha sido solucionado?"
- Botones: "Si, cerrar reporte" | "No, sigue ocurriendo"

---

## 9. Filtros de Testers por Estado

### 9.1 Modificar `BetaManagement.tsx`

Agregar tabs o select para filtrar testers:
- Todos
- Pendientes (pending)
- Aceptados (accepted)
- Rechazados (rejected)

Ordenamiento:
1. Aceptados primero
2. Luego pendientes
3. Luego rechazados

---

## 10. Responsividad Completa (Mobile-First)

### 10.1 Principios de Diseno

- Cards con flex-col en mobile, flex-row en desktop
- Menu de 3 puntos en lugar de botones multiples
- Dialogs a pantalla completa en mobile (Sheet)
- Imagenes en grid responsive (2 cols mobile, 5 cols desktop)
- Touch targets minimo 44x44px

### 10.2 Componentes Afectados

- `BetaSquadFeedCard.tsx`: Stack vertical en mobile
- `AppDetail.tsx`: Sidebar debajo en mobile
- `BetaManagement.tsx`: Tabs scrollables en mobile
- `TesterFeedbackHistory.tsx`: Grid de imagenes responsive

---

## Archivos a Crear

| Archivo | Descripcion |
|---------|-------------|
| `src/components/beta/JoinConfirmDialog.tsx` | Popup confirmacion para unirse |
| `src/components/beta/BetaFeedbackImageUploader.tsx` | Upload de imagenes |
| `src/components/beta/TesterFeedbackHistory.tsx` | Historial de feedback del tester |
| `src/components/beta/FeedbackActionMenu.tsx` | Menu 3 puntos para acciones |
| `src/components/beta/FeedbackStatusBadge.tsx` | Badge de estado del feedback |
| `src/components/beta/TesterFeedbackResponseDialog.tsx` | Dialog respuesta del tester |
| `src/components/beta/AppDetailCompactHeader.tsx` | Cabecera compacta de app |
| `src/hooks/useTesterFeedback.ts` | Hook para feedback del tester |

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/hooks/useBetaSquadsPublic.ts` | Agregar user_tester_status |
| `src/hooks/useBetaSquad.ts` | Agregar updateFeedbackStatus, respondToResolution |
| `src/components/beta/BetaSquadFeedCard.tsx` | Estado dinamico del boton, popup confirmacion |
| `src/components/beta/BetaFeedbackForm.tsx` | Soporte para imagenes |
| `src/components/beta/BetaTesterPanel.tsx` | Agregar historial de feedback |
| `src/components/beta/BetaManagement.tsx` | Filtros, workflow completo, imagenes |
| `src/pages/AppDetail.tsx` | Cabecera compacta, layout mejorado |
| `supabase/functions/submit-beta-feedback/index.ts` | Soporte attachments |
| `src/i18n/es/beta.json` | Nuevas traducciones |
| `src/i18n/en/beta.json` | Nuevas traducciones |

---

## Migraciones SQL

### Migration 1: Ampliar beta_feedback

```sql
-- Agregar columnas de workflow
ALTER TABLE beta_feedback ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open';
ALTER TABLE beta_feedback ADD COLUMN IF NOT EXISTS resolved_by_owner BOOLEAN DEFAULT FALSE;
ALTER TABLE beta_feedback ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE beta_feedback ADD COLUMN IF NOT EXISTS tester_response TEXT;
ALTER TABLE beta_feedback ADD COLUMN IF NOT EXISTS tester_response_at TIMESTAMPTZ;

-- Constraint para valores validos
ALTER TABLE beta_feedback ADD CONSTRAINT beta_feedback_status_check 
  CHECK (status IN ('open', 'in_review', 'closed'));
ALTER TABLE beta_feedback ADD CONSTRAINT beta_feedback_tester_response_check 
  CHECK (tester_response IS NULL OR tester_response IN ('confirmed', 'reopened'));
```

### Migration 2: Tabla de attachments

```sql
CREATE TABLE IF NOT EXISTS beta_feedback_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES beta_feedback(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE beta_feedback_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testers can insert own attachments"
  ON beta_feedback_attachments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM beta_feedback
    WHERE beta_feedback.id = beta_feedback_attachments.feedback_id
    AND beta_feedback.tester_id = auth.uid()
  ));

CREATE POLICY "View own or owned app attachments"
  ON beta_feedback_attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM beta_feedback bf
    JOIN apps ON apps.id = bf.app_id
    WHERE bf.id = beta_feedback_attachments.feedback_id
    AND (bf.tester_id = auth.uid() OR apps.user_id = auth.uid())
  ));
```

---

## Nuevas Traducciones (ES)

```json
{
  "confirmJoinTitle": "Unirte al Beta Squad",
  "confirmJoinMessage": "¿Confirmas que quieres unirte como tester de {appName}?",
  "confirmJoinButton": "Confirmar y enviar solicitud",
  "statusPending": "Solicitud pendiente",
  "statusAccepted": "Tester aceptado",
  "statusRejected": "Solicitud rechazada",
  
  "feedbackOpen": "Abierto",
  "feedbackInReview": "Pendiente verificar",
  "feedbackClosed": "Cerrado",
  
  "markResolved": "Marcar como resuelto",
  "closeReport": "Cerrar reporte",
  "deleteReport": "Eliminar reporte",
  
  "verifyResolution": "¿Se solucionó el problema?",
  "confirmFixed": "Sí, está solucionado",
  "stillBroken": "No, sigue ocurriendo",
  
  "attachImages": "Adjuntar imágenes",
  "maxImages": "Máximo 10 imágenes",
  "uploadingImages": "Subiendo imágenes...",
  
  "myReports": "Mis reportes",
  "sentAt": "Enviado",
  "noReportsYet": "Aún no has enviado reportes",
  
  "filterAll": "Todos",
  "filterOpen": "Abiertos",
  "filterInReview": "En revisión",
  "filterClosed": "Cerrados"
}
```

---

## Orden de Implementacion

1. **Base de datos**: Migrations para nuevas columnas y tabla de attachments
2. **Edge Function**: Actualizar submit-beta-feedback para attachments
3. **Hook useBetaSquadsPublic**: Agregar user_tester_status
4. **JoinConfirmDialog**: Popup de confirmacion
5. **BetaSquadFeedCard**: Integracion estado dinamico
6. **BetaFeedbackImageUploader**: Componente upload imagenes
7. **BetaFeedbackForm**: Integrar uploader de imagenes
8. **TesterFeedbackHistory**: Vista de reportes del tester
9. **FeedbackActionMenu**: Menu 3 puntos owner
10. **FeedbackStatusBadge**: Badge estados
11. **TesterFeedbackResponseDialog**: Dialog verificacion tester
12. **BetaManagement**: Filtros y workflow completo
13. **AppDetail**: Cabecera compacta + layout
14. **Traducciones**: ES y EN
15. **Testing E2E**: Flujo completo mobile y desktop

---

## Notas Tecnicas

### Upload de Imagenes
- Usar bucket existente `feedback-attachments`
- Generar UUID para nombre unico
- Validar tipo MIME (solo imagenes)
- Comprimir si es necesario (max 2MB recomendado)

### Performance
- Lazy load de imagenes en historial
- Paginacion en lista de feedback
- Optimistic updates para cambios de estado

### UX Mobile
- Sheet en lugar de Dialog para mobile
- Swipe actions en listas si es posible
- Feedback tactil (haptic) en confirmaciones

