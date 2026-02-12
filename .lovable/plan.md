

## Reemplazar seccion de Precios por Banner Freemium (cuando se alcancen 100 founders)

### Resumen
Cuando `spotsLeft` sea 0 (los 100 cupos de founder se llenaron), la seccion de precios actual se reemplaza por un banner limpio de invitacion freemium. El codigo actual de precios se mantiene intacto para poder reactivarlo con un simple switch.

### Cambios

**1. Archivo: `src/pages/NewLanding.tsx` - Componente `PricingSection`**

Se agrega logica condicional dentro del componente:

- Si `spotsLeft > 0`: se muestra la seccion de precios actual (sin cambios).
- Si `spotsLeft === 0`: se muestra el nuevo **Banner Freemium**.

El banner freemium incluye:
- Avatar stack con prueba social ("Unete a +100 builders activos")
- Titulo: "Construye en publico. Valida con expertos."
- Subtitulo: "El acceso a la comunidad y las herramientas de testing es 100% gratuito. Empieza hoy mismo."
- Contenedor flotante con los mismos botones de LinkedIn y Google (reutilizando `handleLinkedInSignIn` y `handleGoogleSignIn`)
- Texto de los botones cambia de "Reclamar con..." a "Empezar gratis con..."
- Microcopy: "Acceso instantaneo. No se requiere tarjeta de credito."

**2. Archivos i18n (es, en, fr, pt) - `newLanding.json`**

Se agregan nuevas claves bajo `pricing.freemium`:

```text
pricing.freemium.socialProof     -> "Unete a +{{count}} builders activos"
pricing.freemium.title           -> "Construye en publico. Valida con expertos."
pricing.freemium.subtitle        -> "El acceso a la comunidad y las herramientas de testing es 100% gratuito. Empieza hoy mismo."
pricing.freemium.ctaLinkedIn     -> "Empezar gratis con LinkedIn"
pricing.freemium.ctaGoogle       -> "Empezar gratis con Google"
pricing.freemium.trustText       -> "Acceso instantaneo. No se requiere tarjeta de credito."
```

**3. Avatar Stack**

Se usaran avatares placeholder (iniciales genericas) o se puede hacer un query ligero a perfiles reales. Para simplificar, se usaran 5 avatares con iniciales aleatorias y el componente Avatar existente de Radix, con bordes blancos y superposicion (-ml-2).

### Estructura del Banner Freemium

```text
+----------------------------------------------------------+
|                                                          |
|         [Avatar Stack: 5 circulos superpuestos]          |
|         "Unete a +100 builders activos"                  |
|                                                          |
|    Construye en publico. Valida con expertos.            |
|                                                          |
|    El acceso a la comunidad y las herramientas           |
|    de testing es 100% gratuito. Empieza hoy.             |
|                                                          |
|    +----------------------------------------------+      |
|    |  shadow-2xl rounded-2xl container             |      |
|    |                                               |      |
|    |  [in] Empezar gratis con LinkedIn             |      |
|    |                                               |      |
|    |  [G]  Empezar gratis con Google               |      |
|    |                                               |      |
|    +----------------------------------------------+      |
|                                                          |
|    Acceso instantaneo. No se requiere tarjeta.           |
|                                                          |
+----------------------------------------------------------+
```

### Detalle tecnico

| Archivo | Cambio |
|---|---|
| `src/pages/NewLanding.tsx` | Condicional `spotsLeft > 0` para mostrar precios vs banner freemium |
| `src/i18n/es/newLanding.json` | Nuevas claves `pricing.freemium.*` |
| `src/i18n/en/newLanding.json` | Nuevas claves `pricing.freemium.*` |
| `src/i18n/fr/newLanding.json` | Nuevas claves `pricing.freemium.*` |
| `src/i18n/pt/newLanding.json` | Nuevas claves `pricing.freemium.*` |

### Nota
- El codigo de precios original NO se elimina, solo se envuelve en la condicion `spotsLeft > 0`
- Para volver a mostrar precios en el futuro, solo hay que cambiar la condicion
- Se reutilizan los mismos handlers de autenticacion (Google/LinkedIn) y el mismo estilo de botones
- El numero de builders para el avatar stack se toma de `totalBuilders` que ya viene del edge function `get-landing-stats`
