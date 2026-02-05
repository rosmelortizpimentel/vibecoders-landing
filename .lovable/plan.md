
## Plan: Corrección de URL de Producción y Error de "Invalid URL"

### Problemas Identificados

1. **URL de producción incorrecta**: En la tabla `general_settings`, el `site_url` está configurado como `https://building.vibecoders.la` pero debe ser `https://vibecoders.la`.

2. **Error "Failed to construct 'URL': Invalid URL"**: En dos componentes, se usa `new URL(app.url).hostname` sin manejo de errores. Si una app tiene `url` vacía o inválida, esto lanza una excepción que rompe toda la aplicación.

### Causa del Error de Pantalla Blanca

Cuando el usuario inicia sesión, se cargan sus apps desde la base de datos. Si alguna app tiene una URL vacía o malformada, al intentar renderizar la tarjeta con `new URL(app.url).hostname`, JavaScript lanza un error que no está capturado, causando que React rompa el renderizado completo.

El comportamiento extraño de que "funciona con la consola abierta" puede deberse a diferencias en timing o a que el viewport móvil activa un layout diferente que no renderiza inmediatamente esas tarjetas.

---

### Sección Técnica

#### 1. Actualizar URL de Producción en Base de Datos

Ejecutar este SQL en Supabase:

```sql
UPDATE general_settings 
SET value = 'https://vibecoders.la', 
    updated_at = now() 
WHERE key = 'site_url';
```

#### 2. Corregir `PreviewAppCard.tsx` (línea 61)

Cambiar de:
```tsx
{app.name || new URL(app.url).hostname}
```

A:
```tsx
{app.name || (() => { try { return new URL(app.url).hostname; } catch { return 'App'; } })()}
```

#### 3. Corregir `AppCard.tsx` (línea 59)

Cambiar de:
```tsx
{app.name || new URL(app.url).hostname}
```

A:
```tsx
{app.name || (() => { try { return new URL(app.url).hostname; } catch { return 'App'; } })()}
```

---

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/me/PreviewAppCard.tsx` | Envolver `new URL()` en try-catch |
| `src/components/me/AppCard.tsx` | Envolver `new URL()` en try-catch |

### Base de Datos

| Tabla | Clave | Valor Actual | Nuevo Valor |
|-------|-------|--------------|-------------|
| `general_settings` | `site_url` | `https://building.vibecoders.la` | `https://vibecoders.la` |

---

### Verificación Post-Implementación

1. Iniciar sesión con Google
2. Verificar que la página `/me` carga correctamente sin pantalla blanca
3. Confirmar que las tarjetas de apps muestran el hostname o "App" como fallback
4. Revisar que no hay errores en consola
