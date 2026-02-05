

## Plan: Crear Pagina /home con Carousel y Builder Onboarding

### Objetivo

Crear una nueva pagina `/home` que funcione como dashboard dinamico con:
1. **Fresh Drops Carousel**: Muestra las N startups mas recientes (N configurable desde general_settings)
2. **Builder Onboarding**: Checklist visual de completitud del perfil
3. **Startups Grid**: Lista completa de proyectos debajo

---

### Estructura de la Pagina

```text
+--------------------------------------------------+
|  [Header existente - AuthenticatedHeader/Public] |
+--------------------------------------------------+
|  [Builder Onboarding] (solo si logueado + incompleto)
|  Checklist: Nombre, Avatar, Tagline, Red Social, App
+--------------------------------------------------+
|  Fresh Drops                                     |
|  [Carousel auto-play 4s con N startups recientes]|
|  [< slide 1 >] [slide 2] [slide 3]...            |
+--------------------------------------------------+
|  Explorar Todo                                   |
|  [Grid 3 columnas con todas las startups]        |
+--------------------------------------------------+
|  [Footer existente]                              |
+--------------------------------------------------+
```

---

### Archivos a Crear

| Archivo | Descripcion |
|---------|-------------|
| `src/pages/Home.tsx` | Pagina principal con layout completo |
| `src/components/home/FreshDropsCarousel.tsx` | Carousel con startups recientes |
| `src/components/home/BuilderOnboarding.tsx` | Checklist de onboarding |
| `src/hooks/useFreshDrops.ts` | Hook para obtener startups recientes |
| `src/hooks/useProfileCompletion.ts` | Hook para calcular checklist de completitud |

---

### Modificaciones Necesarias

| Archivo | Cambio |
|---------|--------|
| `src/App.tsx` | Agregar ruta `/home` |
| Base de datos | Agregar setting `fresh_drops_count` en general_settings |

---

### 1. Nueva Setting en general_settings

Se agregara una nueva fila en la tabla `general_settings`:

```text
key: fresh_drops_count
value: 5
description: Cantidad de startups a mostrar en el carousel Fresh Drops
```

---

### 2. Hook `useFreshDrops`

Obtiene las N startups mas recientes, donde N viene de general_settings:

```typescript
// Logica principal
const { data: settings } = useGeneralSettings();
const freshDropsCount = parseInt(
  settings?.find(s => s.key === 'fresh_drops_count')?.value || '5'
);

// Consulta a showcase_gallery
supabase
  .from('showcase_gallery')
  .select('*')
  .eq('is_active', true)
  .order('created_at', { ascending: false })
  .limit(freshDropsCount)
```

---

### 3. Hook `useProfileCompletion`

Calcula el checklist de completitud basado en 5 items especificos:

```text
Checklist (cada item = 20%):
+-------------------+-------------------------------------------+
| Campo             | Condicion para estar completo             |
+-------------------+-------------------------------------------+
| Nombre            | profile.name no vacio                     |
| Avatar            | profile.avatar_url no vacio               |
| Tagline           | profile.tagline no vacio                  |
| Red Social        | Al menos UNA red social con valor         |
|                   | (lovable, twitter, github, tiktok,        |
|                   |  instagram, youtube, linkedin, email)     |
| App               | Al menos UNA app en la tabla apps         |
+-------------------+-------------------------------------------+
```

Retorna:
- `percentage`: numero 0-100
- `isComplete`: boolean (100%)
- `checklist`: array con estado de cada item
- `loading`: boolean

```typescript
interface ChecklistItem {
  key: 'name' | 'avatar' | 'tagline' | 'social' | 'app';
  label: string;
  completed: boolean;
}

// Ejemplo de retorno
{
  percentage: 60,
  isComplete: false,
  checklist: [
    { key: 'name', label: 'Nombre', completed: true },
    { key: 'avatar', label: 'Avatar', completed: true },
    { key: 'tagline', label: 'Tagline', completed: true },
    { key: 'social', label: 'Red social', completed: false },
    { key: 'app', label: 'Tu primera app', completed: false },
  ]
}
```

---

### 4. Componente `BuilderOnboarding`

Solo visible si:
- Usuario esta logueado
- `percentage < 100`
- No fue cerrado manualmente (localStorage: `onboarding_dismissed`)

