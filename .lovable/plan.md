

## Mejoras en la pagina de Ideas

### Cambios solicitados

1. **Vista por defecto = solo lista** (sin detalle abierto). Al entrar a `/ideas`, se muestra solo la lista. Al seleccionar una idea, la URL cambia a `/ideas/:id`. Al crear nueva, `/ideas/new`.
2. **Lista mas compacta**: reducir padding, tamanio de fuente y espaciado entre items.
3. **Tabs "Pendientes" y "Completadas"**: separar ideas en dos tabs en vez de mezclarlas en una sola lista.
4. **Confirmacion al marcar como completada**: al hacer clic en el circulo, mostrar un dialogo de confirmacion antes de cambiar el estado.

---

### Archivos a modificar

#### 1. `src/App.tsx`
- Agregar ruta `/ideas/:ideaId` que apunte al mismo componente `Ideas`.
- La ruta `/ideas` sigue existiendo (muestra lista sin detalle seleccionado).

#### 2. `src/pages/Ideas.tsx`
- Leer `ideaId` de `useParams()` y pasarlo como prop a `IdeasTab`.
- Si no hay `ideaId`, no se selecciona ninguna idea por defecto.

#### 3. `src/components/me/IdeasTab.tsx`

**Routing del detalle**:
- Recibir prop `initialIdeaId?: string` desde Ideas.tsx.
- Usar `useNavigate()` para cambiar la URL al seleccionar/deseleccionar una idea:
  - Seleccionar idea: `navigate(/ideas/${id})`
  - Nueva idea: `navigate(/ideas/new)`
  - Volver a lista: `navigate(/ideas)`
- En desktop, no auto-seleccionar la primera idea. Mostrar el placeholder "Selecciona una idea" por defecto.

**Lista mas compacta**:
- Reducir padding de los items de `p-2.5 md:p-3` a `p-1.5 md:p-2`.
- Reducir la fuente del titulo de `text-sm` a `text-xs`.
- Reducir el espaciado entre items de `space-y-1.5` a `space-y-1`.
- Reducir el badge de dias de `text-[10px]` a `text-[9px]` y la altura.

**Tabs Pendientes/Completadas**:
- Agregar un estado `activeTab: 'pending' | 'done'` con valor inicial `'pending'`.
- Renderizar dos tabs debajo del buscador: "Pendientes (N)" y "Completadas (N)".
- Cuando el tab es `pending`, mostrar solo ideas sin `is_done`. Cuando es `done`, mostrar solo las completadas.
- Las ideas completadas no son drag-and-drop (ya es asi).

**Confirmacion al marcar completada**:
- Al hacer clic en el circulo (toggle done), abrir un `AlertDialog` pidiendo confirmacion.
- Guardar en estado temporal `pendingToggle: { id, newDone }` y mostrar el dialogo.
- Al confirmar, ejecutar `handleToggleDone`. Al cancelar, cerrar sin cambios.

#### 4. `src/i18n/*/profile.json` (es, en, fr, pt)
- Agregar claves:
  - `ideas.tabPending`: "Pendientes"
  - `ideas.tabCompleted`: "Completadas"
  - `ideas.confirmCompleteTitle`: "Marcar como completada?"
  - `ideas.confirmCompleteMessage`: "Esta idea se movera a la lista de completadas."
  - `ideas.confirmReactivateTitle`: "Reactivar idea?"
  - `ideas.confirmReactivateMessage`: "Esta idea volvera a la lista de pendientes."

### Detalle tecnico del flujo de URLs

```text
/ideas          -> Lista visible, sin detalle seleccionado
/ideas/new      -> Lista visible + formulario de nueva idea (detalle vacio)
/ideas/:ideaId  -> Lista visible + detalle de la idea seleccionada
```

En mobile:
- `/ideas` muestra solo la lista
- `/ideas/:id` o `/ideas/new` muestra solo el detalle con boton "Volver"
- Al presionar "Volver", navega a `/ideas`

### Flujo de confirmacion al completar

```text
Usuario clickea circulo -> AlertDialog "Marcar como completada?"
  -> Confirmar -> handleToggleDone(id, true) -> idea se mueve al tab "Completadas"
  -> Cancelar -> nada cambia
```

Lo mismo al reactivar desde el tab de completadas, pero con mensaje "Reactivar idea?".

