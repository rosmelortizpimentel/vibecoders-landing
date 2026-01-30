
# Plan: Rediseño del menú de usuario profesional

## Problema identificado
El color morado proviene de las variables CSS globales del tema:
- `--accent: 263 70% 58%` (morado) - usado en `focus:bg-accent`
- `--border: 263 30% 25%` (borde morado)
- `--popover: 222 47% 8%` (fondo oscuro)

El `DropdownMenuItem` de shadcn/ui aplica `focus:bg-accent focus:text-accent-foreground` por defecto.

## Solución
Sobreescribir los estilos directamente en `UserMenu.tsx` con clases Tailwind específicas para ignorar las variables del tema y usar colores profesionales.

---

## Cambios a realizar

### Archivo: `src/components/UserMenu.tsx`

**DropdownMenuContent:**
```text
Antes: className="w-48 bg-white border border-border shadow-lg"
Después: className="w-48 bg-white border border-gray-200 shadow-lg rounded-lg"
```
- Cambiar `border-border` (morado) por `border-gray-200` (gris neutro)
- Añadir `rounded-lg` para bordes más suaves

**DropdownMenuItem (items normales):**
```text
Antes: className="cursor-pointer gap-2"
Después: className="cursor-pointer gap-2 text-[#1c1c1c] focus:bg-[#3D5AFE] focus:text-white hover:bg-[#3D5AFE] hover:text-white transition-colors"
```
- Texto base: `#1c1c1c` (oscuro)
- Hover/Focus: fondo `#3D5AFE` (azul del header) con texto blanco

**DropdownMenuItem (Cerrar Sesión):**
```text
Antes: className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
Después: className="cursor-pointer gap-2 text-[#1c1c1c] focus:bg-[#3D5AFE] focus:text-white hover:bg-[#3D5AFE] hover:text-white transition-colors"
```
- Eliminar el rojo para mantener consistencia visual
- Mismo estilo que los otros items (profesional y unificado)

**DropdownMenuSeparator:**
```text
Añadir: className="bg-gray-200"
```
- Cambiar de `bg-muted` (oscuro) a gris claro

---

## Resultado visual esperado

```text
┌─────────────────────────┐
│  Mi Perfil          [→] │  ← texto #1c1c1c, hover: fondo azul, texto blanco
├─────────────────────────┤  ← separador gris claro
│  Cerrar Sesión      [→] │  ← mismo estilo que arriba
└─────────────────────────┘
     ↑ fondo blanco, borde gris neutro, sombra suave
```

---

## Código final del componente

Las clases específicas a aplicar:

| Elemento | Clases nuevas |
|----------|---------------|
| `DropdownMenuContent` | `bg-white border-gray-200 rounded-lg` |
| `DropdownMenuItem` | `text-[#1c1c1c] hover:bg-[#3D5AFE] hover:text-white focus:bg-[#3D5AFE] focus:text-white` |
| `DropdownMenuSeparator` | `bg-gray-200` |

Esto garantiza un menú limpio, profesional y consistente con la paleta del sitio (azul #3D5AFE para elementos destacados).
