

## Plan: Mejoras UX "Hablemos" + Fix Bug de Mensajes

### Problema Principal Identificado

El mensaje desaparece porque hay un bug en `useFeedback.ts`:

**Línea 70**: `enabled: !!user?.id && !isAdmin`

Cuando el usuario es admin, la query `userThread` está **deshabilitada**, por lo que:
1. Se crea el thread correctamente
2. Pero `userThread` siempre es `null` porque la query no se ejecuta para admins
3. La query de mensajes usa `userThread?.id` que es `null`
4. Los mensajes no se cargan aunque existan en la DB

### Solución

Remover `&& !isAdmin` de la condición `enabled` para que tanto usuarios regulares como admins puedan ver sus propios threads en la página `/hablemos`.

---

### Mejoras de Diseño Solicitadas

#### 1. Personalidad en Empty State (Oveja Negra)

**Cambio visual**: Reemplazar el ícono genérico de MessageCircle por una oveja estilizada con pose de "escuchando".

**Textos más personalizados**:
- ES: "¿Tienes una idea o encontraste un bug? Soy todo oídos."
- EN: "Got an idea or found a bug? I'm all ears."

#### 2. Anclar el Input Visualmente

Agregar fondo sutil (`bg-muted/30`) y borde superior (`border-t`) a la sección del input para crear separación visual clara entre área de chat y área de escritura.

#### 3. Botón "Let's Talk" en el menú

El botón ya usa `isActive()` para resaltarse solo cuando está en esa ruta. Verificar que funciona correctamente (ya está implementado bien).

#### 4. Previsualización de Adjuntos

Ya está implementado en `ChatInput.tsx` (líneas 65-79) - los thumbnails aparecen encima del input antes de enviar.

---

### Sección Tecnica: Cambios a Realizar

#### 1. Fix Bug - `src/hooks/useFeedback.ts`

```text
Línea 70:
- enabled: !!user?.id && !isAdmin,
+ enabled: !!user?.id,
```

Esto permite que cualquier usuario (admin o no) pueda ver su propio thread de feedback.

#### 2. Empty State Mejorado - `src/pages/Feedback.tsx`

Reemplazar el empty state genérico (líneas 92-97) con:
- Logo de oveja como ícono con opacidad reducida
- Texto personalizado usando nuevas keys de traducción

#### 3. Input Anclado - `src/pages/Feedback.tsx` y `src/components/feedback/ChatInput.tsx`

Modificar el div del ChatInput para incluir:
- `bg-muted/30` - Fondo sutil
- `border-t border-border` ya está, pero mejorar el contraste

#### 4. Traducciones - `src/i18n/{es,en}/feedback.json`

Agregar nueva key para el empty state personalizado:
```json
{
  "emptyTitle": "¿Tienes una idea o encontraste un bug?",
  "emptySubtitle": "Soy todo oídos. Cuéntame qué piensas."
}
```

---

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useFeedback.ts` | Fix enabled condition para admins |
| `src/pages/Feedback.tsx` | Empty state personalizado + input styling |
| `src/components/feedback/ChatInput.tsx` | Fondo sutil para área de escritura |
| `src/i18n/es/feedback.json` | Nuevos textos personalizados |
| `src/i18n/en/feedback.json` | Nuevos textos personalizados |

---

### Orden de Implementación

1. **Fix crítico**: Corregir condición `enabled` en useFeedback
2. **Traducciones**: Agregar textos personalizados
3. **Empty State**: Implementar diseño con oveja
4. **Input**: Mejorar separación visual
5. **Testing**: Verificar que mensajes se envían y muestran correctamente

