

# Plan: Sistema Admin y Primer Showcase

## Resumen

Este plan implementa tres componentes principales:
1. **Sistema de roles** con tabla `user_roles` (por defecto USER, ADMIN asignable manualmente)
2. **Bucket de storage** para assets del showcase
3. **Panel de administración** en `/admin` con gestión de showcases
4. **Inserción del primer proyecto** (aiselfi.es)

---

## 1. Base de Datos

### 1.1 Tabla `user_roles`

```sql
-- Crear enum para roles
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

-- Crear tabla de roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Política: usuarios pueden ver sus propios roles
CREATE POLICY "Users can view own roles" 
  ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id);
```

### 1.2 Función `has_role` (Security Definer)

```sql
-- Función para verificar roles sin recursión RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

### 1.3 Bucket de Storage

```sql
-- Crear bucket público para showcase
INSERT INTO storage.buckets (id, name, public)
VALUES ('showcase-assets', 'showcase-assets', true);

-- Política: cualquiera puede leer
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'showcase-assets');

-- Política: solo admins pueden subir/modificar
CREATE POLICY "Admins can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'showcase-assets' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'showcase-assets' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'showcase-assets' 
  AND public.has_role(auth.uid(), 'admin')
);
```

### 1.4 Políticas adicionales para `showcase_gallery`

```sql
-- Solo admins pueden insertar
CREATE POLICY "Admins can insert showcase" 
ON public.showcase_gallery FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Solo admins pueden actualizar
CREATE POLICY "Admins can update showcase" 
ON public.showcase_gallery FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Solo admins pueden eliminar
CREATE POLICY "Admins can delete showcase" 
ON public.showcase_gallery FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));
```

---

## 2. Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/hooks/useUserRole.ts` | Crear | Hook para verificar si el usuario es admin |
| `src/pages/Admin.tsx` | Crear | Layout principal del panel admin |
| `src/components/admin/AdminLayout.tsx` | Crear | Layout con sidebar |
| `src/components/admin/AdminSidebar.tsx` | Crear | Menú lateral de navegación |
| `src/components/admin/ShowcaseManager.tsx` | Crear | CRUD de showcases |
| `src/components/admin/ShowcaseForm.tsx` | Crear | Formulario para crear/editar showcase |
| `src/components/me/MeHeader.tsx` | Modificar | Agregar link "Admin" condicional |
| `src/App.tsx` | Modificar | Agregar ruta `/admin/*` |

---

## 3. Arquitectura de Componentes

### 3.1 Layout Admin

```text
┌──────────────────────────────────────────────────────────────────┐
│  MeHeader (con link Admin visible solo para admins)              │
├─────────────┬────────────────────────────────────────────────────┤
│             │                                                    │
│   Sidebar   │              Contenido Principal                   │
│   ┌───────┐ │   ┌────────────────────────────────────────────┐   │
│   │Showcase│ │   │  Gestión de Showcases                     │   │
│   │   •    │ │   │  ┌──────────────────────────────────────┐ │   │
│   │(futuro)│ │   │  │ [+ Nuevo Showcase]                   │ │   │
│   │   •    │ │   │  ├──────────────────────────────────────┤ │   │
│   └───────┘ │   │  │ Lista de proyectos editables         │ │   │
│             │   │  │ - aiselfi.es [Editar] [Eliminar]     │ │   │
│             │   │  │ - ...                                 │ │   │
│             │   │  └──────────────────────────────────────┘ │   │
│             │   └────────────────────────────────────────────┘   │
└─────────────┴────────────────────────────────────────────────────┘
```

### 3.2 Hook `useUserRole`

```typescript
// Verifica rol del usuario usando la función has_role de Supabase
export function useUserRole() {
  // Llama a supabase.rpc('has_role', { _user_id, _role: 'admin' })
  // Retorna { isAdmin, loading }
}
```

### 3.3 Protección de Ruta

El componente `Admin.tsx` verificará el rol y redirigirá a `/` si no es admin.

---

## 4. Link Condicional en Header

En `MeHeader.tsx`, se agregará un link "Admin" que:
- Solo se renderiza si `isAdmin === true`
- Usa un icono de Settings o Shield
- Navega a `/admin`

```text
┌──────────────────────────────────────────────────────────────────┐
│ [Logo]                    [Admin] [✓ Guardado] [Avatar ▼]        │
└──────────────────────────────────────────────────────────────────┘
                              ↑
                     Solo visible para admins
```

---

## 5. Gestión de Showcases (CRUD)

### 5.1 ShowcaseManager

Lista todos los showcases con opciones para:
- Ver (link externo)
- Editar (abre formulario)
- Eliminar (con confirmación)
- Cambiar orden (drag & drop o flechas)
- Toggle activo/inactivo

### 5.2 ShowcaseForm

Formulario con los campos:
- Título del proyecto
- Tagline
- URL del proyecto
- Thumbnail (upload a Supabase Storage)
- Nombre del autor
- Avatar del autor (upload)
- LinkedIn, Twitter, Website del autor
- Orden de visualización
- Estado activo/inactivo

---

## 6. Inserción del Primer Showcase

Una vez implementado el sistema, se insertarán los datos del proyecto aiselfi.es:

1. **Subir imágenes al bucket `showcase-assets`**:
   - `aiselfi-og.png` → Thumbnail
   - `aiselfies_logo.webp` → Avatar del autor

2. **Insertar registro en `showcase_gallery`**:
   - project_title: "aiselfi.es"
   - project_tagline: "Fotos profesionales en minutos, no días"
   - project_url: "https://aiselfi.es/?ref=vibecoders.la"
   - author_name: "Jon Kraayenbrink"
   - author_linkedin: "https://www.linkedin.com/in/jonathan-kraayenbrink/"
   - display_order: 1
   - is_active: true

---

## Sección Técnica

### Estructura de Archivos Final

```
src/
├── hooks/
│   └── useUserRole.ts          # Hook para verificar rol admin
├── pages/
│   └── Admin.tsx               # Página principal admin
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx     # Layout con header + sidebar
│   │   ├── AdminSidebar.tsx    # Menú lateral
│   │   ├── ShowcaseManager.tsx # Lista y gestión de showcases
│   │   └── ShowcaseForm.tsx    # Formulario crear/editar
│   └── me/
│       └── MeHeader.tsx        # Modificado: link Admin condicional
```

### Rutas

```tsx
// En App.tsx
<Route path="/admin" element={<Admin />}>
  <Route index element={<Navigate to="/admin/showcase" replace />} />
  <Route path="showcase" element={<ShowcaseManager />} />
</Route>
```

### Seguridad

- La verificación de admin se hace server-side con RLS y `has_role()`
- El frontend solo muestra/oculta UI, pero el backend rechaza operaciones no autorizadas
- Los roles se asignan manualmente en la tabla `user_roles` desde Supabase Dashboard

### Orden de Implementación

1. Migración SQL: crear `user_roles`, función `has_role`, bucket, políticas
2. Crear hook `useUserRole`
3. Crear estructura de componentes admin
4. Modificar `MeHeader` con link condicional
5. Agregar rutas en `App.tsx`
6. Subir imágenes del primer showcase
7. Insertar datos del primer showcase

