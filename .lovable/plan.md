
# Plan: Crear Páginas Legales para Google OAuth

## Objetivo

Crear páginas públicas de **Política de Privacidad** y **Términos de Servicio** para cumplir con los requisitos de Google OAuth Console, e integrarlas en el footer de la landing.

**URLs finales:**
- `https://vibecoders.la/privacy`  
- `https://vibecoders.la/terms`

---

## Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/pages/Privacy.tsx` | Crear | Página de Política de Privacidad |
| `src/pages/Terms.tsx` | Crear | Página de Términos de Servicio |
| `src/i18n/es/legal.json` | Crear | Contenido completo de ambas páginas en español |
| `src/i18n/es/common.json` | Modificar | Agregar textos para enlaces del footer |
| `src/App.tsx` | Modificar | Agregar rutas `/privacy` y `/terms` ANTES de `/:handle` |
| `src/components/Footer.tsx` | Modificar | Agregar enlaces a las páginas legales |

---

## Diseño de las Páginas

Ambas páginas tendrán:
- Fondo blanco/claro para buena legibilidad
- Header con nombre de la plataforma y link de regreso
- Contenido estructurado en secciones claras
- Fecha de última actualización
- Footer reutilizado

```text
┌──────────────────────────────────────────────────────┐
│  ← Volver    vibecoders.la                          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Política de Privacidad                              │
│  Última actualización: 31 de enero de 2026          │
│                                                      │
│  ─────────────────────────────────────────────────   │
│                                                      │
│  1. Información que Recopilamos                      │
│     Lorem ipsum...                                   │
│                                                      │
│  2. Cómo Usamos tu Información                       │
│     Lorem ipsum...                                   │
│                                                      │
│  (más secciones...)                                  │
│                                                      │
├──────────────────────────────────────────────────────┤
│                    FOOTER                            │
└──────────────────────────────────────────────────────┘
```

---

## Copy Profesional - Política de Privacidad

### Secciones:

**1. Introducción**
> Vibecoders.la ("nosotros", "nuestro" o "la Plataforma") es una comunidad que conecta a desarrolladores y creadores que construyen con herramientas de vibe coding. Tu privacidad es importante para nosotros. Esta política describe cómo recopilamos, usamos y protegemos tu información personal.

**2. Información que Recopilamos**
> - **Información de cuenta:** Cuando inicias sesión con Google, recibimos tu nombre, dirección de correo electrónico y foto de perfil.
> - **Información de perfil:** El nombre de usuario que eliges para tu página pública en vibecoders.la.
> - **Información técnica:** Datos del dispositivo, navegador y sistema operativo para mejorar tu experiencia.
> - **Información de uso:** Cómo interactúas con la plataforma para mejorar nuestros servicios.

**3. Autenticación con Google**
> Utilizamos Google Sign-In para ofrecerte una experiencia segura sin necesidad de crear contraseñas. Solo accedemos a la información básica de tu perfil (nombre, email y foto). No accedemos a tu cuenta de Google Drive, contactos, calendario ni ningún otro servicio de Google.

**4. Cómo Usamos tu Información**
> - Crear y mantener tu cuenta en vibecoders.la
> - Permitirte reservar tu página personalizada
> - Comunicarnos contigo sobre actualizaciones del servicio
> - Mejorar y personalizar tu experiencia
> - Prevenir fraude y uso indebido

**5. Almacenamiento y Seguridad**
> Tu información se almacena de forma segura en servidores protegidos. Utilizamos Supabase como proveedor de infraestructura, que cumple con estándares de seguridad de la industria. Implementamos medidas técnicas y organizativas para proteger tus datos.

**6. Compartir Información**
> No vendemos ni alquilamos tu información personal. Solo compartimos datos con:
> - Proveedores de servicios esenciales (hosting, autenticación)
> - Cuando la ley lo requiera
> - Con tu consentimiento explícito

**7. Tus Derechos**
> Tienes derecho a:
> - Acceder a tus datos personales
> - Corregir información incorrecta
> - Eliminar tu cuenta y datos
> - Exportar tus datos
> Para ejercer estos derechos, contáctanos.

**8. Cookies**
> Usamos cookies esenciales para el funcionamiento del sitio y la autenticación. No utilizamos cookies de seguimiento de terceros con fines publicitarios.

