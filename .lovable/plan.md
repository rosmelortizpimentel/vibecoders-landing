

# Plan: Implementar Google One Tap Login con Supabase

## Resumen

Implementar Google One Tap Login para que usuarios no autenticados vean automáticamente el prompt de Google al entrar a la página de inicio, permitiendo iniciar sesión con un solo clic.

---

## Cómo Funciona Google One Tap

Google One Tap usa el SDK de **Google Identity Services (GIS)** para mostrar un prompt flotante que detecta automáticamente la cuenta de Google del usuario. Al hacer clic, se genera un `id_token` que enviamos a Supabase para autenticar.

```text
┌─────────────────────────────────────────────────────────────────┐
│  Landing Page (usuario no autenticado)                          │
│                                                          ┌────┐ │
│   [Logo Vibecoders]                                      │ G  │ │
│                                                          │One │ │
│   Tu headline...                                         │Tap │ │
│                                                          └────┘ │
│   [Formulario waitlist]                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `index.html` | Modificar | Añadir script de Google Identity Services |
| `src/components/GoogleOneTap.tsx` | **Crear** | Componente que inicializa y muestra One Tap |
| `src/hooks/useAuth.ts` | Modificar | Añadir función `signInWithIdToken` |
| `src/pages/Index.tsx` | Modificar | Renderizar `<GoogleOneTap />` |

---

## Cambios Detallados

### 1. index.html - Añadir Script de Google

```html
<head>
  ...
  <!-- Google Identity Services -->
  <script src="https://accounts.google.com/gsi/client" async></script>
</head>
```

### 2. src/components/GoogleOneTap.tsx - Nuevo Componente

Este componente:
- Solo se renderiza si **no hay usuario autenticado** y **no está cargando**
- Inicializa Google One Tap con el Client ID de Google
- Recibe el `id_token` del callback y lo envía a Supabase
- Maneja el cierre manual del popup (no vuelve a mostrarlo en esa sesión)

```typescript
// Estructura del componente
interface GoogleOneTapProps {
  onSuccess?: () => void;
}

const GoogleOneTap = ({ onSuccess }: GoogleOneTapProps) => {
  const { user, loading, signInWithIdToken } = useAuth();
  
  useEffect(() => {
    // No mostrar si: cargando, ya autenticado, o ya cerró el popup
    if (loading || user || sessionStorage.getItem('oneTapDismissed')) return;
    
    // Esperar a que el script de Google esté listo
    const initializeOneTap = () => {
      window.google?.accounts.id.initialize({
        client_id: 'TU_GOOGLE_CLIENT_ID',
        callback: handleCredentialResponse,
        cancel_on_tap_outside: false,
      });
      
      window.google?.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Usuario cerró o no se mostró
        }
        if (notification.getDismissedReason() === 'credential_returned') {
          // ¡Éxito! Token enviado
        }
      });
    };
    
    // Inicializar cuando el script esté cargado
    if (window.google) {
      initializeOneTap();
    } else {
      window.addEventListener('load', initializeOneTap);
    }
  }, [user, loading]);
  
  const handleCredentialResponse = async (response: { credential: string }) => {
    try {
      await signInWithIdToken(response.credential);
      onSuccess?.();
    } catch (error) {
      console.error('Error signing in with One Tap:', error);
    }
  };
  
  return null; // No renderiza UI, Google lo maneja
};
```

### 3. src/hooks/useAuth.ts - Añadir signInWithIdToken

Supabase soporta autenticación con `id_token` de Google directamente:

```typescript
const signInWithIdToken = async (idToken: string) => {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  
  if (error) {
    console.error('Error signing in with ID token:', error);
    throw error;
  }
  
  return data;
};

return {
  // ... existentes
  signInWithIdToken,
};
```

### 4. src/pages/Index.tsx - Renderizar One Tap

```tsx
import GoogleOneTap from '@/components/GoogleOneTap';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // ... lógica existente de redirección
  
  return (
    <div className="min-h-screen bg-background">
      {/* One Tap - Solo para usuarios no autenticados */}
      {!loading && !user && <GoogleOneTap />}
      
      <main>
        <HeroSection />
        ...
      </main>
    </div>
  );
};
```

---

## Tipado TypeScript para Google Identity Services

Crear declaración de tipos para el SDK de Google:

```typescript
// src/types/google.d.ts
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleOneTapConfig) => void;
          prompt: (callback?: (notification: PromptNotification) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleOneTapConfig {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
}

interface CredentialResponse {
  credential: string;
  select_by: string;
}

interface PromptNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  getDismissedReason: () => string;
}
```

---

## Requisitos Previos (Configuración en Google Cloud)

Para que One Tap funcione, debes configurar en Google Cloud Console:

1. **Authorized JavaScript origins**: Añadir las URLs del sitio
   - `https://vibecoders-la.lovable.app`
   - `https://id-preview--d38deb66-1267-457d-ba0e-c6a4c8c7efcf.lovable.app`
   
2. **Client ID de Google**: El mismo usado para OAuth debe funcionar para One Tap

---

## Manejo de Estados

| Estado | Comportamiento |
|--------|----------------|
| `loading = true` | No mostrar One Tap |
| `user != null` | No mostrar One Tap (ya autenticado) |
| `sessionStorage['oneTapDismissed']` | No mostrar (cerró manualmente) |
| Usuario hace clic en "X" | Guardar en sessionStorage para no molestar |
| Éxito de autenticación | Redirigir a `/me` automáticamente |

---

## Flujo Completo

```text
Usuario visita /
       │
       ▼
 ¿Está autenticado?
       │
  ┌────┴────┐
  │ SÍ      │ NO
  ▼         ▼
Redirect   ¿Ya cerró One Tap?
a /me           │
           ┌────┴────┐
           │ SÍ      │ NO
           ▼         ▼
        (nada)   Mostrar One Tap
                      │
                      ▼
              Usuario hace clic
                      │
                      ▼
              Enviar id_token a Supabase
                      │
                      ▼
              Autenticación exitosa
                      │
                      ▼
              Redirect a /me
```

---

## Beneficios

1. **Fricción mínima**: Un solo clic para iniciar sesión
2. **Conversión alta**: Usuarios ya logueados en Google ven su cuenta automáticamente
3. **Sin formularios**: No necesita escribir email/password
4. **Mantiene waitlist**: El formulario de waitlist sigue disponible para quienes prefieran esa opción

