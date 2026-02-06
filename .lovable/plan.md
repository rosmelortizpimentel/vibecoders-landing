
# Plan: Rediseno Compacto de Pagina de Detalle de App (/app/:id)

## Resumen de Cambios Solicitados

1. **Header personalizado**: Reemplazar logo de Vibecoders por logo de la app, mostrar titulo y tagline (truncado con ellipsis en movil)
2. **Card resumen compacto**: Diseño similar a la tercera imagen de referencia
3. **Seccion de autor mejorada**: Sin texto "por", con contadores de seguidores/siguiendo clickeables para ver popup
4. **Panel de tester integrado**: Mostrar "Bienvenido al Squad" directamente si es tester aceptado
5. **Formulario de feedback simplificado**: Quitar "Puntuacion general", lista de reportes con efecto flip
6. **Visualizador de imagenes**: Carousel en popup para ver imagenes adjuntas
7. **100% responsive**

---

## Cambios Detallados

### 1. Header Personalizado de la App

**Archivo**: `src/pages/AppDetail.tsx` + nuevo `AppDetailHeader.tsx`

Cambios en el header:
- Reemplazar logo de Vibecoders por `app.logo_url`
- Mostrar titulo de la app junto al logo
- Tagline debajo en texto pequeno
- En movil: texto aun mas pequeno, truncado con ellipsis (no wrap)
- El resto del header (menu usuario) permanece igual

```
Desktop:
[Logo App 40x40] Nombre de la App    [Menu Usuario]
                  Tagline corta...

Mobile:
[Logo App 32x32] Nombre App...  [Menu]
                 Tagline...
```

### 2. Card Resumen Compacto (Nuevo Componente)

**Archivo nuevo**: `src/components/beta/AppSummaryCard.tsx`

Diseño tipo la imagen de referencia:
- Logo de la app (circular, 56px)
- Nombre + icono verificado + Badge de status (ej: "Building...")
- Tagline debajo
- Iconos de tech stack en fila
- Icono de corazon (likes) a la derecha
- Boton "Ver app" (icono ExternalLink) esquina superior derecha

```
+--------------------------------------------------+
| [Logo]  Nombre App [✓] [• Building...]     [🔗]  |
|         Tagline completo                         |
|         [Lovable] [Supabase]                 ♡   |
+--------------------------------------------------+
```

### 3. Seccion de Autor Mejorada

**Archivo**: Integrado en `AppDetail.tsx`

Cambios:
- Eliminar texto "por"
- Mostrar avatar + nombre + tagline truncado
- Debajo: "X seguidores · Y siguiendo" clickeable
- Al hacer click abre `FollowListDialog` adaptado

Necesito crear hook para obtener stats del autor: `useOwnerStats.ts`

```
+----------------------------------------+
| [Avatar]  Rosmel Ortiz                 |
|           SaaS Builder & Tech Lead...  |
|           12 seguidores · 5 siguiendo  |
+----------------------------------------+
```

### 4. Panel Bienvenido al Squad (Simplificado)

**Archivo modificado**: `src/components/beta/BetaTesterPanel.tsx`

Cambios:
- Mostrar directamente sin necesidad de click en "Acceder a mision"
- Quitar tabs, integrar todo en una sola vista
- Instrucciones arriba, boton "Ir a probar la app" + copiar link
- Lista de reportes debajo (sin tabs)
- Boton "Reportar hallazgo" que hace flip del card

### 5. Lista de Reportes con Flip Animation

**Archivo nuevo**: `src/components/beta/TesterReportCard.tsx`

Componente con efecto flip:
- Estado `showForm`: false = lista de reportes, true = formulario
- Animacion CSS 3D flip (rotate Y)
- Al enviar, flip back a la lista

Estructura:
```
[Cara frontal - Lista]
+----------------------------------+
| Mis reportes (3)                 |
| +------------------------------+ |
| | Bug · Abierto · 06 feb 14:30 | |
| | Descripcion del bug...       | |
| | [img1] [img2]                | |
| +------------------------------+ |
| ...mas reportes...               |
|                                  |
| [Reportar hallazgo]              |
+----------------------------------+

[Cara trasera - Formulario]
+----------------------------------+
| Reportar hallazgo                |
| Tipo: [Select]                   |
| Descripcion: [Textarea]          |
| Imagenes: [Upload]               |
| [Cancelar] [Enviar]              |
+----------------------------------+
```

### 6. Formulario Sin Puntuacion

**Archivo modificado**: `src/components/beta/BetaFeedbackForm.tsx`

- Eliminar seccion de rating (estrellas)
- Mantener: tipo, descripcion, imagenes
- Agregar boton "Cancelar" para volver a la lista

### 7. Visualizador de Imagenes Carousel

**Archivo nuevo**: `src/components/beta/ImageCarouselDialog.tsx`

