

## Plan: Mover "Manage Beta" a una Pestaña Independiente

### Resumen

Se creara una nueva pestaña "Beta Squad" en el dashboard de usuario (/me), junto a las pestañas existentes de Profile, Apps y Branding. Esta pestaña tendra un selector de apps y mostrara el panel de gestion completo de beta testing.

---

## 1. Cambios en Navegacion y Rutas

### 1.1 Actualizar `src/App.tsx`

Agregar nueva ruta:
```
<Route path="/me/beta" element={<Me />} />
```

### 1.2 Actualizar `src/components/me/MeTabs.tsx`

- Importar icono `FlaskConical` de Lucide React
- Agregar cuarta pestaña al array de tabs:
  ```typescript
  { id: 'beta', label: t.tabs.beta, icon: FlaskConical, path: '/me/beta' }
  ```
- Orden final: Profile | Apps | Branding | Beta Squad

### 1.3 Ajuste Responsivo en MeTabs

Modificar el contenedor para soportar scroll horizontal en movil:
```tsx
<div className="flex overflow-x-auto gap-1 p-1.5 bg-slate-100/80 rounded-full scrollbar-hide">
```
- Agregar `scrollbar-hide` o estilos CSS para ocultar scrollbar
- Usar `flex-shrink-0` en cada boton para evitar compresion

---

## 2. Nuevo Componente: BetaTab

### 2.1 Crear `src/components/me/BetaTab.tsx`

Componente que recibe el hook de apps y maneja la logica de seleccion:

**Props:**
```typescript
interface BetaTabProps {
  appsHook: ReturnType<typeof useApps>;
}
```

**Estados:**
- `selectedAppId`: App actualmente seleccionada para gestionar
- Estado derivado de las apps del usuario

**Estructura UI:**

1. **Estado Vacio (sin apps):**
   - Icono ilustrativo (FlaskConical grande)
   - Mensaje: "Primero registra una App para reclutar testers"
   - Boton: "Ir a Mis Apps" (navega a /me/apps)

2. **Estado Normal (con apps):**
   - Selector (Dropdown) con lista de apps del usuario
   - Mostrar logo y nombre de cada app
   - Al seleccionar, renderizar `BetaManagement` con la config de esa app

---

## 3. Modificar Componentes Existentes

### 3.1 Actualizar `src/pages/Me.tsx`

- Importar el nuevo `BetaTab`
- Actualizar `getActiveTab()` para reconocer `/me/beta`
- Agregar renderizado condicional:
  ```tsx
  {activeTab === 'beta' && (
    <BetaTab appsHook={appsHook} />
  )}
  ```

### 3.2 Actualizar `src/components/me/AppEditor.tsx`

- **Eliminar** la importacion y uso de `BetaManagement`
- **Eliminar** el `<Separator />` y `<BetaManagement ... />` (lineas 303-321)
- La gestion beta se hara exclusivamente desde la nueva pestaña

---

## 4. Traducciones i18n

### 4.1 Actualizar `src/i18n/es/profile.json`

Agregar en `tabs`:
```json
{
  "tabs": {
    "profile": "Perfil",
    "apps": "Apps",
    "branding": "Branding",
    "beta": "Beta Squad"
  }
}
```

### 4.2 Actualizar `src/i18n/en/profile.json`

```json
{
  "tabs": {
    "profile": "Profile",
    "apps": "Apps",
    "branding": "Branding",
    "beta": "Beta Squad"
  }
}
```

### 4.3 Agregar traducciones adicionales para estado vacio

En `src/i18n/es/beta.json`:
```json
{
  "noAppsTitle": "Sin apps registradas",
  "noAppsMessage": "Primero registra una App para reclutar testers",
  "goToApps": "Ir a Mis Apps",
  "selectApp": "Selecciona una app"
}
```

En `src/i18n/en/beta.json`:
```json
{
  "noAppsTitle": "No apps registered",
  "noAppsMessage": "Register an App first to recruit testers",
  "goToApps": "Go to My Apps",
  "selectApp": "Select an app"
}
```

---

## 5. Detalles Tecnicos

### 5.1 Componente BetaTab - Estructura Detallada

```tsx
// Estado inicial: primera app seleccionada o null
const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

// Efecto para seleccionar primera app por defecto
useEffect(() => {
  if (apps.length > 0 && !selectedAppId) {
    setSelectedAppId(apps[0].id);
  }
}, [apps]);

// App seleccionada
const selectedApp = apps.find(app => app.id === selectedAppId);
```

### 5.2 Selector de Apps (UI)

- Usar componente `Select` existente de shadcn/ui
- Mostrar logo + nombre de cada app
- Placeholder: "Selecciona una app"
- Fondo solido con z-index alto para evitar transparencia

### 5.3 Persistencia de Cambios

Reutilizar el hook `useApps` para guardar cambios:
```tsx
const handleConfigChange = (updates: Partial<AppData>) => {
  if (selectedAppId) {
    appsHook.updateApp(selectedAppId, updates);
  }
};
```

---

## 6. Archivos a Crear

| Archivo | Descripcion |
|---------|-------------|
| `src/components/me/BetaTab.tsx` | Nueva pestaña con selector de apps y panel de gestion |

## 7. Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/App.tsx` | Agregar ruta `/me/beta` |
| `src/components/me/MeTabs.tsx` | Agregar pestaña Beta Squad + scroll horizontal |
| `src/pages/Me.tsx` | Importar y renderizar BetaTab |
| `src/components/me/AppEditor.tsx` | Eliminar seccion BetaManagement |
| `src/i18n/es/profile.json` | Agregar traduccion `tabs.beta` |
| `src/i18n/en/profile.json` | Agregar traduccion `tabs.beta` |
| `src/i18n/es/beta.json` | Agregar traducciones estado vacio |
| `src/i18n/en/beta.json` | Agregar traducciones estado vacio |

---

## 8. Orden de Implementacion

1. Actualizar traducciones en ambos idiomas
2. Crear componente `BetaTab.tsx`
3. Modificar `MeTabs.tsx` para agregar pestaña + scroll
4. Agregar ruta en `App.tsx`
5. Actualizar `Me.tsx` para renderizar BetaTab
6. Eliminar BetaManagement de `AppEditor.tsx`
7. Probar flujo completo en desktop y movil

