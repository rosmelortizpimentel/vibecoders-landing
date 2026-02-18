

## Refactoring: "Un Objeto, Un Lugar" -- Reestructuracion del Menu y Navegacion

### Resumen

Consolidar la navegacion para que cada concepto viva en un solo lugar. Las apps pasan a tener su propio "hub" con tabs internos (Info, Roadmap, Feedback, Squad). Mi Perfil queda con solo Datos y Branding. Se eliminan entradas redundantes del menu.

---

### Menu Final del Sidebar

| Orden | Icono | Clave | Ruta | Seccion |
|-------|-------|-------|------|---------|
| 1 | LayoutDashboard | home | /home | personal |
| 2 | Bell | notifications | /notifications | personal |
| 3 | User | my-profile | /me | maker |
| 4 | Layers | my-apps | /my-apps | maker |
| 5 | Lightbulb | ideas | /ideas | maker |
| 6 | Users | connections | /connections | community |
| 7 | MessageSquare | feedback | /feedback | community |

Desaparecen: Roadmap (/roadmap), Beta Testing (/beta-testing), App for Testing (/public-beta-testing), Explore, Tools, BuildLog, Prompts.

---

### Cambio 1: Base de Datos -- Menu Items

**Migracion SQL:**
- UPDATE las filas existentes para reflejar el nuevo menu
- Desactivar (is_active = false) los items que desaparecen: roadmap, beta-testing, public-beta-testing
- Agregar nuevo item "my-apps" con path=/my-apps, icon=Layers, section=maker
- Actualizar secciones: "personal" para home/notifications, "maker" para profile/apps/ideas, "community" para connections/feedback
- Reordenar display_order

---

### Cambio 2: Nueva Ruta /my-apps y Hub de App

**Nueva pagina `src/pages/MyApps.tsx`:**
- Listado de apps del usuario (reutiliza logica de AppsTab actual)
- Al hacer click en una app, navega a `/my-apps/:appId`

**Nueva pagina `src/pages/MyAppHub.tsx`:**
- Header con logo, nombre, status, boton "Ver pagina"
- 4 tabs internos con pills: Info | Roadmap | Feedback | Squad
- Rutas: `/my-apps/:appId`, `/my-apps/:appId/roadmap`, `/my-apps/:appId/feedback`, `/my-apps/:appId/squad`

**Tab Info:**
- Reutiliza todo el contenido actual de AppEditor (nombre, URL, tagline, descripcion, categoria, tags, tech stack, screenshots, verificacion, horas)
- Sin perder ningun campo

**Tab Roadmap:**
- Reutiliza el componente RoadmapEditor actual integro
- Solo se muestra si la app esta verificada (igual que hoy)

**Tab Feedback (UNIFICADO):**
- Combina feedback publico del roadmap + feedback de beta testers
- Cada item tiene un tag visible: "Publico", "Beta", "Bug"
- Filtros por tipo
- Reutiliza los componentes existentes de feedback

**Tab Squad:**
- Reutiliza BetaManagement actual (testers, toggle beta activo, configuracion de acceso)

---

### Cambio 3: Mi Perfil Simplificado

**`/me/profile` y `/me/branding` se mantienen**, pero se elimina el tab "Mis Apps".

**MeTabs.tsx:** Solo 2 tabs -- Datos (User) | Branding (Palette)

**Me.tsx:** Se elimina el caso `activeTab === 'apps'` y la importacion de AppsTab.

---

### Cambio 4: Actualizacion de Rutas (App.tsx)

```text
Nuevas rutas dentro de DashboardLayout:
  /my-apps              -> MyApps (listado)
  /my-apps/:appId       -> MyAppHub (tab Info por defecto)
  /my-apps/:appId/roadmap  -> MyAppHub (tab Roadmap)
  /my-apps/:appId/feedback -> MyAppHub (tab Feedback)
  /my-apps/:appId/squad    -> MyAppHub (tab Squad)

Rutas que se mantienen (legacy redirects):
  /me/apps         -> Redirect a /my-apps
  /roadmap         -> Redirect a /my-apps (o /home)
  /beta-testing    -> Redirect a /my-apps
  /beta-testing/:id -> Redirect a /my-apps/:id/squad

Rutas que se mantienen sin cambios:
  /me/profile, /me/branding, /ideas, /connections, /feedback
  /roadmap-editor/:appId -> Redirect a /my-apps/:appId/roadmap
```

---

### Cambio 5: Traducciones (4 idiomas)

Agregar claves en `common.json` de es/en/fr/pt:
- `navigation.myApps`: "Mis Apps" / "My Apps" / "Mes Apps" / "Meus Apps"

Agregar claves en `apps.json` de es/en/fr/pt:
- `hub.info`, `hub.roadmap`, `hub.feedback`, `hub.squad`
- `hub.backToApps`

---

### Cambio 6: MenuRouteGuard

Actualizar para que las nuevas rutas `/my-apps` y sub-rutas esten protegidas por el item "my-apps" del menu.

---

### Archivos a Crear

| Archivo | Descripcion |
|---------|-------------|
| `src/pages/MyApps.tsx` | Listado de apps del usuario |
| `src/pages/MyAppHub.tsx` | Hub de app con 4 tabs |
| Migracion SQL | Actualizar sidebar_menu_items |

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/App.tsx` | Nuevas rutas + redirects legacy |
| `src/components/me/MeTabs.tsx` | Eliminar tab "Apps" (solo Datos + Branding) |
| `src/pages/Me.tsx` | Eliminar caso apps tab |
| `src/i18n/*/common.json` | Nueva clave navigation.myApps |
| `src/i18n/*/apps.json` | Claves del hub |
| `src/hooks/useSidebarMenu.ts` | Agregar icono Layers al mapa |

### Archivos que NO se tocan (se reutilizan)

- `AppEditor.tsx` -- se usa integro en tab Info
- `RoadmapEditor.tsx` -- se usa integro en tab Roadmap
- `BetaManagement.tsx` -- se usa integro en tab Squad
- `ProfileTab.tsx`, `BrandingTab.tsx` -- se mantienen iguales
- Todos los hooks existentes (useApps, useRoadmap, useBetaSquad, etc.)

---

### Detalles Tecnicos

**MyAppHub.tsx -- Estructura de tabs:**
```text
/my-apps/:appId         -> Tab Info (default)
/my-apps/:appId/roadmap -> Tab Roadmap
/my-apps/:appId/feedback -> Tab Feedback
/my-apps/:appId/squad   -> Tab Squad
```

Cada tab se activa con base en la URL (useLocation). Los tabs se renderizan como pills responsivas similares a MeTabs.

**Tab Feedback unificado:**
- Combina datos de `roadmap_feedback` (publico) + `beta_feedback` (beta/bugs)
- Un nuevo componente `UnifiedFeedbackList` que consulta ambas tablas
- Tag visual: badge de color diferente segun origen (Publico=azul, Beta=verde, Bug=rojo)
- Filtro por tipo en la parte superior

**Responsive:**
- MyApps listado: grid de cards en desktop, lista vertical en movil
- MyAppHub: tabs con scroll horizontal en movil, header compacto
- Todos los sub-tabs (Info, Roadmap, etc.) mantienen su responsive actual

