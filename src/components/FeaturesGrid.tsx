import { Eye, MessageSquare, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

const icons = [Eye, MessageSquare, Zap];

const FeaturesGrid = () => {
  const t = useTranslation('features');

  return (
    <section className="px-4 py-20 md:py-32">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-6 md:grid-cols-3">
          {t.cards.map((card, index) => {
            const Icon = icons[index];
            return (
              <Card
                key={index}
                className="group relative animate-fade-in-up overflow-hidden border-border/50 bg-card/50 opacity-0 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:glow-violet"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                {/* Gradient border effect on hover */}
                <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                <CardContent className="relative p-6 md:p-8">
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:text-glow-violet">
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="mb-3 text-xl font-bold text-foreground">
                    {card.title}
                  </h3>
                  
                  <p className="text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
