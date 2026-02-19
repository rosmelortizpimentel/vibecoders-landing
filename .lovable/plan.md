

## Mejoras en Toolbar de Roadmap y Feedback + Settings de Pagina Publica

### Resumen

Se reorganizan los controles de visibilidad y configuracion del Roadmap y Feedback en el Hub de la app, y se agrega un sistema de Settings para la pagina publica que permite configurar el modo de autenticacion de los visitantes (anonimo o logueado) y el idioma.

---

### Cambios detallados (6 bloques)

---

### 1. Toolbar del tab Feedback: switch publico/privado + link

En `MyAppHub.tsx`, agregar un toolbar similar al del tab Roadmap cuando `activeTab === 'feedback'`. Incluira:
- Boton "Settings" (icono Settings/Cog) que abre la nueva configuracion
- Switch Publico/Privado para `is_feedback_public`
- Link "Ver publico" si feedback esta activo y publico (ruta `/@username/app-slug/feedback`)

Requiere que `MyAppHub` tenga acceso a `roadmap.settings` y `roadmap.updateSettings`, lo cual ya tiene.

---

### 2. Quitar switches de visibilidad del sidebar Branding

En `RoadmapEditor.tsx`, eliminar los dos bloques de switches (Publico y Feedback Publico) del Sheet de Branding (lineas 764-791). Solo queda la seccion de branding (titulo, fuente, favicon, colores de columnas). Tambien quitar `is_public` y `is_feedback_public` del `settingsForm` y de `handleSaveSettings`.

---

### 3. Toolbar del tab Roadmap: agregar boton Settings

En `MyAppHub.tsx`, reemplazar el boton "Branding" existente en el toolbar de Roadmap por dos botones:
- **Branding** (icono Paintbrush) - ya existe
- **Settings** (icono Settings) - abre el popup de settings

El toolbar mostrara al inicio los switches:
- Switch Roadmap Publico
- Switch Feedback Publico (si se activa, mostrar selector anonimo/logueado inline)

Luego los botones Branding, Settings, y Ver Publico.

---

### 4. Popup de Settings (nuevo componente)

Crear un popup/dialog con las siguientes opciones:

**Seccion: Modo de Participacion**
- Radio/Select: "Usuarios anonimos" o "Usuarios logueados"
  - Anonimo: internamente usa device fingerprint (ya implementado) para evitar spam
  - Logueado: requiere login con Google o LinkedIn antes de poder enviar feedback o votar

**Seccion: Idioma por defecto**
- Selector de idioma (ES, EN, FR, PT) - por defecto el idioma del usuario actual

Esto requiere nuevas columnas en `roadmap_settings`:
- `feedback_auth_mode` (text, default 'anonymous') - valores: 'anonymous' | 'authenticated'
- `default_language` (text, default null) - valores: 'es' | 'en' | 'fr' | 'pt'

---

### 5. Pagina Publica: Soporte para login obligatorio

En `PublicRoadmap.tsx`:
- Si `feedback_auth_mode === 'authenticated'`, mostrar boton de login (Google/LinkedIn) antes de permitir enviar feedback o votar
- Usar Supabase Auth con redirect de vuelta a la misma URL publica
- Si el usuario ya esta logueado, permitir enviar feedback normalmente
- El login usa `supabase.auth.signInWithOAuth` con `redirectTo` apuntando a la URL actual

Asegurar que la pagina de feedback sea 100% responsive (ya lo es en gran medida, pero verificar y mejorar el formulario en mobile).

---

### 6. Migracion de base de datos

Agregar nuevas columnas a `roadmap_settings`:

```sql
ALTER TABLE roadmap_settings 
ADD COLUMN IF NOT EXISTS feedback_auth_mode text NOT NULL DEFAULT 'anonymous',
ADD COLUMN IF NOT EXISTS default_language text DEFAULT NULL;
```

---

### Archivos a modificar

| Archivo | Cambios |
|---------|---------|
| `src/pages/MyAppHub.tsx` | Toolbar unificado con switches al inicio, botones Branding/Settings/Ver Publico. Toolbar para feedback con switch y link |
| `src/pages/RoadmapEditor.tsx` | Quitar switches del sidebar Branding. Agregar listener para evento settings. Actualizar settingsForm |
| `src/pages/PublicRoadmap.tsx` | Soporte auth mode, login con Google/LinkedIn, responsive feedback, idioma por defecto |
| `src/hooks/useRoadmap.ts` | Agregar `feedback_auth_mode` y `default_language` a interfaz RoadmapSettings |
| `supabase/migrations/` | Nueva migracion para columnas feedback_auth_mode y default_language |
| `src/i18n/en/roadmap.json` | Nuevas claves para settings |
| `src/i18n/es/roadmap.json` | Nuevas claves para settings |
| `src/i18n/fr/roadmap.json` | Nuevas claves para settings |
| `src/i18n/pt/roadmap.json` | Nuevas claves para settings |

---

### Detalle tecnico: Toolbar unificado en MyAppHub

```text
+----------------------------------------------------------+
| [Branding] [Settings]     [Switch Roadmap] [Switch FB]   |
|                           [Ver Publico]                  |
+----------------------------------------------------------+
```

El toolbar se muestra tanto en el tab Roadmap como en Feedback (con variaciones contextuales).

### Detalle tecnico: Settings Popup

```text
+----------------------------------+
| Settings                    [X]  |
|                                  |
| MODO DE PARTICIPACION            |
| ( ) Usuarios anonimos           |
| ( ) Usuarios logueados          |
|     (Google / LinkedIn)          |
|                                  |
| IDIOMA POR DEFECTO              |
| [Espanol v]                     |
|                                  |
| [Cancelar]  [Guardar]           |
+----------------------------------+
```

### Detalle tecnico: Login en pagina publica

Cuando `feedback_auth_mode === 'authenticated'`:
- El boton "Enviar sugerencia" muestra un dialogo de login si el usuario no esta autenticado
- Opciones: "Continuar con Google" / "Continuar con LinkedIn"
- `redirectTo` usa `window.location.href` para volver a la misma pagina
- Una vez logueado, se auto-rellena el nombre y email del usuario

