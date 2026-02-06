import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Target, CheckCircle2, AlertCircle, FileText, Lightbulb, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostContent {
  title: string;
  subtitle: string;
  sections: {
    icon: React.ReactNode;
    title: string;
    content: string[];
  }[];
  tip?: {
    title: string;
    content: string;
  };
}

const posts: Record<string, { es: PostContent; en: PostContent }> = {
  'writing-tester-instructions': {
    es: {
      title: 'Cómo escribir instrucciones efectivas para testers',
      subtitle: 'Una guía para founders que quieren feedback valioso de su beta squad.',
      sections: [
        {
          icon: <Target className="w-5 h-5 text-primary" />,
          title: 'Define el objetivo',
          content: [
            'Antes de escribir, responde: ¿Qué quiero validar con esta prueba?',
            'Puede ser: usabilidad del flujo principal, claridad del valor, fricción en registro, etc.',
            'Un objetivo claro = feedback enfocado.'
          ]
        },
        {
          icon: <ListChecks className="w-5 h-5 text-primary" />,
          title: 'Estructura tus instrucciones',
          content: [
            'Contexto breve: Qué es el producto y qué problema resuelve (2-3 líneas máximo).',
            'Flujo a probar: Lista los pasos exactos que deben seguir.',
            'Qué observar: Dónde poner atención, qué reportar si falla.',
            'Formato de reporte: Cómo quieres recibir el feedback (texto, video, checklist).'
          ]
        },
        {
          icon: <CheckCircle2 className="w-5 h-5 text-primary" />,
          title: 'Ejemplo de instrucciones claras',
          content: [
            '"Prueba el flujo de onboarding completo: registro → verificación → primer proyecto."',
            '"Reporta si algún paso toma más de 30 segundos o si algo no es intuitivo."',
            '"Usa el formato: Paso → Esperado → Resultado → Screenshot si aplica."'
          ]
        },
        {
          icon: <AlertCircle className="w-5 h-5 text-[#1c1c1c]" />,
          title: 'Errores comunes a evitar',
          content: [
            'Instrucciones vagas: "Prueba la app y dime qué piensas" no funciona.',
            'Demasiado texto: Si es más de 200 palabras, nadie lo lee completo.',
            'Sin criterios de éxito: El tester no sabe qué es "correcto".'
          ]
        },
        {
          icon: <Lightbulb className="w-5 h-5 text-primary" />,
          title: 'Maximiza el valor del feedback',
          content: [
            'Pide feedback específico, no opiniones generales.',
            'Incluye preguntas concretas: "¿Entendiste para qué sirve X antes de usarlo?"',
            'Agradece públicamente a testers que dan feedback valioso.'
          ]
        }
      ],
      tip: {
        title: 'Pro tip',
        content: 'Incluye el tiempo estimado de prueba. Los testers priorizan cuando saben que son "10 minutos" vs "probar todo".'
      }
    },
    en: {
      title: 'How to write effective instructions for testers',
      subtitle: 'A guide for founders who want valuable feedback from their beta squad.',
      sections: [
        {
          icon: <Target className="w-5 h-5 text-primary" />,
          title: 'Define the objective',
          content: [
            'Before writing, answer: What do I want to validate with this test?',
            'It could be: main flow usability, value clarity, registration friction, etc.',
            'A clear objective = focused feedback.'
          ]
        },
        {
          icon: <ListChecks className="w-5 h-5 text-primary" />,
          title: 'Structure your instructions',
          content: [
            'Brief context: What the product is and what problem it solves (2-3 lines max).',
            'Flow to test: List the exact steps they should follow.',
            'What to observe: Where to pay attention, what to report if it fails.',
            'Report format: How you want to receive feedback (text, video, checklist).'
          ]
        },
        {
          icon: <CheckCircle2 className="w-5 h-5 text-primary" />,
          title: 'Example of clear instructions',
          content: [
            '"Test the complete onboarding flow: registration → verification → first project."',
            '"Report if any step takes more than 30 seconds or if something is not intuitive."',
            '"Use the format: Step → Expected → Result → Screenshot if applicable."'
          ]
        },
        {
          icon: <AlertCircle className="w-5 h-5 text-[#1c1c1c]" />,
          title: 'Common mistakes to avoid',
          content: [
            'Vague instructions: "Test the app and tell me what you think" doesn\'t work.',
            'Too much text: If it\'s more than 200 words, nobody reads it all.',
            'No success criteria: The tester doesn\'t know what "correct" is.'
          ]
        },
        {
          icon: <Lightbulb className="w-5 h-5 text-primary" />,
          title: 'Maximize feedback value',
          content: [
            'Ask for specific feedback, not general opinions.',
            'Include concrete questions: "Did you understand what X is for before using it?"',
            'Publicly thank testers who give valuable feedback.'
          ]
        }
      ],
      tip: {
        title: 'Pro tip',
        content: 'Include estimated test time. Testers prioritize when they know it\'s "10 minutes" vs "test everything".'
      }
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-foreground">Post not found</h1>
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
      <main className="container max-w-3xl py-12 px-4">
        <article>
          {/* Title */}
          <header className="mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              {content.title}
            </h1>
            <p className="text-muted-foreground text-lg">
              {content.subtitle}
            </p>
          </header>

          {/* Sections */}
          <div className="space-y-8">
            {content.sections.map((section, index) => (
              <section key={index} className="group">
                <div className="flex items-start gap-3 mb-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {section.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {section.title}
                  </h2>
                </div>
                <div className="pl-8 space-y-2">
                  {section.content.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Pro Tip */}
          {content.tip && (
            <div className="mt-10 p-5 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">{content.tip.title}</p>
                  <p className="text-muted-foreground text-sm">{content.tip.content}</p>
                </div>
              </div>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
