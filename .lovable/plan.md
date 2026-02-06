
## Plan: Sistema "Beta Squads" para Apps

### Resumen Ejecutivo

Implementar un sistema completo de reclutamiento de testers beta para las apps existentes, permitiendo a los dueños configurar campañas, recibir feedback estructurado, y premiar a los participantes con badges visibles en sus perfiles.

---

## 1. Arquitectura de Base de Datos

### 1.1 Modificaciones a tabla `apps`

Agregar las siguientes columnas para configurar la campaña beta:

| Columna | Tipo | Default | Descripcion |
|---------|------|---------|-------------|
| `beta_active` | boolean | false | Indica si la campaña está activa |
| `beta_mode` | text | 'open' | Modo: 'open' (auto-acepta) o 'closed' (requiere aprobacion) |
| `beta_limit` | integer | 10 | Cantidad maxima de testers |
| `beta_link` | text | null | URL secreta (TestFlight, Staging, etc.) |
| `beta_instructions` | text | null | Instrucciones para los testers |

### 1.2 Nueva tabla `beta_testers`

Relacion entre usuarios y apps donde participan como testers:

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `id` | uuid (PK) | Identificador unico |
| `app_id` | uuid (FK -> apps) | App a la que aplica |
| `user_id` | uuid (FK -> profiles) | Usuario que se une |
| `status` | text | 'pending', 'accepted', 'rejected' |
| `joined_at` | timestamp | Fecha de inscripcion |
| `feedback_count` | integer | Contador de reportes enviados (para ranking) |

**RLS Policies:**
- SELECT: Publico (para mostrar avatares en "Hall of Fame")
- INSERT: Solo usuarios autenticados (con user_id = auth.uid())
- UPDATE: Solo el dueno de la app (via subquery)
- DELETE: Solo el dueno de la app o el propio tester

### 1.3 Nueva tabla `beta_feedback`

Reportes enviados por los testers:

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `id` | uuid (PK) | Identificador unico |
| `app_id` | uuid (FK -> apps) | App relacionada |
| `tester_id` | uuid (FK -> profiles) | Usuario que envia |
| `type` | text | 'bug', 'ux', 'feature', 'other' |
| `content` | text | Descripcion del hallazgo |
| `rating` | integer | Puntuacion 1-5 (opcional) |
| `is_useful` | boolean | Marcado por el dueno |
| `created_at` | timestamp | Fecha de creacion |

**RLS Policies:**
- SELECT: Solo el dueno de la app o el tester que envio
- INSERT: Solo testers con status 'accepted'
- UPDATE: Solo el dueno de la app (para marcar is_useful)
- DELETE: Solo el dueno de la app

---

## 2. Nuevas Rutas y Paginas

### 2.1 Ruta: `/app/:appId`

Nueva pagina publica para ver detalles de una app especifica.

**Componente:** `src/pages/AppDetail.tsx`

**Contenido:**
- Header con logo, nombre, tagline, status
- Seccion de descripcion expandida
- Tech stack usado
- Enlace al perfil del creador
- **Card "Beta Squad"** (si `beta_active` es true)

### 2.2 Actualizacion de rutas en `App.tsx`

Agregar nueva ruta:
```
<Route path="/app/:appId" element={<AppDetail />} />
```

---

## 3. Componentes Frontend

### 3.1 Pagina de Detalle: `AppDetail.tsx`

Layout responsive con:
- Seccion hero con logo/banner
- Informacion del creador (avatar, nombre, link al perfil)
- Descripcion completa con markdown
- Grid de tech stack
- Card de Beta Squad (condicional)

### 3.2 Card de Reclutamiento: `BetaSquadCard.tsx`

Ubicada en la pagina de detalle, muestra:
- Titulo: "Beta Squad" con icono de pruebas
- Barra de progreso: "X / Y cupos"
- Boton de accion dinamico:
  - Usuario no logueado: "Inicia sesion para unirte"
  - Usuario logueado, no inscrito, cupos disponibles: "Unirme"
  - Usuario inscrito, pendiente: "Solicitud enviada" (deshabilitado)
  - Usuario aceptado: "Acceder a mision" (abre panel)
  - Cupos llenos: "Squad completo" (deshabilitado)

### 3.3 Panel del Tester: `BetaTesterPanel.tsx`

Solo visible para testers con `status === 'accepted'`:
- Titulo: "Bienvenido al Squad"
- Seccion de instrucciones (`beta_instructions`)
- Boton grande para abrir `beta_link`
- Formulario de reporte:
  - Select: Tipo (Bug, Mejora UX, Idea, Otro)
  - Textarea: Descripcion
  - Rating opcional (1-5 estrellas)
  - Boton "Enviar reporte"

### 3.4 Hall of Fame: `BetaHallOfFame.tsx`

Componente que muestra avatares de testers aceptados:
- Lista horizontal de avatares (max 8-10)
- Tooltip con nombre al hover
- Contador si hay mas: "+5 mas"

### 3.5 Badge en Perfil: Seccion "Contribuciones"

En `PublicProfileCard.tsx`, agregar seccion despues de apps:
- Titulo: "Beta Tester en..."
- Lista de apps donde el usuario es tester aceptado
- Cada item: Logo de app + Nombre + Badge "Tester"

---

## 4. Panel de Administracion del Dueno

### 4.1 Nueva pestana en `AppEditor.tsx`

Agregar seccion colapsable "Beta Testing":
- Switch: Activar/Desactivar campaña
- Select: Modo (Abierta/Cerrada)
- Input: Limite de cupos
- Input: Link secreto
- Textarea: Instrucciones

### 4.2 Componente `BetaManagement.tsx`

