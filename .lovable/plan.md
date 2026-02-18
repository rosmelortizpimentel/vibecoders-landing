

## Compactar Header del Hub y Homologar Badges

### Problemas Detectados

1. **MyApps.tsx**: El titulo usa `hub.backToApps` ("Mis Apps") pero la descripcion dice "Agrega tu primer proyecto..." incluso cuando YA tienes apps. Debe decir algo como "Gestiona todas tus Apps".
2. **MyAppHub.tsx**: El header del detalle de app muestra badges genéricos (`Badge variant="outline"` para status y `Badge variant="secondary"` para verificado) en lugar de reutilizar los mismos componentes de la lista (`VerificationBadge` y `getStatusColors`).
3. **Header redundante**: El header del hub repite info (logo + nombre) que ya aparece en el AppEditor debajo. Se puede hacer mas compacto fusionando el back button con el branding en una sola linea.

---

### Cambios

#### 1. MyApps.tsx -- Corregir descripcion

Cambiar la descripcion `noAppsHint` para que sea contextual:
- Si hay apps: mostrar nueva clave `appsHint` = "Gestiona todas tus Apps" / "Manage all your Apps" / etc.
- Si no hay apps: mantener `noAppsHint` actual

Actualizar `apps.json` en los 4 idiomas con la nueva clave `appsHint`.

#### 2. MyAppHub.tsx -- Header compacto + badges homologados

**Hacer el header mas compacto:**
- Poner back arrow + nombre de app + badges + boton "Ver pagina" todo en una sola fila
- Eliminar la separacion vertical entre el back button y el branding
- Usar `VerificationBadge` (el mismo componente de la lista) en lugar de `Badge variant="secondary"`
- Usar `getStatusColors` con el slug del status (el mismo estilo de AppCard) en lugar de `Badge variant="outline"` con color inline

**Layout propuesto (una sola linea):**
```
[<-] [Logo] App Name [Building] [Verificado] .............. [Ver pagina ->]
```

#### 3. Traducciones (4 idiomas)

Agregar clave `appsHint` en `apps.json`:
- ES: "Gestiona todas tus Apps"
- EN: "Manage all your Apps"  
- FR: "Gérez toutes vos Apps"
- PT: "Gerencie todos os seus Apps"

---

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/MyAppHub.tsx` | Header compacto en 1 fila, usar VerificationBadge + getStatusColors |
| `src/pages/MyApps.tsx` | Descripcion contextual (appsHint vs noAppsHint) |
| `src/i18n/es/apps.json` | Agregar `appsHint` |
| `src/i18n/en/apps.json` | Agregar `appsHint` |
| `src/i18n/fr/apps.json` | Agregar `appsHint` |
| `src/i18n/pt/apps.json` | Agregar `appsHint` |

### Detalles Tecnicos

**MyAppHub.tsx** -- Importar y usar los mismos componentes:
```typescript
import { VerificationBadge } from '@/components/me/VerificationBadge';
import { getStatusColors } from '@/lib/appStatusColors';
import { useStatuses } from '@/hooks/useStatuses';
```

El status badge usara exactamente el mismo markup que `AppCard.tsx`:
```typescript
const status = statuses.find(s => s.id === app.status_id);
const statusColors = getStatusColors(status?.slug);
// Renderizar con las mismas clases de AppCard
```

Se elimina el `useEffect` que consulta `app_statuses` directamente ya que `useStatuses()` ya proporciona esa informacion.

**MyApps.tsx** -- Logica de descripcion:
```typescript
<p>{apps.length > 0 ? t.t('appsHint') : t.noAppsHint}</p>
```

