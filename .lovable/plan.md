

# Plan: Corregir Colores de la Página /me

## Problema Actual

La página `/me` usa `bg-background` que está configurado globalmente como azul (#3D5AFE). Esto se ve mal para un dashboard de edición donde el usuario necesita concentrarse en formularios.

## Solución

Aplicar colores específicos en `MeLayout.tsx` para sobrescribir el fondo global, usando:
- **Fondo principal**: Blanco (`bg-white`)
- **Header**: Blanco con borde sutil
- **Formularios**: Fondos blancos con inputs de bordes grises claros
- **Preview sidebar**: Mantener con fondo card (oscuro) para contraste

## Cambios a Realizar

### 1. `src/components/me/MeLayout.tsx`

```tsx
// Cambiar:
<div className="min-h-screen bg-background">

// Por:
<div className="min-h-screen bg-white">

// Header también blanco:
<header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
  <a href="/" className="text-lg font-semibold text-[#1c1c1c] hover:text-[#3D5AFE]">

// Textos del save status en colores oscuros:
<span className="text-gray-500">Guardando...</span>
<span className="text-gray-500 hidden sm:inline">Guardado</span>
```

### 2. `src/components/me/MeTabs.tsx`

Ajustar colores para fondo blanco:
- Tabs inactivos: texto gris oscuro
- Tab activo: fondo azul (#3D5AFE), texto blanco
- Borde contenedor: gris claro

### 3. `src/components/me/ProfileTab.tsx`

- Labels: color `#1c1c1c`
- Inputs: borde gris claro, fondo blanco
- Placeholders: gris medio
- Separadores: gris claro

### 4. Otros componentes del tab

Aplicar la misma paleta de colores claros:
- `AppsTab.tsx`
- `AppCard.tsx`
- `AppEditor.tsx`
- `BrandingTab.tsx`
- `FontSelector.tsx`
- `ColorPicker.tsx`
- `CardStyleSelector.tsx`

## Paleta de Colores para /me

| Elemento | Color |
|----------|-------|
| Fondo página | `#FFFFFF` (blanco) |
| Fondo header | `#FFFFFF` |
| Bordes | `#E5E7EB` (gray-200) |
| Títulos/Labels | `#1c1c1c` |
| Texto secundario | `#6B7280` (gray-500) |
| Placeholders | `#9CA3AF` (gray-400) |
| Input focus ring | `#3D5AFE` |
| Botones primarios | `#3D5AFE` |
| Preview sidebar | Mantener bg-card (oscuro para contraste) |

## Resultado Visual

```text
┌──────────────────────────────────────────────────────────────────┐
│  vibecoders                                    ✓ Guardado  @user │  ← Header blanco
├──────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐                     │
│ │   Perfil   │   Apps   │   Branding   │                     │  ← Tabs sobre blanco
│ └──────────────────────────────────────────┘                     │
│                                                                   │
│  ┌─────────────────────────────┐    ┌─────────────────────────┐ │
│  │                             │    │                         │ │
│  │   FORMULARIOS               │    │   PREVIEW               │ │
│  │   (fondo blanco,            │    │   (fondo oscuro         │ │
│  │    texto #1c1c1c,           │    │    para contraste)      │ │
│  │    inputs con borde gris)   │    │                         │ │
│  │                             │    │                         │ │
│  └─────────────────────────────┘    └─────────────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
        ↑ Fondo blanco #FFFFFF
```

## Instrucciones para Login con Google en Preview

Para probar la página `/me`:

1. Abre el preview en una pestaña nueva del navegador
2. Ve a la landing page (`/`)
3. Haz clic en el botón de unirse/login que abre el modal
4. Selecciona "Iniciar sesión con Google"
5. Autoriza con tu cuenta de Gmail
6. Serás redirigido a `/profile`
7. Navega manualmente a `/me` en la barra de direcciones

**Nota**: Asegúrate de que en Supabase Dashboard > Authentication > URL Configuration:
- Site URL: `https://id-preview--d38deb66-1267-457d-ba0e-c6a4c8c7efcf.lovable.app`
- Redirect URLs incluya el mismo URL

