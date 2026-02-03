
# Plan: Reorganizar Header Autenticado

## Resumen
Mover el link de "Mi Perfil" del menú desplegable al header principal como parte de la navegación central, agregar iconos a todos los links de navegación en desktop, y asegurar que Build Log sea visible para usuarios en la waitlist.

## Cambios a realizar

### 1. Actualizar navegación en AuthenticatedHeader.tsx

**Agregar "Mi Perfil" a la navegación central:**
- Añadir un nuevo link al inicio del array `navLinks` con path `/me`, label `Mi Perfil` e icono `User`

**Mostrar iconos en desktop:**
- Modificar el renderizado de los links de navegación en desktop para incluir los iconos (actualmente solo se muestran en móvil)
- Los iconos serán: User para Mi Perfil, Rocket para Startups, Wrench para Herramientas, y Crown/Sparkles para Build Log

**Actualizar el dropdown del usuario:**
- Remover la opción "Mi Perfil" del dropdown ya que ahora estará en la navegación principal
- Mantener solo "Ver Perfil Público" y "Cerrar Sesión"

**Cambiar icono de Build Log:**
- Cambiar el icono de `Sparkles` a `Crown` con color amber para indicar contenido exclusivo/premium

---

## Detalles Técnicos

### Archivo: `src/components/AuthenticatedHeader.tsx`

**1. Importar iconos adicionales:**
```tsx
import { User, Crown } from 'lucide-react';
```

**2. Actualizar array navLinks (línea ~71-75):**
```tsx
const navLinks = [
  { path: '/me', label: 'Mi Perfil', icon: User },
  { path: '/startups', label: 'Startups', icon: Rocket },
  { path: '/tools', label: 'Herramientas', icon: Wrench },
  ...(isInWaitlist ? [{ path: '/buildlog', label: 'Build Log', icon: Crown, premium: true }] : []),
];
```

**3. Modificar navegación desktop (líneas ~93-110) para mostrar iconos:**
```tsx
{!isMobile && (
  <nav className="flex items-center gap-6 sm:gap-8">
    {navLinks.map((link) => {
      const Icon = link.icon;
      return (
        <Link
          key={link.path}
          to={link.path}
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium transition-colors",
            isActive(link.path)
              ? "text-[#3D5AFE] font-semibold"
              : "text-gray-600 hover:text-[#3D5AFE]"
          )}
        >
          <Icon className={cn(
            "h-4 w-4",
            link.premium && "text-amber-400"
          )} />
          {link.label}
        </Link>
      );
    })}
  </nav>
)}
```

**4. Remover "Mi Perfil" del dropdown (líneas ~166-171):**
Eliminar el DropdownMenuItem que enlaza a `/me/profile`, dejando solo:
- Ver Perfil Público
- Cerrar Sesión

---

## Resultado Visual

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [Logo]    👤Mi Perfil  🚀Startups  🔧Herramientas  👑Build Log    [Avatar] │
│                                                              ├──────────┤
│                                                              │Ver Público│
│                                                              │Cerrar Ses.│
│                                                              └──────────┘
└────────────────────────────────────────────────────────────────────────┘
```

El icono de Crown (👑) tendrá color amber para destacar el contenido premium/exclusivo.
