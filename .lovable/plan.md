

## Plan: Rediseño Premium del Header con Separadores y Responsividad

### Objetivo

Transformar el header en un componente "SaaS Premium" estilo Vercel/Linear con:
- Separadores verticales sutiles en desktop
- Navegación con botones ghost
- Header limpio en móvil (solo logo + hamburguesa + avatar)

---

### Estructura Visual en Desktop

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]  │  [Mi Perfil] [Startups] [Herramientas] [Build Log]  │  [Avatar] │
│          │                                                      │           │
│   ↑      │                    ↑                                 │     ↑     │
│ Separador 1              Botones Ghost                     Separador 2      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Estructura Visual en Móvil

```text
┌──────────────────────────────────────┐
│  [Logo]           [Hamburguesa]      │
└──────────────────────────────────────┘
```

---

### Cambios Técnicos en `AuthenticatedHeader.tsx`

#### 1. Contenedor Principal (Sin cambios mayores)

El header ya tiene las clases correctas:
```tsx
className="sticky top-0 z-50 border-b border-gray-100/50 bg-white/80 backdrop-blur-md"
```

Mantener `h-16` como altura fija.

---

#### 2. Nueva Estructura Desktop con Separadores

Reemplazar el layout actual por tres zonas con separadores:

```tsx
{/* Desktop Layout - hidden on mobile */}
<div className="hidden md:flex items-center flex-1">
  
  {/* Separador 1 - después del logo */}
  <div className="h-6 w-px bg-border/60 mx-4" />
  
  {/* Navegación Central con Botones Ghost */}
  <nav className="flex items-center gap-1">
    {navLinks.map((link) => (
      <Button variant="ghost" size="sm" asChild>
        <Link to={link.path}>
          <Icon /> {link.label}
        </Link>
      </Button>
    ))}
  </nav>
  
  {/* Spacer para empujar la zona derecha */}
  <div className="flex-1" />
  
  {/* Separador 2 - antes del avatar */}
  <div className="h-6 w-px bg-border/60 mx-4" />
  
  {/* Zona Derecha: Admin + Save Status + Avatar */}
  <div className="flex items-center gap-2">
    {/* ... admin link, save status, user menu ... */}
  </div>
</div>
```

---

#### 3. Estilo de Botones Ghost para Navegación

Cambiar de `<Link>` con clases manuales a `<Button variant="ghost">`:

| Antes | Después |
|-------|---------|
| `className="flex items-center gap-1.5 text-sm..."` | `<Button variant="ghost" size="sm" asChild>` |
| Hover manual con Tailwind | Hover automático del componente Button |
| Sin borde redondeado visible | Rounded automático del Button |

Estilo del estado activo:
```tsx
<Button 
  variant="ghost" 
  size="sm"
  className={cn(
    "gap-1.5",
    isActive(link.path) && "bg-gray-100 text-[#3D5AFE] font-semibold"
  )}
>
```

---

#### 4. Layout Móvil Limpio

Simplificar para mostrar solo:
- Logo (izquierda)
- Hamburguesa (derecha)

```tsx
{/* Mobile Layout - shown only on mobile */}
<div className="flex md:hidden items-center gap-2">
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon">
        <Menu className="h-5 w-5" />
      </Button>
    </SheetTrigger>
    {/* ... Sheet content igual ... */}
  </Sheet>
</div>
```

**Elementos a ocultar en móvil (con `hidden md:flex`):**
- Navegación central (textos)
- Separadores verticales
- Admin link inline
- Save status inline
- User dropdown con ChevronDown

**Elementos a mostrar en móvil:**
- Logo (siempre visible)
- Botón hamburguesa (abre Sheet con navegación completa)

---

#### 5. Sheet Móvil (Mantener igual)

El Sheet actual ya está bien diseñado con:
- Header con título "Menú"
- Links de navegación con iconos
- Footer con avatar y logout

Solo asegurar que el avatar NO aparezca duplicado en el header móvil.

---

### Especificaciones de los Separadores

```tsx
// Separador vertical sutil
<div className="h-6 w-px bg-border/60" />
```

| Propiedad | Valor |
|-----------|-------|
| Alto | `h-6` (24px) |
| Ancho | `w-px` (1px) |
| Color | `bg-border/60` (gris muy sutil) |
| Margin | `mx-4` (16px a cada lado) |
| Visibilidad | `hidden md:block` |

---

### Archivo a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/AuthenticatedHeader.tsx` | Reestructurar layout, añadir separadores, convertir links a Button ghost, limpiar móvil |

---

### Resultado Final

**Desktop:**
- Logo | Separador | [Mi Perfil] [Startups] [Herramientas] [Build Log] | Separador | [Admin?] [Avatar ▼]
- Botones ghost con hover sutil
- Separadores visuales que organizan las zonas

**Móvil:**
- Logo | [☰ Hamburguesa]
- Sin textos apretados
- Navegación completa dentro del Sheet lateral

