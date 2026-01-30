
# Plan: Rediseño de navegación de usuario y página de perfil

## Resumen
Se implementará un menú de usuario en la esquina superior derecha que muestra la foto de perfil cuando el usuario está logueado, con opciones contextuales según la página actual. Además, se rediseñará la página de perfil para eliminar los colores naranjas y usar el esquema azul (#3D5AFE) del sitio.

---

## Cambios a realizar

### 1. Crear componente UserMenu
Un nuevo componente que mostrará la foto del usuario en la esquina superior derecha con un menú desplegable:

- **En la landing (/)**: Opciones "Mi Perfil" y "Cerrar Sesión"
- **En el perfil (/profile)**: Opciones "Volver al Inicio" y "Cerrar Sesión"

El componente usará:
- `useAuth` para obtener datos del usuario
- `useLocation` de react-router para saber en qué página está
- `DropdownMenu` de Radix UI (ya disponible)
- `Avatar` para mostrar la foto

### 2. Integrar UserMenu en HeroSection
Agregar el menú de usuario en posición absoluta (top-right) dentro del Hero, visible solo cuando hay sesión activa.

### 3. Rediseñar página Profile
Cambios de estilo:
- **Fondo**: De gradiente naranja a blanco (`bg-white`)
- **Card del perfil**: Fondo azul sólido (`bg-[#3D5AFE]`)
- **Textos**: Todo en blanco sobre el card azul
- **Eliminar emojis**: Reemplazar "🎉" por icono de Lucide (CheckCircle o similar)
- **Eliminar botones**: Ya no son necesarios porque la navegación está en el UserMenu

### 4. Agregar UserMenu también a la página Profile
Para mantener consistencia, el UserMenu se mostrará en la misma posición en la página de perfil.

---

## Detalles técnicos

### Nuevo archivo: `src/components/UserMenu.tsx`
```text
Estructura:
├── Detecta si hay usuario logueado (useAuth)
├── Detecta página actual (useLocation)
├── Si no hay usuario → no renderiza nada
├── Si hay usuario → Avatar clickeable con DropdownMenu
    ├── Landing page:
    │   ├── "Mi Perfil" → navega a /profile
    │   └── "Cerrar Sesión" → signOut + navega a /
    └── Profile page:
        ├── "Volver al Inicio" → navega a /
        └── "Cerrar Sesión" → signOut + navega a /
```

### Modificaciones en `src/components/HeroSection.tsx`
- Importar y renderizar `<UserMenu />` en posición `fixed top-4 right-4 z-50`

### Modificaciones en `src/pages/Profile.tsx`
- Cambiar fondo de `bg-gradient-to-br from-[#FF6B35] via-[#FF8C42] to-[#FFA062]` a `bg-white`
- Cambiar card de `bg-white/10 backdrop-blur-md` a `bg-[#3D5AFE]`
- Mantener textos en `text-white` (funcionan sobre azul)
- Reemplazar emoji "🎉" por icono `<CheckCircle />` de Lucide
- Eliminar los botones de navegación (div con flex-col gap-3)
- Agregar `<UserMenu />` en posición fija
- Cambiar estado de carga para usar fondo blanco

### Iconos a usar (Lucide)
- `User` → Opción "Mi Perfil"
- `ArrowLeft` → Opción "Volver al Inicio"
- `LogOut` → Opción "Cerrar Sesión"
- `CheckCircle` → Reemplaza el emoji en el mensaje de confirmación

---

## Resultado esperado

**Antes (actual)**:
- Página de perfil con fondo naranja agresivo
- Botones de navegación dentro del card
- Sin indicador de usuario logueado en la landing

**Después**:
- Menú de usuario elegante en esquina superior derecha (ambas páginas)
- Página de perfil con fondo blanco limpio y card azul consistente con la marca
- Navegación unificada a través del avatar
- Sin emojis, solo iconos de Lucide
