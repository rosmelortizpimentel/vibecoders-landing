
# Plan: Rediseñar ProfileFileCard con Contadores y Color Azul de la Web

## Objetivo
Transformar la vista de "Perfil Verificado" para mostrar:
- Texto "Perfil" con checkmark
- Contadores animados de vistas y likes
- Usar el azul de la web (#3D5AFE / blue-600) para los iconos

## Diseño Visual

```text
┌─────────────────────────────┐
│ ● ● ●                       │  ← Barra macOS
├─────────────────────────────┤
│                             │
│         ✓ Perfil            │  ← Checkmark azul + texto
│                             │
│   👁 12,847     ❤️ 3,256    │  ← Iconos azules + contadores
│                             │
└─────────────────────────────┘
```

## Colores
- **Checkmark**: Azul (#3D5AFE) - `text-[#3D5AFE]`
- **Icono Ojo (vistas)**: Azul (#3D5AFE) - `text-[#3D5AFE]`
- **Icono Corazón (likes)**: Azul (#3D5AFE) - `text-[#3D5AFE]` con `fill-[#3D5AFE]`

## Comportamiento de los Contadores

### Función de Easing (Aceleración Progresiva)
- Empieza muy lento y acelera hacia el final
- Fórmula: `t³` (cúbica)
- Duración: 5 segundos

### Curva de Incremento
```text
Tiempo    Porcentaje del valor final
─────────────────────────────────────
0s        0%
1s        0.8%    (muy lento)
2s        6.4%    (lento)
3s        21.6%   (acelerando)
4s        51.2%   (rápido)
5s        100%    (máximo)
```

### Valores Finales
- Vistas: 12,847
- Likes: 3,256

## Cambios Técnicos

### Archivo: `src/components/ProfileFileCard.tsx`

1. **Imports**: Añadir `Eye`, `Heart` de lucide-react

2. **Nuevas constantes**:
```typescript
const FINAL_VIEWS = 12847;
const FINAL_LIKES = 3256;
const COUNTER_DURATION = 5000; // 5 segundos
```

3. **Nuevos estados**:
```typescript
const [viewCount, setViewCount] = useState(0);
const [likeCount, setLikeCount] = useState(0);
```

4. **Animación con requestAnimationFrame**:
```typescript
const easeInCubic = (t: number) => t * t * t;

useEffect(() => {
  if (cardState === 'counting') {
    const startTime = Date.now();
    let animationId: number;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / COUNTER_DURATION, 1);
      const easedProgress = easeInCubic(progress);
      
      setViewCount(Math.floor(FINAL_VIEWS * easedProgress));
      setLikeCount(Math.floor(FINAL_LIKES * easedProgress));
      
      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }
}, [cardState]);
```

5. **Nuevo diseño del contenido verificado** (con azul de la web):
```tsx
{cardState === 'verified' || cardState === 'counting' || cardState === 'exploding' ? (
  <>
    <div className="flex items-center gap-2 mb-3">
      <CheckCircle className="w-5 h-5 text-[#3D5AFE]" />
      <span className="text-sm md:text-base font-semibold text-gray-800">
        Perfil
      </span>
    </div>
    
    <div className="flex items-center gap-4 text-gray-600">
      <div className="flex items-center gap-1.5">
        <Eye className="w-4 h-4 text-[#3D5AFE]" />
        <span className="text-xs md:text-sm font-medium tabular-nums">
          {viewCount.toLocaleString()}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Heart className="w-4 h-4 text-[#3D5AFE] fill-[#3D5AFE]" />
        <span className="text-xs md:text-sm font-medium tabular-nums">
          {likeCount.toLocaleString()}
        </span>
      </div>
    </div>
  </>
)}
```

6. **Ajustar timings** (COUNTING_DURATION = 5000ms):
   - Transforming: 0ms
   - Verified: 500ms
   - Counting: 1500ms (dura 5 segundos)
   - Exploding: 6500ms (1500 + 5000)
   - Cleanup: 7000ms

7. **Eliminar**:
   - `risingNumbers` y su useMemo
   - `showNumbers` estado
   - Lógica de números flotantes en el render

## Timeline Final

```text
Tiempo    Evento
──────────────────────────────────────────
0ms       Todos los logos absorbidos → transforming
500ms     Estado verified (muestra Perfil + contadores en 0)
1500ms    Estado counting (contadores empiezan a subir)
6500ms    Estado exploding (contadores en máximo, explosión)
7000ms    Cleanup explosión
```

## Archivo a Modificar

- `src/components/ProfileFileCard.tsx`