**9. Cambios a esta Política**
> Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios significativos por correo electrónico o mediante un aviso en la plataforma.

**10. Contacto**
> Para preguntas sobre privacidad: contacto@vibecoders.la

---

## Copy Profesional - Términos de Servicio

### Secciones:

**1. Aceptación de los Términos**
> Al acceder o utilizar vibecoders.la, aceptas estos términos de servicio. Si no estás de acuerdo, por favor no uses la plataforma.

**2. Descripción del Servicio**
> Vibecoders.la es una comunidad para desarrolladores y creadores que construyen productos digitales utilizando herramientas de inteligencia artificial y vibe coding. Ofrecemos:
> - Páginas de perfil personalizadas
> - Directorio de la comunidad de vibecoders
> - Recursos y conexiones para creadores

**3. Registro y Cuenta**
> - Debes proporcionar información veraz al registrarte
> - Eres responsable de mantener la seguridad de tu cuenta
> - Debes tener al menos 13 años de edad
> - Una persona puede tener solo una cuenta

**4. Nombres de Usuario**
> - Los nombres de usuario deben ser apropiados y no ofensivos
> - No puedes usar nombres que infrinjan marcas registradas
> - No puedes suplantar a otras personas o entidades
> - Nos reservamos el derecho de reclamar nombres de usuario inactivos o que violen estas políticas

**5. Uso Aceptable**
> Te comprometes a no:
> - Violar leyes o regulaciones aplicables
> - Publicar contenido ofensivo, difamatorio o ilegal
> - Intentar acceder a cuentas de otros usuarios
> - Interferir con el funcionamiento de la plataforma
> - Usar la plataforma para spam o actividades fraudulentas

**6. Propiedad Intelectual**
> - El contenido que publiques sigue siendo tuyo
> - Nos otorgas licencia para mostrar tu contenido en la plataforma
> - Respeta los derechos de propiedad intelectual de terceros
> - El diseño y código de vibecoders.la son propiedad nuestra

**7. Limitación de Responsabilidad**
> La plataforma se proporciona "tal cual". No garantizamos disponibilidad continua o libre de errores. No somos responsables de:
> - Pérdidas derivadas del uso de la plataforma
> - Contenido publicado por otros usuarios
> - Interrupciones del servicio

**8. Modificaciones del Servicio**
> Podemos modificar, suspender o descontinuar cualquier aspecto del servicio en cualquier momento. Te notificaremos de cambios significativos con antelación razonable.

**9. Terminación**
> Podemos suspender o terminar tu cuenta si violas estos términos. Puedes eliminar tu cuenta en cualquier momento desde tu perfil.

**10. Ley Aplicable**
> Estos términos se rigen por las leyes aplicables en la jurisdicción donde opera vibecoders.la.

**11. Contacto**
> Para preguntas sobre estos términos: contacto@vibecoders.la

---

## Footer Actualizado

```text
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  © 2026 vibecoders.la    Privacidad · Términos                    │
│                                                                    │
│  Construido a -20°C en 🇨🇦 por Rosmel Ortiz                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

Los enlaces usarán `<Link>` de react-router-dom para navegación interna.

---

## Implementación Técnica

### Rutas (App.tsx)

Las rutas `/privacy` y `/terms` irán ANTES de `/:handle` para evitar que sean capturadas como usernames:

```tsx
<Route path="/privacy" element={<Privacy />} />
<Route path="/terms" element={<Terms />} />
<Route path="/:handle" element={<PublicProfile />} />
```

### Estructura de Páginas

Ambas páginas compartirán:
- Header simple con logo y link de regreso
- Área de contenido con máximo ancho para legibilidad
- Reutilización del Footer existente
- Tipografía CameraPlain del sitio

### Internacionalización

Crear `src/i18n/es/legal.json` con todo el contenido para facilitar futuros cambios y mantener consistencia con el sistema de traducciones existente.

---

## Resultado Final

- Páginas públicas accesibles sin autenticación
- URLs limpias para configurar en Google Cloud Console:
  - Privacy Policy: `https://vibecoders.la/privacy`
  - Terms of Service: `https://vibecoders.la/terms`
- Diseño profesional y consistente con el resto del sitio
- Enlaces visibles en el footer
- Copy profesional adaptado a una comunidad tech
