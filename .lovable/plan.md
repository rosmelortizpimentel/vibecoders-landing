
## Sistema de Membresias y Pagos con Stripe

Feature completa para implementar tiers de usuario (Founder, Free, Pro) con integracion de Stripe para suscripciones anuales y logica de asignacion automatica de cupos de fundador.

### 1. Base de Datos - Nueva tabla `user_subscriptions`

En lugar de agregar columnas al `profiles` (que es publico), crear una tabla dedicada:

```text
user_subscriptions
  id           uuid PK default gen_random_uuid()
  user_id      uuid NOT NULL UNIQUE (references auth.users on delete cascade)
  tier         text NOT NULL default 'pending'  -- 'founder', 'free', 'pro', 'pending'
  founder_number integer nullable
  price        decimal default 0
  stripe_customer_id  text nullable
  subscription_id     text nullable
  subscription_status text nullable  -- 'active', 'canceled', 'past_due', etc.
  current_period_end  timestamptz nullable
  created_at   timestamptz default now()
  updated_at   timestamptz default now()
```

**RLS:**
- SELECT: usuarios ven solo su propia suscripcion
- INSERT: solo el propio usuario (o service role via edge functions)
- UPDATE: solo via service role (edge functions)

**Funcion SQL auxiliar:** `assign_founder_tier(p_user_id uuid)` que:
1. Cuenta cuantos founders existen
2. Si < 100, asigna tier='founder' con founder_number
3. Si >= 100, asigna tier='pending'
4. Retorna el tier asignado

### 2. Habilitar Stripe

Antes de escribir codigo, se habilitara la integracion de Stripe de Lovable para obtener las herramientas de creacion de productos/precios.

### 3. Edge Functions nuevas

| Edge Function | Descripcion |
|---------------|-------------|
| `check-founder-status` | Tras OAuth, verifica cupos y asigna tier. Retorna tier + founder_number |
| `create-checkout-session` | Crea sesion de Stripe Checkout para plan Pro ($24/year) |
| `stripe-webhook` | Recibe eventos de Stripe (checkout.session.completed, subscription updates) |

**`check-founder-status`** (POST, autenticado):
- Busca si el usuario ya tiene un registro en `user_subscriptions`
- Si no existe, llama a `assign_founder_tier()` 
- Retorna `{ tier, founderNumber, needsPlanSelection }`

**`create-checkout-session`** (POST, autenticado):
- Crea un Stripe Customer si no existe
- Crea una Checkout Session en modo `subscription` con el price de $24/year
- Retorna `{ url }` para redirect

**`stripe-webhook`** (POST, publico con verificacion de firma):
- Maneja `checkout.session.completed`: actualiza tier a 'pro'
- Maneja `customer.subscription.updated/deleted`: sincroniza estado

### 4. Flujo post-login modificado

**Archivo: `src/hooks/useAuth.ts`**

Despues del login exitoso (SIGNED_IN), en lugar de redirigir siempre a `/me`:
1. Llamar a `check-founder-status` edge function
2. Si tier = 'founder' o 'free' o 'pro' -> redirigir a `/home` (dashboard)
3. Si tier = 'pending' -> redirigir a `/choose-plan`

### 5. Paginas nuevas

**`/choose-plan` (src/pages/ChoosePlan.tsx)**:
- Muestra mensaje "Los 100 cupos de Fundador se agotaron"
- Dos cards: Plan Free ($0) y Builder Pro ($24/year)
- Boton "Empezar gratis": llama edge function para setear tier='free', redirige a /home
- Boton "Suscribirme": llama `create-checkout-session`, redirige a Stripe

**`/payment-success` (src/pages/PaymentSuccess.tsx)**:
- Muestra confirmacion de pago
- Auto-redirect a /home en 3 segundos

### 6. Componente de Upgrade en Dashboard

**Archivo: `src/components/home/UpgradeBanner.tsx`**:
- Se muestra en /home para usuarios con tier 'free'
- CTA "Upgrade a Builder Pro - $24/year"
- Click -> mismo flujo de Stripe Checkout

### 7. Banner de Fundador en Dashboard

**Archivo: `src/components/home/FounderWelcome.tsx`**:
- Se muestra una vez para founders recien registrados
- "Eres Fundador #X! Acceso gratis de por vida"
- Dismissible

### 8. Hook `useSubscription`

**Archivo: `src/hooks/useSubscription.ts`**:
- Consulta `user_subscriptions` para el usuario actual
- Expone `{ tier, founderNumber, isFounder, isPro, isFree, loading }`
- Se usa en el Dashboard, Sidebar, y cualquier feature que necesite verificar acceso

### 9. Manejo de errores de pago

- Si Stripe redirige con `?cancelled=true` a `/choose-plan`, mostrar toast de pago cancelado
- El webhook de Stripe reintentara automaticamente si falla

### 10. Landing Page - Cupos dinamicos

Actualizar `get-landing-stats` para contar founders reales de `user_subscriptions` y calcular cupos restantes con precision.

---

### Detalle tecnico - Archivos a crear/modificar

| Archivo | Accion |
|---------|--------|
| Nueva migration SQL | Tabla `user_subscriptions`, funcion `assign_founder_tier` |
| `supabase/functions/check-founder-status/index.ts` | Verificar/asignar tier post-login |
| `supabase/functions/create-checkout-session/index.ts` | Crear sesion Stripe Checkout |
| `supabase/functions/stripe-webhook/index.ts` | Webhook de Stripe |
| `supabase/functions/get-landing-stats/index.ts` | Actualizar conteo de cupos |
| `supabase/config.toml` | Registrar nuevas funciones con verify_jwt=false |
| `src/hooks/useAuth.ts` | Flujo post-login con verificacion de tier |
| `src/hooks/useSubscription.ts` | Hook para acceder al tier del usuario |
| `src/pages/ChoosePlan.tsx` | Pagina de seleccion de plan |
| `src/pages/PaymentSuccess.tsx` | Pagina de exito de pago |
| `src/components/home/UpgradeBanner.tsx` | Banner de upgrade para free users |
| `src/components/home/FounderWelcome.tsx` | Banner de bienvenida para founders |
| `src/pages/Home.tsx` | Integrar banners condicionales |
| `src/App.tsx` | Nuevas rutas /choose-plan, /payment-success |
| `src/i18n/en/plans.json` | Traducciones ingles |
| `src/i18n/es/plans.json` | Traducciones espanol |

### Orden de implementacion

1. Habilitar Stripe (herramienta de Lovable)
2. Migration SQL (tabla + funcion)
3. Edge functions (check-founder-status, create-checkout-session, stripe-webhook)
4. Hook useSubscription
5. Paginas ChoosePlan y PaymentSuccess
6. Modificar flujo de auth (useAuth redirect)
7. Componentes de dashboard (FounderWelcome, UpgradeBanner)
8. Actualizar landing stats
9. Traducciones

### Nota importante

Se necesitara la **Stripe Secret Key** para la integracion. Lovable la solicitara al habilitar Stripe. El producto y precio de $24/year se crearan programaticamente via la API de Stripe durante la implementacion.
