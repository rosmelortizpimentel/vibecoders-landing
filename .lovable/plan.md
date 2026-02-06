
Objetivo (según tu mensaje)
1) En el Dashboard (/me), mantener layout dividido 60/40 (Editor/Preview) solo para: Perfil, Apps, Branding.  
   En la pestaña Beta: ocultar Preview y expandir el contenido al 100% (desktop y mobile).
2) Quitar la “línea colapsable” (el header tipo acordeón “Gestionar Beta 0/5” con chevron) porque ya no tiene sentido en una pestaña dedicada.
3) En “Instrucciones para testers”, agregar un link pequeño a una guía en `/post/{slug-en-ingles}` con contenido concreto sobre cómo testear startups como usuario final (sin capacitación previa).
4) Hacer el campo “Instrucciones para testers” al doble de alto.
5) El bug del cursor que se va al final al editar en medio del texto aún ocurre: dejar la edición fluida en todos los campos.

---

Cambios propuestos (alto nivel)
A) Layout del Dashboard (/me)
- Detectar cuando `activeTab === 'beta'` para:
  - Ocultar la columna de Preview en desktop.
  - Expandir el panel principal al 100% en desktop.
  - Ocultar el botón fijo “Vista previa” y el Sheet de preview en mobile (solo en Beta).

B) BetaManagement sin colapsable
- Convertir `BetaManagement` en un panel “siempre abierto” (sin `Collapsible`).
- Mantener un encabezado simple (no clickeable) con el título (y opcionalmente el contador 0/5 si beta está activa), pero sin acordeón/chevron.

C) Link pequeño + post guía en /post/...
- Agregar al lado del label “Instrucciones para testers” un link pequeño tipo “Ver guía” que abra `/post/end-user-beta-testing-guide` (slug en inglés).
- Crear una nueva página Post (pública) con contenido muy concreto:
  - Checklist para probar como usuario final.
  - Flujos mínimos (primera impresión, onboarding, “momento aha”, errores, mobile).
  - Plantilla de reporte (pasos, esperado vs actual, dispositivo/navegador, evidencia).
- Mostrar el contenido en ES/EN según idioma actual (usando `useLanguage()`), sin tocar el sistema i18n si queremos mantenerlo liviano; o alternativamente agregar `posts.json` y expandir `useTranslation` (más estructurado). Recomiendo la opción liviana primero (contenido en el componente) para no ampliar imports de i18n por un solo post.

D) Textarea de instrucciones más alto
- Subir `rows` (p.ej. de 3 a 6) y/o `min-h-[160px]` para que se vea claramente el doble.

E) Fix definitivo del “cursor se va al final”
Este bug suele pasar cuando:
- el input está enfocado,
- ocurre un auto-save que actualiza el estado “padre”,
- y el componente vuelve a “sincronizar” el value desde props mientras el usuario sigue editando (lo que resetea selección y manda el cursor al final).

En este proyecto hay dos focos claros:
1) `DebouncedInput/DebouncedTextarea` (src/components/ui/debounced-input.tsx)
   - Hoy sincronizan `localValue` con `value` cuando `isTypingRef` queda en false (por ejemplo tras el debounce) aunque el input siga enfocado.
   - Eso puede disparar un “reset” del input en medio de la edición y empujar el cursor al final.

   Solución:
   - Mejorar DebouncedInput/Textarea para NO sincronizar `localValue` desde props mientras el campo esté enfocado.
   - Implementar `isFocusedRef` (onFocus/onBlur) y cambiar el effect a:
     - “si NO está enfocado, entonces sincroniza; si está enfocado, no toques el localValue”.
   - Usar `ReturnType<typeof setTimeout>` en vez de `NodeJS.Timeout` para tipado correcto en browser.

2) `UsernameEditor` (src/components/me/UsernameEditor.tsx)
   - Tiene un effect “Sync with prop changes” que hace `setUsername(currentUsername || '')` cada vez que cambia `currentUsername`.
   - Pero `currentUsername` cambia durante el auto-save (cuando el username es válido), y eso puede pisar el input mientras editas, moviendo el cursor al final.
   
   Solución:
   - Igual que arriba: solo sincronizar `username` desde `currentUsername` cuando el input NO esté enfocado (o cuando el usuario no esté “editando”).
   - Añadir `isFocusedRef` y condicionar el `useEffect`.

