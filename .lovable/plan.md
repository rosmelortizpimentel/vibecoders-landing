

## Cambios en Branding y Configuracion del Roadmap

### Resumen

Se reorganizan los paneles laterales de Branding y Configuracion para mejorar la experiencia. Branding pierde el campo "Titulo Personalizado" y gana el selector de idioma. Configuracion pasa de ser un Dialog centrado a un Sheet lateral derecho, con los switches de visibilidad al inicio y el modo de participacion condicionado al feedback publico. Se eliminan emojis de toda la interfaz.

---

### 1. Panel Branding (RoadmapEditor.tsx)

**Quitar**: El campo "Titulo Personalizado" (lineas 767-774 del Sheet de Branding).

**Agregar en su lugar**: Un selector de idioma por defecto (combo con ES, EN, FR, PT -- sin opcion "Auto Browser"). El valor por defecto se toma del idioma del perfil del usuario logueado.

El orden final del panel Branding sera:
1. Idioma por defecto (Select)
2. Fuente (FontSelector)
3. Favicon (Upload)
4. Separador
5. Colores de Columnas

Se necesita leer `profiles.language` del usuario actual para pre-seleccionar el idioma cuando `default_language` esta vacio/null.

El `settingsForm` ya no tendra `custom_title`, sino `default_language`.

---

### 2. Panel Configuracion: de Dialog a Sheet lateral

**Archivo**: `src/pages/MyAppHub.tsx`

Cambiar el `Dialog` actual (lineas 340-414) a un `Sheet` con `side="right"` (igual que el de Branding). Contenido reorganizado:

**Seccion 1: Visibilidad** (switches al inicio, con fondo suave como en la imagen de referencia)
- Switch "Roadmap Publico" con descripcion corta
- Switch "Feedback Publico" con descripcion corta

**Seccion 2: Modo de Participacion** (solo visible si Feedback Publico esta activado)
- Radio cards (sin emojis):
  - "Usuarios Anonimos" - "Cualquiera puede votar y enviar feedback sin iniciar sesion"
  - "Usuarios Autenticados" - "Los usuarios deben iniciar sesion con Google o LinkedIn para participar"

**Quitar**: La seccion de idioma del popup de Settings (se movio a Branding). Quitar la opcion "Auto (Browser)" del combo de idioma.

**Quitar emojis**: Reemplazar los emojis en el toolbar (lineas 250-251) y en el dialog de settings (lineas 366, 380) por texto plano o iconos Lucide (User, Lock).

---

### 3. Toolbar: Limpiar emojis

En `MyAppHub.tsx`, el indicador inline del auth mode (linea 249-252) usa emojis. Reemplazar:
- `'👤 Anon'` por icono User de Lucide + texto
- `'🔒 Login'` por icono Lock de Lucide + texto

---

### 4. Quitar switches duplicados del toolbar

Como los switches de visibilidad ahora estan dentro del Sheet de Configuracion, **removerlos del toolbar principal** para evitar duplicacion. El toolbar quedara solo con los botones: Branding, Configuracion, y Ver Publico (si aplica).

---

### Archivos a modificar

| Archivo | Cambios |
|---------|---------|
| `src/pages/RoadmapEditor.tsx` | Reemplazar campo "Titulo Personalizado" por selector de idioma. Actualizar settingsForm para incluir default_language en lugar de custom_title. Leer idioma del perfil del usuario. |
| `src/pages/MyAppHub.tsx` | Convertir Dialog de Settings a Sheet lateral. Mover switches de visibilidad dentro del Sheet. Agregar seccion condicional de participacion. Limpiar emojis. Simplificar toolbar. |
| `src/i18n/en/roadmap.json` | Agregar claves para las nuevas etiquetas de visibilidad |
| `src/i18n/es/roadmap.json` | Idem |
| `src/i18n/fr/roadmap.json` | Idem |
| `src/i18n/pt/roadmap.json` | Idem |

### Detalle tecnico: Estructura del Sheet de Configuracion

```text
+------------------------------------------+
| Settings                            [X]  |
|                                          |
| VISIBILIDAD                              |
| +--------------------------------------+ |
| | Roadmap Publico              [====]  | |
| | Cualquiera con el link puede verlo   | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | Feedback Publico             [====]  | |
| | Cualquiera puede enviar feedback     | |
| +--------------------------------------+ |
|                                          |
| --- (si feedback publico activo) ---     |
|                                          |
| MODO DE PARTICIPACION                    |
| +--------------------------------------+ |
| | (o) Usuarios Anonimos               | |
| |     Sin inicio de sesion requerido   | |
| +--------------------------------------+ |
| | ( ) Usuarios Autenticados            | |
| |     Google o LinkedIn requerido      | |
| +--------------------------------------+ |
|                                          |
|          [Cancelar]  [Guardar]           |
+------------------------------------------+
```

### Detalle tecnico: Panel Branding actualizado

```text
+------------------------------------------+
| Branding                            [X]  |
|                                          |
| IDIOMA POR DEFECTO                       |
| [Espanol v]                              |
|                                          |
| FUENTE                                   |
| [Roboto v]                               |
|                                          |
| FAVICON                                  |
| [icon] Upload favicon                    |
|                                          |
| ---                                      |
| COLORES DE COLUMNAS                      |
| Backlog                        [green]   |
| Planned                        [blue]    |
| In Progress                    [orange]  |
| Done                           [teal]    |
|                                          |
|          [Cancelar]  [Guardar]           |
+------------------------------------------+
```

