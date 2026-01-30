

# Plan: Actualizar Estilos del Modal de Waitlist

## Cambios Requeridos

### 1. Archivo: `src/components/WaitlistSuccessModal.tsx`

**Cambios de estilo en el modal:**

| Elemento | Actual | Nuevo |
|----------|--------|-------|
| Fondo del modal | `bg-background` (azul) | `bg-[#1c1c1c]` |
| Color de texto título | `text-foreground` | `text-white` |
| Color de texto subtítulo | `text-muted-foreground` | `text-white/80` |
| Botón X cerrar | `text-muted-foreground` | `text-white/60 hover:text-white` |
| Botón Google fondo | `bg-primary` (violeta) | `bg-white hover:bg-gray-100` |
| Botón Google texto | `text-primary-foreground` | `text-[#1c1c1c]` |
| Logo Google | Monocromático (`currentColor`) | Colores originales (azul, rojo, amarillo, verde) |

**Agregar ícono Lucide:**
- Importar `PartyPopper` de lucide-react para el mensaje de éxito
- Importar `CheckCircle` de lucide-react para el mensaje de "ya registrado"
- Mostrar el ícono encima del título

### 2. Archivo: `src/i18n/es/waitlist.json`

**Eliminar emojis de los textos:**

| Campo | Actual | Nuevo |
|-------|--------|-------|
| success.title | `¡Genial! Te avisaremos cuando esté listo. 🎉` | `¡Genial! Te avisaremos cuando esté listo.` |
| alreadyRegistered.title | `¡Ya estás en la lista! 🙌` | `¡Ya estás en la lista!` |

## Resultado Visual Esperado

```text
┌─────────────────────────────────────┐
│                              [X]    │  ← Botón cerrar blanco
│                                     │
│            [PartyPopper]            │  ← Ícono Lucide (éxito)
│                                     │     o [CheckCircle] (ya registrado)
│   ¡Genial! Te avisaremos cuando     │  ← Texto blanco
│         esté listo.                 │
│                                     │
│   ¿Quieres ir reservando tu         │  ← Texto blanco/80
│      nombre de usuario?             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [G]  Continuar con Google  │   │  ← Botón blanco
│  └─────────────────────────────┘   │     Logo Google a colores
│                                     │
└─────────────────────────────────────┘
         Fondo: #1c1c1c
```

## Detalles Técnicos

### Logo de Google con colores originales

Se actualizará el SVG para usar los colores oficiales de Google:
- Azul: `#4285F4`
- Verde: `#34A853`
- Amarillo: `#FBBC05`
- Rojo: `#EA4335`

### Íconos Lucide a usar

- `PartyPopper`: Para celebrar el registro exitoso (reemplaza 🎉)
- `CheckCircle`: Para indicar que ya está registrado (reemplaza 🙌)

