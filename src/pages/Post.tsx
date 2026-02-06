import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const posts = {
  'end-user-beta-testing-guide': {
    es: {
      title: 'Guía Rápida: Cómo Testear una Startup como Usuario Final',
      content: `
## ¿Qué es esto?

Esta guía te ayudará a dar feedback valioso en 15 minutos, sin necesidad de conocimientos técnicos previos.

---

## Qué hacer (15 minutos)

### 1. Primeros 30 segundos
- ¿Entiendes qué hace la app con solo verla?
- ¿El valor principal es claro?
- Si tuvieras que explicárselo a alguien, ¿podrías?

### 2. Flujo principal (5-7 min)
- Completa la acción más importante de la app
- ¿Fue intuitivo o necesitaste pensar demasiado?
- Anota dónde te trabaste (aunque sea un segundo)

### 3. Fricción (3-5 min)
- ¿Hay pasos que parecen innecesarios?
- ¿Algo te confundió?
- ¿Hay errores visibles o comportamientos raros?

### 4. Confianza (2 min)
- ¿Dejarías tus datos aquí?
- ¿Qué te haría dudar antes de pagar o registrarte?

### 5. Mobile check (2 min)
- Abre la app desde tu celular
- ¿Se ve bien? ¿Los botones son tocables?

---

## Qué NO hacer

- **Evita feedback vago** como "no me gusta" o "está raro"
- **No asumas** que el creador sabe lo que piensas
- **No ignores los detalles** pequeños (a veces son los más importantes)

---

## Plantilla de Reporte

Copia y pega esto para reportar un problema:

\`\`\`
**Qué hice:** [Describe los pasos]
**Qué esperaba:** [Lo que pensabas que pasaría]
**Qué pasó:** [Lo que realmente pasó]
**Dispositivo/Navegador:** [ej: iPhone 14, Safari]
**Screenshot:** [Si aplica]
\`\`\`

---

## Checklist Final

- [ ] Probé el flujo principal completo
- [ ] Anoté al menos 1 punto de fricción
- [ ] Revisé en mobile
- [ ] Mi feedback es específico y accionable
- [ ] Incluí contexto (dispositivo, navegador, pasos)
      `
    },
    en: {
      title: 'Quick Guide: How to Test a Startup as an End User',
      content: `
## What is this?

This guide will help you give valuable feedback in 15 minutes, no prior technical knowledge required.

---

## What to do (15 minutes)

### 1. First 30 seconds
- Do you understand what the app does just by looking at it?
- Is the main value clear?
- Could you explain it to someone?

### 2. Main flow (5-7 min)
- Complete the app's most important action
- Was it intuitive or did you have to think too much?
- Note where you got stuck (even for a second)

### 3. Friction (3-5 min)
- Are there steps that seem unnecessary?
- Did anything confuse you?
- Are there visible errors or weird behaviors?

### 4. Trust (2 min)
- Would you leave your data here?
- What would make you hesitate before paying or signing up?

### 5. Mobile check (2 min)
- Open the app from your phone
- Does it look good? Are buttons tappable?

---

## What NOT to do

- **Avoid vague feedback** like "I don't like it" or "it's weird"
- **Don't assume** the creator knows what you're thinking
- **Don't ignore small details** (sometimes they're the most important)

---

## Report Template

Copy and paste this to report an issue:

\`\`\`
**What I did:** [Describe the steps]
**What I expected:** [What you thought would happen]
**What happened:** [What actually happened]
**Device/Browser:** [e.g., iPhone 14, Safari]
**Screenshot:** [If applicable]
\`\`\`

---

## Final Checklist

- [ ] Tested the complete main flow
- [ ] Noted at least 1 friction point
- [ ] Checked on mobile
- [ ] My feedback is specific and actionable
- [ ] Included context (device, browser, steps)
      `
    }
  }
};

export default function Post() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  
  const post = slug ? posts[slug as keyof typeof posts] : null;
  const content = post ? post[language as 'es' | 'en'] || post.es : null;

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link to="/">
            <Button variant="outline">Go home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-3xl py-4">
          <Link 
            to="/me/beta" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'es' ? 'Volver' : 'Back'}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-3xl py-8 px-4">
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="text-2xl sm:text-3xl font-bold mb-8">{content.title}</h1>
          <div 
            className="space-y-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_li]:text-muted-foreground [&_p]:text-muted-foreground [&_hr]:my-6 [&_hr]:border-border [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_strong]:text-foreground"
            dangerouslySetInnerHTML={{ 
              __html: content.content
                .replace(/^## /gm, '<h2>')
                .replace(/^### /gm, '<h3>')
                .replace(/<h2>(.+)$/gm, '<h2>$1</h2>')
                .replace(/<h3>(.+)$/gm, '<h3>$1</h3>')
                .replace(/^- \[ \] /gm, '<li><input type="checkbox" disabled /> ')
                .replace(/^- /gm, '<li>')
                .replace(/<li>(.+)$/gm, '<li>$1</li>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                .replace(/^---$/gm, '<hr />')
                .replace(/\n\n/g, '</p><p>')
                .replace(/^(?!<[hlupo])/gm, '<p>')
            }}
          />
        </article>
      </main>
    </div>
  );
}
