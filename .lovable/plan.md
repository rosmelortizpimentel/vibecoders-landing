
# Plan: Solucionar OAuth de Google en Navegador Embebido de LinkedIn (iOS)

## Contexto del Problema

Cuando un usuario abre tu sitio desde un link en la app de LinkedIn en iOS, se abre en un **navegador embebido (WebView)**. Google bloquea OAuth en estos navegadores por seguridad, mostrando el error:

```
Error 403: disallowed_useragent
```

En Android funciona porque LinkedIn usa Chrome Custom Tabs que Google sí permite.

---

## Solución Propuesta

Detectar si el usuario está en el navegador embebido de LinkedIn en iOS y:

1. **Opción A (Recomendada)**: Redirigir automáticamente a Safari usando el esquema `x-safari-` (disponible desde iOS 17+)
2. **Opción B (Fallback)**: Mostrar un mensaje indicando al usuario que abra el enlace en Safari manualmente

---

## Implementación

### 1. Crear utilidad de detección de navegador embebido

Crear un nuevo archivo `src/lib/inAppBrowser.ts` con funciones para:
- Detectar si es navegador embebido de LinkedIn en iOS
- Redirigir a Safari automáticamente
- Fallback para versiones anteriores a iOS 17

```text
┌─────────────────────────────────────────┐
│ Usuario abre link desde LinkedIn (iOS)  │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│ ¿Es LinkedInApp + iOS?                  │
└──────────┬──────────────────┬───────────┘
           │ SÍ               │ NO
           ▼                  ▼
┌─────────────────────┐  ┌────────────────┐
│ Redirigir a Safari  │  │ Continuar      │
│ (x-safari-URL)      │  │ normalmente    │
└─────────────────────┘  └────────────────┘
```

### 2. Implementar redirección al inicio de la app

Modificar `src/main.tsx` o agregar un componente wrapper que ejecute la verificación **antes** de que React renderice la app.

La lógica verificará:
```javascript
const userAgent = navigator.userAgent;
const isLinkedInIOS = userAgent.includes('Mobile') && 
                      (userAgent.includes('iPhone') || userAgent.includes('iPad')) && 
                      userAgent.includes('LinkedInApp');

if (isLinkedInIOS) {
  window.location.href = 'x-safari-' + window.location.href;
}
```

### 3. Alternativa: Mostrar mensaje amigable

Si la redirección automática falla (iOS < 17), mostrar un modal/mensaje:

> "Para continuar con Google, abre este enlace en Safari. Toca el ícono de Safari o copia el enlace."

Con un botón para copiar la URL al portapapeles.

---

## Archivos a Modificar/Crear

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/lib/inAppBrowser.ts` | Crear | Utilidades para detectar y manejar navegadores embebidos |
| `src/main.tsx` | Modificar | Agregar verificación al inicio antes de renderizar |
| `src/components/InAppBrowserWarning.tsx` | Crear | Componente de fallback con instrucciones manuales |

---

## Detalles Técnicos

### Detección del User Agent de LinkedIn iOS

LinkedIn en iOS tiene un user agent como:
```
Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) 
AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.30.1317
```

La clave es detectar `LinkedInApp` + `iPhone`/`iPad` + `Mobile`.

### Esquema x-safari-

El esquema `x-safari-https://...` abre Safari directamente desde un WebView. Solo funciona en iOS 17+, pero la mayoría de usuarios ya tienen esta versión.

### Fallback para iOS < 17

Para usuarios con versiones anteriores, mostrar un mensaje con:
- Instrucciones claras
- Botón "Copiar enlace"
- Opción de abrir en navegador del sistema (si está disponible)

---

## Resultado Esperado

- Usuarios que llegan desde LinkedIn en iOS serán redirigidos automáticamente a Safari
- En Safari, el OAuth de Google funcionará sin problemas
- Si la redirección falla, verán instrucciones claras para continuar

---

## Nota Importante

Esta solución es específica para LinkedIn. Si en el futuro tienes problemas con otros navegadores embebidos (Facebook, Twitter, Instagram), la misma lógica puede extenderse detectando sus user agents:
- Facebook: `FBAN` o `FBAV` en el user agent
- Instagram: `Instagram`
- Twitter/X: `Twitter`
