
# Plan: Rediseño Premium de Tabs (Segmented Control)

## Objetivo

Transformar los tabs actuales en un control segmentado moderno estilo Linear/Apple con una estética premium y minimalista.

---

## Diseño Actual vs. Nuevo

| Aspecto | Actual | Nuevo |
|---------|--------|-------|
| Contenedor | `flex-1` ancho completo, borde visible | `w-fit` compacto, pill-shaped, sin borde |
| Fondo contenedor | `bg-gray-100` con `border-gray-200` | `bg-slate-100` sutil, sin borde |
| Tab activo | Bloque azul sólido `bg-[#3D5AFE]` | Píldora blanca flotante con `shadow-sm` |
| Texto activo | Blanco | Oscuro `text-slate-900` con icono azul |
| Tab inactivo | Fondo gris hover | Sin fondo, texto sutil `text-slate-500` |
| Forma | `rounded-lg` | `rounded-full` (píldora) |

---

## Cambios en `src/components/me/MeTabs.tsx`

### Contenedor Principal
```tsx
<div className="inline-flex gap-1 p-1.5 bg-slate-100/80 rounded-full">
```
- `inline-flex` en lugar de `flex` para ajuste automático
- `rounded-full` para forma de píldora
- `bg-slate-100/80` para fondo sutil semi-transparente
- Sin borde

### Tab Activo
```tsx
isActive
  ? 'bg-white text-slate-900 shadow-sm font-medium'
  : 'text-slate-500 hover:text-slate-700'
```
- Fondo blanco con sombra suave
- Texto oscuro profesional
- Sin el azul sólido

### Icono Dinámico
```tsx
<Icon className={cn(
  "h-4 w-4 transition-colors",
  isActive ? "text-[#3D5AFE]" : "text-slate-400"
)} />
```
- Icono azul solo cuando está activo
- Gris sutil cuando está inactivo

### Transiciones Suaves
```tsx
className={cn(
  'flex items-center justify-center gap-2 px-5 py-2 rounded-full text-sm transition-all duration-200',
  // ... estados
)}
```
- `transition-all duration-200` para animación fluida
- `px-5 py-2` para padding cómodo
- `rounded-full` para cada tab

---

## Código Final Propuesto

```tsx
export function MeTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const activeTab = tabs.find(tab => location.pathname === tab.path)?.id || 'profile';

  return (
    <div className="inline-flex gap-1 p-1.5 bg-slate-100/80 rounded-full">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={cn(
              'flex items-center justify-center gap-2 px-5 py-2 rounded-full text-sm transition-all duration-200',
              isActive
                ? 'bg-white text-slate-900 shadow-sm font-medium'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Icon className={cn(
              "h-4 w-4 transition-colors",
              isActive ? "text-[#3D5AFE]" : "text-slate-400 group-hover:text-slate-500"
            )} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
```

---

## Resultado Visual Esperado

```text
┌─────────────────────────────────────────────────┐
│  Fondo gris muy sutil (slate-100/80)            │
│  ┌─────────────────┐                            │
│  │ 🔵 Perfil       │  Apps      Branding        │
│  │ (píldora blanca │  (gris)    (gris)          │
│  │  con sombra)    │                            │
│  └─────────────────┘                            │
└─────────────────────────────────────────────────┘
```

- Control compacto centrado (no ocupa todo el ancho)
- El tab activo "flota" visualmente sobre el fondo
- Transición suave al cambiar de tab
- Iconos con colores dinámicos (azul activo, gris inactivo)

---

## Archivo a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/me/MeTabs.tsx` | Rediseño completo de estilos |
