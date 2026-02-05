

## Plan: Internacionalización Completa (Español/Inglés)

### Resumen

Implementar un sistema de internacionalización (i18n) completo que permita a toda la aplicación mostrarse en español o inglés, con las siguientes características:

- **Idioma por defecto**: Se detecta automáticamente del navegador
- **Cambio de idioma**: Switch colapsable en el menú del header
- **Persistencia**: La preferencia se guarda en la base de datos (tabla `profiles`)
- **Estructura modular**: Archivos JSON separados por sección para facilitar mantenimiento

---

### Arquitectura del Sistema i18n

```text
src/
└── i18n/
    ├── es/                    # Español (ya existe parcialmente)
    │   ├── common.json        # Navbar, footer, botones genéricos
    │   ├── hero.json          # Sección hero landing
    │   ├── features.json      # Grid de características
    │   ├── waitlist.json      # Modales de waitlist
    │   ├── legal.json         # Privacy/Terms
    │   ├── auth.json          # Textos de autenticación
    │   ├── profile.json       # Página /me (perfil editor)
    │   ├── apps.json          # Tab de apps
    │   ├── branding.json      # Tab de branding
    │   ├── home.json          # Página /home
    │   ├── projects.json      # Página /startups
    │   ├── tools.json         # Página /tools
    │   ├── buildlog.json      # Página /buildlog
    │   ├── publicProfile.json # Perfil público
    │   ├── followers.json     # Lista de seguidores
    │   ├── onboarding.json    # Builder onboarding
    │   ├── errors.json        # Mensajes de error
    │   └── admin.json         # Panel de administración
    └── en/                    # Inglés (nuevos archivos)
        └── (mismos archivos que es/)
```

---

### Componentes del Sistema

#### 1. LanguageContext (Nuevo)
- Provider global que maneja el idioma actual
- Detecta idioma del navegador al iniciar
- Sincroniza con la base de datos para usuarios autenticados
- Expone: `language`, `setLanguage`, `isLoading`

#### 2. useTranslation Hook (Actualizar)
- Consumir el contexto de idioma
- Cargar dinámicamente las traducciones según idioma
- Mantener tipado TypeScript para autocompletado

#### 3. LanguageSwitcher (Nuevo)
- Componente de toggle ES/EN
- Diseño: dos banderas o códigos de idioma (ES | EN)
- Integrado en AuthenticatedHeader y PublicProfileHeader

---

### Cambio en Base de Datos

Agregar columna `language` a la tabla `profiles`:

```sql
ALTER TABLE profiles 
ADD COLUMN language TEXT DEFAULT 'es' 
CHECK (language IN ('es', 'en'));
```

---

### Sección Técnica: Archivos a Crear/Modificar

#### Archivos Nuevos (Estructura i18n)

| Archivo | Propósito |
|---------|-----------|
| `src/i18n/en/*.json` | 16 archivos de traducción en inglés |
| `src/i18n/es/auth.json` | Textos de autenticación |
| `src/i18n/es/profile.json` | Editor de perfil |
| `src/i18n/es/apps.json` | Tab de apps |
| `src/i18n/es/branding.json` | Tab de branding |
| `src/i18n/es/home.json` | Página home |
| `src/i18n/es/projects.json` | Página startups |
| `src/i18n/es/tools.json` | Página tools |
| `src/i18n/es/buildlog.json` | Build Log |
| `src/i18n/es/publicProfile.json` | Perfil público |
| `src/i18n/es/followers.json` | Seguidores |
| `src/i18n/es/onboarding.json` | Onboarding |
| `src/i18n/es/errors.json` | Errores |
| `src/i18n/es/admin.json` | Admin panel |
| `src/contexts/LanguageContext.tsx` | Contexto global de idioma |
| `src/components/LanguageSwitcher.tsx` | Toggle de idioma |

#### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useTranslation.ts` | Refactor para usar contexto + ambos idiomas |
| `src/hooks/useProfileEditor.ts` | Agregar campo `language` |
| `src/App.tsx` | Envolver con LanguageProvider |
| `src/components/AuthenticatedHeader.tsx` | Agregar LanguageSwitcher en menú |
| `src/components/PublicProfileHeader.tsx` | Agregar LanguageSwitcher |
| `src/components/HeroSection.tsx` | Usar traducciones para textos hardcoded |
| `src/components/BentoGrid.tsx` | Usar traducciones |
| `src/components/Footer.tsx` | Usar traducciones |
| `src/pages/Index.tsx` | Usar traducciones |
| `src/pages/Home.tsx` | Usar traducciones |
| `src/pages/Me.tsx` | Usar traducciones |
| `src/pages/Tools.tsx` | Usar traducciones |
| `src/pages/Projects.tsx` | Usar traducciones |
| `src/pages/BuildLog.tsx` | Usar traducciones |
| `src/pages/NotFound.tsx` | Usar traducciones |
| `src/components/me/*.tsx` | Usar traducciones (ProfileTab, AppsTab, BrandingTab, etc.) |
| `src/components/PublicProfileCard.tsx` | Usar traducciones |
| `src/components/FollowButton.tsx` | Usar traducciones |
| `src/components/home/BuilderOnboarding.tsx` | Usar traducciones |
| `src/hooks/useProfileCompletion.ts` | Labels traducidos dinámicamente |
| Todos los componentes admin | Usar traducciones |

---

### Flujo de Detección de Idioma

1. **Usuario no autenticado**: 
   - Detectar `navigator.language` 
   - Si es `es*` → español, sino → inglés
   - Guardar en localStorage como fallback

2. **Usuario autenticado**:
   - Leer preferencia de `profiles.language`
   - Si no existe, aplicar detección del navegador y guardar

3. **Cambio manual**:
   - Actualizar contexto inmediatamente
   - Si autenticado, persistir en base de datos
   - Si no autenticado, guardar en localStorage

---

### Diseño del Language Switcher

Ubicación: Dentro del menú desplegable del usuario (AuthenticatedHeader)

```text
┌─────────────────────────┐
│ 👤 Rosmel O.            │
│ @rosmelortiz            │
├─────────────────────────┤
│ 🌐 Idioma: ES ▼        │  ← Collapsible
│   ├─ 🇪🇸 Español       │
│   └─ 🇺🇸 English       │
├─────────────────────────┤
│ Ver Perfil Público      │
│ Cerrar Sesión           │
└─────────────────────────┘
```

Para usuarios no autenticados: Switch visible en el header público (ícono de globo).

---

### Orden de Implementación

1. **Migración DB**: Agregar columna `language` a `profiles`
2. **Contexto**: Crear `LanguageContext` y provider
3. **Hook**: Refactorizar `useTranslation` 
4. **Archivos ES**: Completar traducciones faltantes en español
5. **Archivos EN**: Crear todas las traducciones en inglés
6. **Componente Switcher**: Crear `LanguageSwitcher`
7. **Headers**: Integrar switcher en headers
8. **Páginas públicas**: Aplicar traducciones (Index, Home, Privacy, Terms)
9. **Páginas autenticadas**: Aplicar traducciones (/me, /startups, /tools, /buildlog)
10. **Componentes compartidos**: Footer, modales, botones
11. **Admin**: Traducir panel de administración
12. **Testing**: Verificar todos los flujos en ambos idiomas

---

### Ejemplo de Archivo de Traducción

**`src/i18n/en/profile.json`**:
```json
{
  "tabs": {
    "profile": "Profile",
    "apps": "Apps",
    "branding": "Branding"
  },
  "fields": {
    "name": "Name",
    "tagline": "Tagline",
    "location": "Location",
    "website": "Website",
    "socialNetworks": "Social Networks"
  },
  "placeholders": {
    "name": "Your full name",
    "tagline": "A phrase that defines you",
    "location": "City, Country",
    "website": "https://yourwebsite.com"
  },
  "labels": {
    "banner": "Banner",
    "suggestedRatio": "Suggested Ratio 4:1 (1584×396px)",
    "addBanner": "Add banner",
    "showBadge": "Show badge"
  }
}
```

---

### Consideraciones Especiales

- **Build Log**: Contenido extenso en español. Se traducirá el contenido estático pero manteniendo el tono informal.
- **Legal (Privacy/Terms)**: Ya estructurados en JSON, se duplicará para inglés.
- **Admin Panel**: Baja prioridad pero incluido para completitud.
- **Textos dinámicos**: Categorías, estados de apps, etc. vienen de la BD y no se traducen (se mantienen en español).

