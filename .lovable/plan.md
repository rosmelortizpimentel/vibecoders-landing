
## Plan: Mejoras Avanzadas para Admin/Users y Admin/Waitlist

### Resumen de Cambios Solicitados

1. **UsersManager**: Mostrar indicador de waitlist, email, botón de correo masivo
2. **Ambas páginas**: Ordenamiento por columnas (asc/desc), búsqueda, contador de registros
3. **UsersManager**: Gráfico de tendencia de registros diarios

---

### Sección Técnica

#### 1. Nueva Edge Function: `admin-users-list`

Necesitamos crear una edge function porque:
- Los emails de usuarios están en `auth.users` (no accesible desde frontend)
- Necesitamos verificar si cada usuario está en la waitlist

```text
Endpoint: admin-users-list
Entrada: Authorization header (Bearer token)
Salida: Array de usuarios con:
  - id, name, username, avatar_url, created_at
  - email (desde auth.users)
  - isOnWaitlist (boolean)
  - followersCount, followingCount
```

#### 2. Componente Reutilizable: `SortableTable`

Para evitar duplicación de código, crearemos un hook `useSortableData` que maneje:

| Funcionalidad | Tipo de Campo |
|---------------|---------------|
| Texto | Ordenamiento alfabético (localeCompare) |
| Número | Ordenamiento numérico |
| Fecha | Ordenamiento por timestamp |

```typescript
// Hook signature
useSortableData<T>(
  data: T[],
  defaultSort: { key: keyof T; direction: 'asc' | 'desc' }
)
```

#### 3. Cambios en UsersManager

| Elemento | Cambio |
|----------|--------|
| Columna Usuario | Nombre, @username, email (texto pequeño) |
| Nueva columna | Badge "Waitlist" si está en la lista |
| Toolbar | Input de búsqueda + Botón "Enviar correo a todos" |
| Header columnas | Clickeable para ordenar con indicador ↑/↓ |
| Footer | Gráfico AreaChart con registros por día |

#### 4. Cambios en WaitlistManager

| Elemento | Cambio |
|----------|--------|
| Toolbar | Input de búsqueda (ya tiene botón email) |
| Header columnas | Clickeable para ordenar con indicador ↑/↓ |
| Contador | Ya existe, verificar consistencia |

#### 5. Gráfico de Tendencia (Recharts)

Usaremos `AreaChart` de recharts (ya instalado):

```typescript
// Estructura de datos
interface DailyRegistration {
  date: string; // "2025-02-01"
  count: number;
}
```

El gráfico mostrará los últimos 30 días de registros.

---

### Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `supabase/functions/admin-users-list/index.ts` | Edge function para obtener usuarios con emails y estado waitlist |
| `src/hooks/useSortableData.ts` | Hook reutilizable para ordenamiento |
| `src/components/admin/RegistrationTrendChart.tsx` | Componente del gráfico de tendencia |

### Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/admin/UsersManager.tsx` | Usar edge function, agregar columnas, búsqueda, ordenamiento, gráfico |
| `src/components/admin/WaitlistManager.tsx` | Agregar búsqueda y ordenamiento por columnas |
| `src/i18n/es/admin.json` | Nuevas traducciones |
| `src/i18n/en/admin.json` | Nuevas traducciones |

---

### Nuevas Traducciones Necesarias

```json
{
  "searchPlaceholder": "Buscar...",
  "emailAll": "Enviar correo a todos",
  "onWaitlist": "En Waitlist",
  "registrationTrend": "Tendencia de Registros",
  "last30Days": "Últimos 30 días",
  "registrations": "Registros",
  "sortAsc": "Ordenar ascendente",
  "sortDesc": "Ordenar descendente"
}
```

---

### Diagrama de Flujo: Obtención de Datos de Usuarios

```text
┌─────────────────┐     ┌──────────────────────┐
│  UsersManager   │────▶│  admin-users-list    │
│  (Frontend)     │     │  (Edge Function)     │
└─────────────────┘     └──────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              ┌──────────┐  ┌───────────┐  ┌───────────┐
              │auth.users│  │ profiles  │  │ waitlist  │
              │ (emails) │  │(usernames)│  │(check if  │
              └──────────┘  └───────────┘  │ on list)  │
                    │              │       └───────────┘
                    └──────────────┴──────────────┘
                                   │
                                   ▼
                        ┌──────────────────┐
                        │  Respuesta JSON  │
                        │  con datos       │
                        │  enriquecidos    │
                        └──────────────────┘
```

---

### Orden de Implementación

1. Crear edge function `admin-users-list`
2. Crear hook `useSortableData`
3. Crear componente `RegistrationTrendChart`
4. Actualizar traducciones
5. Modificar `UsersManager` con todas las mejoras
6. Modificar `WaitlistManager` con búsqueda y ordenamiento
7. Desplegar y probar