Adicionalmente, para la pestaña Beta:
- `BetaManagement` hoy usa `<Input/>` y `<Textarea/>` directos para `beta_link` y `beta_instructions`. Esos cambios llaman `updateApp` inmediatamente y provocan re-renders frecuentes.
- Cambiar esos campos a `DebouncedInput` / `DebouncedTextarea` para que la edición sea fluida también ahí (y aprovechar el fix anterior).

---

Archivos a modificar / crear

1) src/pages/Me.tsx
- Cambiar el layout:
  - `showPreviewDesktop = !isMobile && activeTab !== 'beta'`
  - Main column width:
    - si `showPreviewDesktop`: 60%
    - si no: 100%
  - Renderizar Preview solo si `showPreviewDesktop`
  - Renderizar footer preview (Sheet) solo si `isMobile && activeTab !== 'beta'`

2) src/components/beta/BetaManagement.tsx
- Eliminar `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`, `ChevronDown` y estado `isOpen`.
- Dejar panel siempre visible.
- Ajustar `useEffect` de fetch:
  - `if (config.beta_active) fetchTesters(); fetchFeedback();`
  - deps: `[config.beta_active, appId]`
- Cambiar inputs:
  - `beta_link`: usar `DebouncedInput`
  - `beta_instructions`: usar `DebouncedTextarea` + doble alto
- En el label de instrucciones:
  - añadir link pequeño a `/post/end-user-beta-testing-guide` (idealmente `target="_blank"`)

3) src/components/ui/debounced-input.tsx
- Ajustar para evitar “cursor al final”:
  - Añadir `isFocusedRef` y handlers `onFocus`/`onBlur`
  - En el effect de sync: solo setLocalValue(value) si NO está enfocado
  - Mantener flush en blur (si hay cambios, enviar inmediatamente)
  - Tipos: `ReturnType<typeof setTimeout>`

4) src/components/me/UsernameEditor.tsx
- Arreglar “cursor al final”:
  - Añadir `isFocusedRef`
  - En el effect que sincroniza con `currentUsername`, solo ejecutar si NO está enfocado
  - (Opcional) también evitar resetear `isAvailable` mientras se está editando

5) src/App.tsx
- Agregar ruta pública para post:
  - `<Route path="/post/:slug" element={<Post />} />` (antes de `/:handle` por claridad, aunque v6 prioriza rutas más específicas)

6) src/pages/Post.tsx (nuevo)
- Página simple tipo artículo:
  - Header con botón “volver” (a `/me/beta` si está logueado, si no a `/`)
  - Contenido renderizado según `slug`
  - Contenido ES/EN según `useLanguage()`
  - Estilo: `max-w-3xl`, tipografía clara, bullets y secciones

Slug propuesto (en inglés)
- `/post/end-user-beta-testing-guide`

Contenido propuesto (muy concreto, estructura)
- Qué hacer en 15 minutos:
  1) Primeros 30s: ¿entiendes qué hace?
  2) Core flow: completar la acción principal
  3) Fricción: ¿en qué te trabas?
  4) Confianza: ¿qué te haría dudar?
  5) Mobile: 2 checks rápidos
- Qué NO hacer (evitar feedback vago)
- Plantilla de reporte (copiar/pegar)
- Checklist final (5 items)

---

Criterios de aceptación (lo que vas a notar al final)
1) En /me/beta:
   - Desktop: no aparece “Vista Previa”; el panel se ve a ancho completo.
   - Mobile: desaparece el botón fijo de “Vista previa” en esa pestaña.
2) En Beta:
   - Ya no existe el header colapsable “Gestionar Beta 0/5” con chevron.
3) En “Instrucciones para testers”:
   - El textarea es visiblemente más alto (aprox el doble).
   - Aparece un link pequeño “Ver guía” hacia `/post/end-user-beta-testing-guide`.
4) Cursor:
   - Puedes insertar/editar texto al inicio o en medio de cualquier campo del editor sin que el cursor salte al final (incluyendo Username y los campos del Beta panel).

---

Orden de implementación
1) Fix base del cursor:
   - debounced-input.tsx
   - UsernameEditor.tsx
2) Layout /me:
   - Me.tsx (ocultar preview solo en beta)
3) BetaManagement:
   - quitar collapsible
   - debounced inputs
   - link pequeño + textarea alto
4) Post:
   - crear Post.tsx
   - ruta en App.tsx
5) Pruebas end-to-end:
   - Editar texto en medio en: Nombre, Tagline, Username, Descripción de app, Instrucciones de beta
   - Verificar /me/beta en desktop y mobile
   - Abrir link del post y volver sin perder cambios
