

## Simplificación del Formulario de Tech Stacks

### Problema Actual

El formulario tiene 3 campos para URLs de referido que añaden complejidad innecesaria:
- Website URL
- Referral URL Template (con `{code}`)
- Param Name ← **Este campo sobra**

### Solución

Eliminar el campo "Param Name" del formulario. Solo necesitamos:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| Website URL | URL base de la herramienta | `https://windsurf.com` |
| Referral URL | URL completa con `{code}` | `https://windsurf.com/refer?referral_code={code}` |
| Código Default | Código de la plataforma | `pad9p1vab0accfsv` |

### Lógica Simplificada

```text
Si hay Referral URL y código → reemplazar {code}
Si no → usar Website URL
```

### Ejemplos Finales

| Herramienta | Referral URL Template | Código | Resultado |
|-------------|----------------------|--------|-----------|
| Lovable | `https://lovable.dev/invite/{code}` | KFET6W5 | `https://lovable.dev/invite/KFET6W5` |
| Windsurf | `https://windsurf.com/refer?referral_code={code}` | pad9p1vab0accfsv | `https://windsurf.com/refer?referral_code=pad9p1vab0accfsv` |
| Supabase | (vacío) | (vacío) | `https://supabase.com` |

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/TechStackForm.tsx` | Eliminar campo "Param Name" |
| `src/components/admin/StackForm.tsx` | Eliminar campo "Param Name" |

### Nota

El campo `referral_param` se mantiene en la base de datos por si algún día se necesita, pero no se muestra en el formulario porque no es necesario.