Gestion completa:
- Lista de solicitudes pendientes (si modo cerrado)
- Botones: Aceptar / Rechazar / Expulsar
- Inbox de feedback recibido
- Posibilidad de marcar feedback como "util"

---

## 5. Hooks y Logica

### 5.1 `useBetaSquad.ts`

Hook para gestionar la logica de beta testing:
```typescript
- fetchBetaStatus(appId) // Estado del usuario en esta app
- joinBeta(appId) // Unirse a la beta
- leaveBeta(appId) // Abandonar la beta
- submitFeedback(appId, type, content, rating?)
- getTesters(appId) // Para Hall of Fame
```

### 5.2 `useAppDetail.ts`

Hook para cargar detalle publico de una app:
```typescript
- fetchAppDetail(appId) // Info completa de la app
- owner profile info
- beta squad info (si activa)
- testers count
```

---

## 6. Edge Functions

### 6.1 `get-app-detail`

Endpoint publico para obtener detalles de una app:
- Info basica de la app
- Perfil del creador (nombre, avatar, username)
- Conteo de testers aceptados
- Estado del usuario actual (si autenticado)

### 6.2 `join-beta`

Endpoint para unirse a una beta:
- Verifica que haya cupos
- Crea registro en `beta_testers`
- Status segun modo: 'accepted' (open) o 'pending' (closed)

### 6.3 `submit-beta-feedback`

Endpoint para enviar feedback:
- Verifica que el usuario sea tester aceptado
- Crea registro en `beta_feedback`
- Incrementa `feedback_count` del tester

---

## 7. Traducciones i18n

### 7.1 Nuevo archivo: `src/i18n/es/beta.json`

```json
{
  "title": "Beta Squad",
  "joinButton": "Unirme al Squad",
  "requestSent": "Solicitud enviada",
  "accessMission": "Acceder a la mision",
  "squadFull": "Squad completo",
  "spotsRemaining": "{count} cupos disponibles",
  "welcome": "Bienvenido al Squad",
  "instructions": "Instrucciones",
  "accessLink": "Ir a probar la app",
  "reportTitle": "Reportar hallazgo",
  "reportType": "Tipo de reporte",
  "reportBug": "Bug encontrado",
  "reportUx": "Mejora de UX",
  "reportFeature": "Nueva idea",
  "reportOther": "Otro",
  "reportPlaceholder": "Describe tu hallazgo...",
  "reportSubmit": "Enviar reporte",
  "reportSuccess": "Reporte enviado correctamente",
  "hallOfFame": "Testers Oficiales",
  "contributions": "Contribuciones",
  "testerBadge": "Beta Tester",
  "manageBeta": "Gestionar Beta",
  "activateBeta": "Activar campaña beta",
  "betaMode": "Modo de inscripcion",
  "modeOpen": "Abierta",
  "modeClosed": "Cerrada",
  "limit": "Limite de testers",
  "secretLink": "Link secreto",
  "instructionsLabel": "Instrucciones",
  "pendingRequests": "Solicitudes pendientes",
  "acceptedTesters": "Testers aceptados",
  "feedbackInbox": "Feedback recibido",
  "accept": "Aceptar",
  "reject": "Rechazar",
  "remove": "Expulsar",
  "markUseful": "Marcar como util"
}
```

### 7.2 Archivo equivalente en ingles: `src/i18n/en/beta.json`

---

## 8. Archivos a Crear

| Archivo | Descripcion |
|---------|-------------|
| `src/pages/AppDetail.tsx` | Pagina de detalle de app |
| `src/components/beta/BetaSquadCard.tsx` | Card de reclutamiento |
| `src/components/beta/BetaTesterPanel.tsx` | Panel del tester |
| `src/components/beta/BetaHallOfFame.tsx` | Avatares de testers |
| `src/components/beta/BetaFeedbackForm.tsx` | Formulario de reporte |
| `src/components/beta/BetaManagement.tsx` | Panel de gestion del dueno |
| `src/hooks/useBetaSquad.ts` | Hook principal |
| `src/hooks/useAppDetail.ts` | Hook para detalle de app |
| `supabase/functions/get-app-detail/index.ts` | Edge function |
| `supabase/functions/join-beta/index.ts` | Edge function |
| `supabase/functions/submit-beta-feedback/index.ts` | Edge function |
| `src/i18n/es/beta.json` | Traducciones espanol |
| `src/i18n/en/beta.json` | Traducciones ingles |

## 9. Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/App.tsx` | Agregar ruta /app/:appId |
| `src/components/me/AppEditor.tsx` | Agregar seccion Beta Testing |
| `src/components/PublicProfileCard.tsx` | Agregar seccion Contribuciones (badges de tester) |
| `src/hooks/useApps.ts` | Extender AppData con campos beta |
| `src/hooks/useTranslation.ts` | Agregar seccion 'beta' |
| `src/integrations/supabase/types.ts` | Se actualiza automaticamente |
| `supabase/config.toml` | Agregar nuevas edge functions |

---

## 10. Migracion de Base de Datos

Una sola migracion SQL que:
1. Agrega columnas beta_* a tabla apps
2. Crea tabla beta_testers con constraints
3. Crea tabla beta_feedback con constraints
4. Configura todas las RLS policies

---

## 11. Orden de Implementacion

1. **Migracion DB**: Crear tablas y columnas
2. **Edge Functions**: get-app-detail, join-beta, submit-beta-feedback
3. **Hooks**: useBetaSquad, useAppDetail
4. **Traducciones**: Archivos beta.json
5. **Pagina AppDetail**: Layout basico con info de app
6. **Componentes Beta**: Card, Panel, HallOfFame, Form
7. **Integracion en AppEditor**: Panel de gestion del dueno
8. **Badges en perfil**: Seccion Contribuciones
9. **Testing**: Flujo completo end-to-end
