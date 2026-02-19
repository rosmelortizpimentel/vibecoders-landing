

## Fix: Nombre centrado + Book a Call en la misma fila

### Problema

Cuando el avatar esta en posicion "center", el contenedor del nombre usa `justify-between` lo que empuja el boton "Book a Call" al extremo derecho. Visualmente se ve desalineado y en pantallas pequenas el boton baja debajo del nombre.

### Solucion

Cambiar el layout del contenedor nombre + boton para que cuando la posicion sea "center", ambos elementos se agrupen juntos centrados en vez de usar `justify-between`.

### Cambios

#### 1. `src/components/me/ProfilePreview.tsx` (lineas 173)

Cambiar la clase del contenedor de nombre + booking:
- Cuando `avatarPosition === 'center'`: usar `justify-center` en vez de `justify-between`
- Cuando `left` o `right`: mantener `justify-between`

```tsx
// Antes:
<div className="w-full flex items-center justify-between gap-4">

// Despues:
<div className={`w-full flex items-center gap-4 ${avatarPosition === 'center' ? 'justify-center' : 'justify-between'}`}>
```

#### 2. `src/components/PublicProfileCard.tsx` (linea 358)

Mismo cambio exacto:

```tsx
// Antes:
<div className="w-full flex items-center justify-between gap-4">

// Despues:
<div className={`w-full flex items-center gap-4 ${avatarPosition === 'center' ? 'justify-center' : 'justify-between'}`}>
```

### Archivos a modificar (2)

| Archivo | Cambio |
|---------|--------|
| `src/components/me/ProfilePreview.tsx` | justify-center cuando avatar centrado |
| `src/components/PublicProfileCard.tsx` | justify-center cuando avatar centrado |