Elementos visuales:

```text
+----------------------------------------------------------+
|  Tu identidad esta al 60%                           [X]  |
|  [=========>          ] 60%                              |
|                                                          |
|  [x] Nombre                                              |
|  [x] Avatar                                              |
|  [x] Tagline                                             |
|  [ ] Al menos una red social                             |
|  [ ] Tu primera app                                      |
|                                                          |
|  Los perfiles completos reciben 3x mas visitas.          |
|                                                          |
|  [Completar mi Perfil]                                   |
+----------------------------------------------------------+
```

Estilos:
- Borde izquierdo con color primario
- Fondo claro sutil
- Checklist con iconos de check (completado) o circulo vacio (pendiente)
- Boton "Completar mi Perfil" navega a `/me/profile`
- Boton X para cerrar (guarda `onboarding_dismissed` en localStorage)

---

### 5. Componente `FreshDropsCarousel`

Usa el componente Carousel existente de shadcn/ui con autoplay.

**Diseno del slide (solo logos, sin screenshots):**

```text
Layout Desktop:
+---------------------------------------------------+
|  +--------+                                       |
|  |  Logo  |   Titulo del Proyecto                 |
|  |  96px  |   Tagline breve del proyecto          |
|  +--------+   [Ver Proyecto ->]                   |
+---------------------------------------------------+

Layout Movil:
+---------------------------+
|  +--------+               |
|  |  Logo  |               |
|  |  80px  |               |
|  +--------+               |
|  Titulo                   |
|  Tagline                  |
|  [Ver Proyecto ->]        |
+---------------------------+
```

Caracteristicas:
- Fondo con gradiente suave o borde sutil
- Logo grande y prominente (96px desktop, 80px movil)
- Autoplay cada 4 segundos
- Puntos de navegacion abajo (dots)
- Responsivo: 1 slide visible en movil

---

### 6. Pagina `Home.tsx`

Layout principal:

```tsx
<div className="min-h-screen flex flex-col bg-background">
  {/* Header condicional */}
  {user ? (
    <PublicProfileHeader />
  ) : (
    <PublicHeader />
  )}

  <main className="flex-1">
    {/* Builder Onboarding - solo logueados incompletos */}
    {user && !profileCompletion.isComplete && !isDismissed && (
      <section className="container py-6">
        <BuilderOnboarding 
          percentage={profileCompletion.percentage}
          checklist={profileCompletion.checklist}
          onDismiss={handleDismiss}
        />
      </section>
    )}

    {/* Fresh Drops Carousel */}
    <section className="py-12">
      <div className="container">
        <h2 className="text-2xl font-bold mb-6">
          Acaba de salir del horno
        </h2>
        <FreshDropsCarousel projects={freshDrops} />
      </div>
    </section>

    {/* Explorar Todo - Grid completo */}
    <section className="py-16 bg-muted/30">
      <div className="container">
        <h2 className="text-2xl font-bold mb-8">Explorar Todo</h2>
        <ShowcaseGrid projects={allProjects} />
      </div>
    </section>
  </main>

  <Footer />
</div>
```

---

### Dependencia Nueva

```json
"embla-carousel-autoplay": "^8.6.0"
```

Compatible con la version de `embla-carousel-react` ya instalada (^8.6.0).

---

### Ruta en App.tsx

```tsx
// Nueva ruta independiente (funciona para logueados y no logueados)
<Route path="/home" element={<Home />} />
```

---

### Responsividad

| Elemento | Desktop | Movil |
|----------|---------|-------|
| Carousel | Slide horizontal con logo + info | Slide vertical centrado |
| Onboarding | Card con checklist horizontal | Card full-width, checklist vertical |
| Grid startups | 3 columnas | 1 columna |

---

### Flujo Visual

```text
Usuario no logueado visita /home:
    [Header publico]
    [Fresh Drops Carousel]
    [Explorar Todo Grid]
    [Footer]

Usuario logueado con perfil incompleto visita /home:
    [Header autenticado]
    [Builder Onboarding con checklist]
    [Fresh Drops Carousel]
    [Explorar Todo Grid]
    [Footer]

Usuario logueado con perfil completo visita /home:
    [Header autenticado]
    [Fresh Drops Carousel]
    [Explorar Todo Grid]
    [Footer]
```

