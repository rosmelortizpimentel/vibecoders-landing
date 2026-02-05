

## Plan: Rediseño Premium del User Menu y Header Glassmorphism

### Resumen de Cambios

Se transformará el menú desplegable del avatar a un estilo "Enterprise/SaaS" (tipo Vercel/Linear) y se añadirá el efecto de vidrio esmerilado al header para todas las páginas autenticadas.

---

### Cambios en `AuthenticatedHeader.tsx`

#### 1. Header con Glassmorphism

Modificar la etiqueta `<header>` actual:

```text
Actual:
  className="sticky top-0 z-50 border-b border-gray-100 bg-white"

Nuevo:
  className="sticky top-0 z-50 border-b border-gray-100/50 bg-white/80 backdrop-blur-md"
```

Esto crea el efecto de vidrio esmerilado donde el contenido "pasa por debajo" al hacer scroll.

---

#### 2. Estructura del Dropdown Premium (Desktop)

```text
+------------------------------------------+
|  [Avatar 32px]  Nombre Completo          |  <- Cabecera de identidad
|                 @username (gris, truncado)|     (no clicable)
+------------------------------------------+
|  [Separator]                             |
+------------------------------------------+
|  [ExternalLink]  Ver Perfil Público      |  <- Items con más padding
+------------------------------------------+
|  [Separator]                             |
+------------------------------------------+
|  [LogOut]        Cerrar Sesión           |  <- Footer separado
+------------------------------------------+
```

#### 3. Especificaciones del Dropdown

| Propiedad | Valor Actual | Valor Nuevo |
|-----------|--------------|-------------|
| Ancho | `w-48` | `w-64` |
| Sombra | `shadow-lg` | `shadow-xl` |
| Borde | `border-gray-200` | `border border-gray-100` |
| Offset | default | `mt-2` (sideOffset=8) |
| Padding items | `py-1.5` | `py-2.5` |
| Hover items | `hover:bg-[#3D5AFE]` | `hover:bg-gray-100` |

---

#### 4. Nueva Cabecera de Identidad

Se añadirá un bloque no interactivo al inicio del dropdown:

```tsx
{/* Identity Header - No clicable */}
<div className="px-3 py-3 flex items-center gap-3">
  <Avatar className="h-10 w-10 border border-gray-200 shrink-0">
    <AvatarImage src={profile?.avatar_url || ''} />
    <AvatarFallback>...</AvatarFallback>
  </Avatar>
  <div className="flex flex-col min-w-0">
    <span className="text-sm font-semibold text-gray-900 truncate">
      {profile?.name || 'Usuario'}
    </span>
    <span className="text-xs text-gray-500 truncate">
      {profile?.username ? `@${profile.username}` : 'Sin username'}
    </span>
  </div>
</div>
<DropdownMenuSeparator />
```

---

#### 5. Items del Cuerpo con Iconos Alineados

```tsx
<DropdownMenuItem className="flex items-center gap-2 py-2.5 px-3 cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-gray-900">
  <ExternalLink className="h-4 w-4 text-gray-400" />
  <span>Ver Perfil Público</span>
</DropdownMenuItem>
```

---

#### 6. Footer con Separador Visual

```tsx
<DropdownMenuSeparator className="my-1" />
<DropdownMenuItem 
  onClick={onSignOut}
  className="flex items-center gap-2 py-2.5 px-3 cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-gray-900"
>
  <LogOut className="h-4 w-4 text-gray-400" />
  <span>Cerrar Sesión</span>
</DropdownMenuItem>
```

---

### Compatibilidad Móvil

El Sheet móvil ya tiene una sección de usuario en el footer que muestra avatar, nombre y username - no requiere cambios ya que el diseño premium solo aplica al dropdown de desktop.

El efecto `backdrop-blur-md` es compatible con todos los navegadores móviles modernos y se degradará suavemente a un fondo sólido en navegadores antiguos.

---

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/AuthenticatedHeader.tsx` | Header glassmorphism + Dropdown premium |

---

### Resultado Visual

**Header:**
- Fondo semi-transparente (80% opacidad)
- Blur suave que muestra el contenido debajo al hacer scroll
- Efecto estilo Apple/Stripe

**Dropdown:**
- Más ancho y con mejor espaciado
- Cabecera con identidad del usuario (avatar + nombre + @username)
- Items con iconos alineados y mayor área de clic
- Sombra más sofisticada
- Hover sutil en gris (no azul agresivo)

