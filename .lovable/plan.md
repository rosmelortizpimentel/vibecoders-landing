

# Plan: Popup "Vibe Coder Pro" Upsell + Prueba con usuario free

## Resumen
Crear un componente popup reutilizable con estilo premium (negro/gris/dorado) que se muestre cuando un usuario free intenta usar una funcionalidad Pro. Incluye traducciones en 4 idiomas, y como caso de prueba, se activa al intentar agregar una segunda app.

---

## Cambios a realizar

### 1. Cambiar tier de luciana.om28@gmail.com a "free"
- Ejecutar SQL: `UPDATE user_subscriptions SET tier = 'free', founder_number = NULL WHERE user_id = 'c8fd62b0-821e-4472-9c7c-5f6de17a398f'`

### 2. Crear archivo de traducciones `pro.json` (4 idiomas)
- **Archivos**: `src/i18n/es/pro.json`, `src/i18n/en/pro.json`, `src/i18n/fr/pro.json`, `src/i18n/pt/pro.json`
- Contenido: titulo "Vibe Coder Pro", subtitulo invitando a desbloquear, lista de 6 beneficios (titulo + descripcion cada uno), precio "$24/year", texto del boton "Quiero ser Pro", y texto de cierre/cerrar.

**Beneficios:**
1. Publica Apps Ilimitadas
2. Activa Boton de Servicios y 'Book Call'
3. Publica en Squads de Testing sin requisitos
4. Gestiona el Roadmap de tus Apps
5. Boveda Privada de Recursos
6. Insignia de 'Verified Builder'

### 3. Registrar `pro` en `useTranslation.ts`
- Importar `pro.json` en los 4 idiomas y agregarlo al objeto `translations`.

### 4. Crear componente `src/components/pro/ProUpgradeModal.tsx`
- **Props**: `open: boolean`, `onOpenChange: (open: boolean) => void`
- Usa `Dialog` de Radix (responsive, en mobile usa `Drawer` de vaul o simplemente DialogContent con scroll)
- **Estilo visual** (referencia imagen): fondo oscuro (#0a0a0a / #1a1a1a), textos blancos/grises, acentos dorados (#c9a44c) para checks y badge "PRO"
- **Estructura**:
  - Badge superior "PRO" con borde dorado
  - Titulo: "Vibe Coder Pro"
  - Subtitulo: invitacion a desbloquear
  - Lista de 6 beneficios con icono Check en dorado, titulo en bold, descripcion en gris
  - Precio: "$24/ano"
  - Boton CTA "Quiero ser Pro" que invoca `createCheckout` de `useSubscription` y redirige a Stripe
  - Sin emojis

### 5. Modificar `AppsTab.tsx` para mostrar el popup
- Importar `useSubscription` para obtener `tier` y `createCheckout`
- En `handleCreate` (o al hacer click en el boton de agregar), antes de abrir el input de URL, verificar:
  - Si `tier === 'free'` y `apps.length >= 1` --> mostrar `ProUpgradeModal` en lugar de abrir el formulario
- Agregar state `showProModal` para controlar la visibilidad

---

## Detalles tecnicos

### Estructura del componente ProUpgradeModal

```text
+----------------------------------+
|  [PRO badge dorado]              |
|                                  |
|  Vibe Coder Pro                  |
|  Desbloquea todo el potencial... |
|                                  |
|  [check] Apps Ilimitadas         |
|          Descripcion...          |
|  [check] Book Call               |
|          Descripcion...          |
|  [check] Testing sin requisitos  |
|          Descripcion...          |
|  [check] Roadmap                 |
|          Descripcion...          |
|  [check] Boveda Privada          |
|          Descripcion...          |
|  [check] Verified Builder        |
|          Descripcion...          |
|                                  |
|  $24 / ano                       |
|                                  |
|  [ Quiero ser Pro -> ]           |
+----------------------------------+
```

### Archivos nuevos
- `src/components/pro/ProUpgradeModal.tsx`
- `src/i18n/es/pro.json`
- `src/i18n/en/pro.json`
- `src/i18n/fr/pro.json`
- `src/i18n/pt/pro.json`

### Archivos modificados
- `src/hooks/useTranslation.ts` (registrar seccion `pro`)
- `src/components/me/AppsTab.tsx` (logica de gate + mostrar modal)

### SQL
- `UPDATE user_subscriptions SET tier = 'free', founder_number = NULL WHERE user_id = 'c8fd62b0-...'`
