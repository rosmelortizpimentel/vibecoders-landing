
# Plan: Corregir Perfil y Rediseñar Redes Sociales

## Problemas Identificados

1. **Nombre y avatar no cargan**: Los datos de Google (`user_metadata.full_name`, `user_metadata.avatar_url`) no se están usando como valores por defecto
2. **Redes sociales muestran inputs vacíos**: Diseño actual muestra todos los campos aunque estén vacíos. La referencia muestra iconos clickeables que se expanden solo al seleccionar
3. **Botones con texto gris ilegible**: Los botones azules tienen texto gris plomo difícil de leer. Debe ser blanco

---

## Cambios a Realizar

### 1. `src/hooks/useProfileEditor.ts` - Usar datos de Google

Modificar el hook para:
- Acceder a `user.user_metadata` de Supabase Auth
- Si `profile.name` está vacío, usar `user_metadata.full_name`
- Si `profile.avatar_url` está vacío, usar `user_metadata.avatar_url` (foto de Google)

```typescript
// En fetchProfile(), después de obtener data:
const googleName = user.user_metadata?.full_name;
const googleAvatar = user.user_metadata?.avatar_url;

setProfile({
  ...DEFAULT_PROFILE,
  ...data,
  // Usar datos de Google si no hay datos en DB
  name: data.name || googleName || null,
  avatar_url: data.avatar_url || googleAvatar || null,
} as ProfileData);
```

### 2. `src/components/me/ProfileSocials.tsx` - Rediseño completo

Nuevo diseño basado en la referencia:
- **Fila de iconos**: Mostrar todos los iconos de redes en fila horizontal
- **Estado visual**: 
  - Icono gris = sin datos
  - Icono con check verde = tiene datos
  - Icono seleccionado = fondo rosa/magenta (activo para editar)
- **Input expandible**: Solo mostrar el input cuando se selecciona un icono
- **Botón eliminar**: Trash icon para borrar el valor

Estructura del componente:
```
┌──────────────────────────────────────────────────────────────┐
│  [🐦] [🐙] [♪] [📷] [▶] [in] [✉]                            │  ← Iconos clickeables
│                                                              │
│  Twitter                                                     │
│  ┌────────────────────────────────────────────────┐  [🗑]   │  ← Input + delete
│  │ https://twitter.com/usuario                     │         │
│  └────────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────────┘
```

Estados de los iconos:
- Sin valor: fondo gris claro (`bg-gray-100`)
- Con valor guardado: fondo gris con check overlay
- Seleccionado/activo: fondo magenta (`bg-[#E91E63]`) con icono blanco

### 3. `src/components/me/MeTabs.tsx` - Texto blanco en botones

El botón activo ya tiene `text-white`, pero revisar que se aplique correctamente.

### 4. Otros componentes - Verificar colores de botones

Revisar que todos los botones con fondo azul (`bg-[#3D5AFE]`) tengan texto blanco (`text-white`).

---

## Diseño Visual de ProfileSocials

```
ANTES (actual):
┌────────────────────────────────────────┐
│ [🐦] │ @usuario                    │   │ ← Siempre visible
│ [🐙] │ username                    │   │
│ [♪]  │ @usuario                    │   │
│ ...todos los campos...                 │
└────────────────────────────────────────┘

DESPUÉS (referencia):
┌────────────────────────────────────────┐
│ [🐦✓] [🐙] [♪✓] [📷] [▶] [in] [✉]     │ ← Solo iconos
│                                        │   (check si tiene valor)
│ Twitter                                │
│ ┌──────────────────────────────┐ [🗑] │ ← Solo el seleccionado
│ │ https://twitter.com/user     │      │
│ └──────────────────────────────┘      │
└────────────────────────────────────────┘
```

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/hooks/useProfileEditor.ts` | Usar `user_metadata` para name y avatar por defecto |
| `src/components/me/ProfileSocials.tsx` | Rediseño completo: iconos + input expandible |
| `src/components/me/MeTabs.tsx` | Verificar `text-white` en botón activo |

---

## Flujo de Usuario - Redes Sociales

1. Usuario ve fila de iconos de redes sociales
2. Iconos con datos tienen un check o indicador visual
3. Al hacer clic en un icono:
   - Se selecciona (fondo magenta)
   - Aparece input debajo con el label de la red
   - Si ya tiene valor, se muestra para editar
   - Botón de eliminar (trash) a la derecha
4. Al escribir, se auto-guarda con debounce
5. Al hacer clic en trash, se borra el valor
6. Al hacer clic en otro icono, cambia la selección
