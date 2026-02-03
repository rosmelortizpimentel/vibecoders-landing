
# Plan: Mejoras al Build Log - Diseño Profesional

## Resumen de Cambios Solicitados

1. **Eliminar la sección CTA** al final del artículo ("¿Quieres ver este stack en acción?")
2. **Sidebar simplificado** - Mostrar solo el item activo (#01), sin los items bloqueados con candado
3. **Renombrar sección** - "La Arquitectura y el Flujo de Trabajo" (sin "Git Flow")
4. **Agregar imagen de arquitectura** - Incluir el diagrama compartido en esa sección
5. **Colores profesionales** - Reemplazar colores "genéricos de IA" (amber, emerald, etc.) por azul (#3D5AFE) y grises

---

## Cambios Técnicos

### 1. BuildLog.tsx - Página Principal

**Eliminar CTA Box (líneas 211-225)**
- Remover completamente el bloque con gradiente morado y botón

**Actualizar título de sección (línea 89-90)**
- Cambiar de: `"La Arquitectura y el Flujo de Trabajo (Git Flow)"`
- A: `"La Arquitectura y el Flujo de Trabajo"`

**Agregar imagen de arquitectura**
- Copiar `Diagrama_de_arquitectura_actual.jpeg` a `src/assets/buildlog/`
- Importar la imagen en el componente
- Mostrarla después del texto introductorio de la sección, antes del timeline

---

### 2. BuildLogSidebar.tsx - Solo Item Activo

**Simplificar lista de entradas**
- Eliminar los items 02, 03, 04 (los bloqueados)
- Mantener solo el item activo (#01)

```text
Antes:                          Después:
├── 01. El Stack (activo)       ├── 01. El Stack (activo)
├── 02. Filosofía (locked)
├── 03. Workflow (locked)
└── 04. Costos (locked)
```

---

### 3. ProTipCallout.tsx - Colores Profesionales

**Reemplazar paleta de colores**

| Variante | Antes | Después |
|----------|-------|---------|
| warning | amber (naranja) | slate/gray oscuro |
| info | blue | primary (azul #3D5AFE) |
| success | emerald (verde) | slate con borde primary |

**Nuevos estilos propuestos:**
- `warning`: Borde gris oscuro (`border-l-gray-400`), fondo gris claro (`bg-gray-50`)
- `info`: Borde azul primary (`border-l-primary`), fondo azul muy suave (`bg-primary/5`)
- `success`: Borde azul primary (`border-l-primary`), fondo blanco (`bg-white`)

---

### 4. WorkflowTimeline.tsx - Colores Profesionales

**BranchDiagram - Reemplazar badges de colores**
- `release`: De amber a gris (`bg-gray-100 text-gray-700`)
- `main`: De emerald a azul primary (`bg-primary/10 text-primary`)

---

### 5. StackCard.tsx - Refinamiento de Hover

**Mejorar consistencia visual**
- Mantener el hover con `border-primary/30` (ya usa el azul correcto)
- El fondo del icono ya usa `bg-primary/5` (correcto)

---

## Archivos a Modificar

| Archivo | Acción |
|---------|--------|
| `src/assets/buildlog/architecture-diagram.jpeg` | Crear (copiar imagen del usuario) |
| `src/pages/BuildLog.tsx` | Editar (quitar CTA, agregar imagen, cambiar título) |
| `src/components/buildlog/BuildLogSidebar.tsx` | Editar (solo item activo) |
| `src/components/buildlog/ProTipCallout.tsx` | Editar (colores profesionales) |
| `src/components/buildlog/WorkflowTimeline.tsx` | Editar (colores de badges) |

---

## Resultado Visual Esperado

- Página más limpia sin CTA redundante
- Sidebar minimalista con solo el contenido disponible
- Diagrama de arquitectura visible e integrado en el artículo
- Paleta de colores coherente: azul primary (#3D5AFE) y grises neutros
- Aspecto profesional tipo Stripe/Linear, sin "señales de IA"