Dialog con carousel para ver imagenes:
- Click en thumbnail abre dialog
- Carousel con flechas izq/der
- Indicadores de posicion
- Cerrar con X o click fuera
- Responsive (pantalla completa en movil)

### 8. Dialog de Seguidores del Autor

**Archivo nuevo**: `src/components/beta/AuthorFollowDialog.tsx`

Similar a `FollowListDialog` pero adaptado:
- Recibe `userId` del owner
- Tabs: Seguidores | Siguiendo
- Cada item con boton follow/unfollow
- Reutiliza `FollowerCard`

---

## Archivos a Crear

| Archivo | Descripcion |
|---------|-------------|
| `src/components/beta/AppDetailHeader.tsx` | Header personalizado con logo de app |
| `src/components/beta/AppSummaryCard.tsx` | Card resumen compacto de la app |
| `src/components/beta/TesterReportCard.tsx` | Card con flip animation para reportes |
| `src/components/beta/ImageCarouselDialog.tsx` | Dialog carousel para imagenes |
| `src/components/beta/AuthorFollowDialog.tsx` | Dialog seguidores del autor |

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/pages/AppDetail.tsx` | Layout completamente rediseñado, usar nuevos componentes |
| `src/components/beta/BetaTesterPanel.tsx` | Simplificar, quitar tabs, integrar flip card |
| `src/components/beta/BetaFeedbackForm.tsx` | Quitar rating, agregar boton cancelar |
| `src/components/beta/TesterFeedbackHistory.tsx` | Adaptar para mostrar en flip card |
| `src/i18n/es/beta.json` | Nuevas traducciones |
| `src/i18n/en/beta.json` | Nuevas traducciones |

---

## CSS para Flip Animation

```css
.flip-card {
  perspective: 1000px;
}

.flip-card-inner {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flip-card-inner.flipped {
  transform: rotateY(180deg);
}

.flip-card-front, .flip-card-back {
  backface-visibility: hidden;
}

.flip-card-back {
  transform: rotateY(180deg);
}
```

---

## Estructura de Layout Propuesta

```
+----------------------------------------------------------+
| [Logo App] Nombre App · Tagline...        [Menu Usuario] |  <- Header
+----------------------------------------------------------+
|                                                          |
|  +------------------+   +----------------------------+   |
|  | AppSummaryCard   |   | Autor                      |   |
|  | Logo+Nombre+Tag  |   | Avatar+Nombre              |   |
|  | [Stack icons]    |   | 12 seguidores · 5 siguiendo|   |
|  +------------------+   +----------------------------+   |
|                                                          |
|  +---------------------------------------------------+   |
|  | Bienvenido al Squad (si es tester aceptado)       |   |
|  | Instrucciones...                                  |   |
|  | [Ir a probar la app] [Copiar]                     |   |
|  +---------------------------------------------------+   |
|                                                          |
|  +---------------------------------------------------+   |
|  | TesterReportCard (flip)                           |   |
|  | [Lista de reportes] o [Formulario]                |   |
|  +---------------------------------------------------+   |
|                                                          |
|  [Abandonar squad]                                       |
|                                                          |
+----------------------------------------------------------+
| Footer                                                   |
+----------------------------------------------------------+
```

En mobile: Todo en una columna, autor encima del summary card.

---

## Nuevas Traducciones

```json
{
  "authorFollowers": "seguidores",
  "authorFollowing": "siguiendo",
  "reportNewFinding": "Reportar hallazgo",
  "backToList": "Volver a la lista",
  "noFollowers": "Sin seguidores",
  "noFollowing": "Sin seguidos"
}
```

---

## Orden de Implementacion

1. **AppSummaryCard**: Card compacto de la app
2. **AppDetailHeader**: Header con logo de app
3. **ImageCarouselDialog**: Carousel para ver imagenes
4. **AuthorFollowDialog**: Dialog seguidores del autor  
5. **TesterReportCard**: Card con flip animation
6. **BetaFeedbackForm**: Quitar rating, agregar cancelar
7. **AppDetail.tsx**: Integrar todo con nuevo layout
8. **Traducciones**: ES y EN
9. **Estilos responsive**: Verificar en mobile

---

## Notas Tecnicas

### Truncado con Ellipsis
```tsx
<p className="text-xs md:text-sm truncate max-w-[200px] md:max-w-none">
  {app.tagline}
</p>
```

### Flip Animation con Tailwind
Usar clases de animacion custom en `index.css` o usar `framer-motion` si ya esta instalado (no esta, usar CSS puro).

### Obtener Stats del Autor
Necesito crear una edge function o query directa para obtener followers/following count del owner:
```typescript
const { data } = await supabase
  .from('follows')
  .select('id', { count: 'exact' })
  .eq('following_id', ownerId);
```

### Colores de la Paleta
Usar solo colores de la paleta definida:
- Primary: #000519
- Accent: #0F206C
- Background: #FFFFFF
- Evitar colores externos (amarillo, rojo, etc.) - usar variantes del primary

