
# Agregar mensaje de precio exclusivo $24/año en la waitlist

## Cambios

### 1. Actualizar la seccion Waitlist CTA en `src/pages/Closed.tsx`

Agregar debajo del subtitulo actual un bloque destacado con el precio exclusivo de $24/año y un mensaje de que este precio se congelara para quienes se unan a la waitlist, mientras que despues sera mayor.

Visualmente sera un badge/highlight con el precio "$24/year" en color `secondary` (amarillo) para que destaque sobre el fondo oscuro, con texto explicativo debajo.

### 2. Actualizar traducciones en los 4 idiomas

Agregar nuevas claves en `waitlist`:
- `waitlist.priceHighlight` — El precio exclusivo (ej: "$24/año")
- `waitlist.priceNote` — Mensaje de que el precio sera mayor pero se congela para ellos

**Textos por idioma:**

| Idioma | priceHighlight | priceNote |
|--------|---------------|-----------|
| ES | Precio exclusivo: $24/año | Este precio aumentara despues del lanzamiento. Al unirte a la lista, lo congelamos para ti. |
| EN | Exclusive price: $24/year | This price will increase after launch. By joining the waitlist, we freeze it for you. |
| FR | Prix exclusif : 24$/an | Ce prix augmentera apres le lancement. En rejoignant la liste, nous le gelons pour vous. |
| PT | Preco exclusivo: $24/ano | Este preco aumentara apos o lancamento. Ao entrar na lista, congelamos para voce. |

### Archivos afectados

| Archivo | Accion |
|---------|--------|
| `src/pages/Closed.tsx` | Agregar bloque de precio entre subtitle y boton |
| `src/i18n/es/closed.json` | Agregar claves `waitlist.priceHighlight` y `waitlist.priceNote` |
| `src/i18n/en/closed.json` | Idem |
| `src/i18n/fr/closed.json` | Idem |
| `src/i18n/pt/closed.json` | Idem |
