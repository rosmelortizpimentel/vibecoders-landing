// Stack page - Tools directory
import { useState } from 'react';
import { useToolsStack, getCategories } from '@/hooks/useToolsStack';
import { ToolCard } from '@/components/stack/ToolCard';
import { ToolCardSkeleton } from '@/components/stack/ToolCardSkeleton';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

export default function Stack() {
  const { data: tools, isLoading, error } = useToolsStack();
  const [activeCategory, setActiveCategory] = useState('Todos');

  // Filter only active tools for public view
  const activeTools = tools?.filter(t => t.is_active) || [];
  const categories = getCategories(activeTools);

  const filteredTools = activeCategory === 'Todos'
    ? activeTools
    : activeTools.filter(t => t.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              The Vibe Stack
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Las herramientas que usamos para construir productos escalables a velocidad récord.
            </p>
          </div>
        </section>

        {/* Category Filters */}
        <section className="px-4 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    activeCategory === category
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="px-4 pb-24">
          <div className="max-w-6xl mx-auto">
            {error ? (
              <div className="text-center py-16">
                <p className="text-destructive">Error al cargar las herramientas</p>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ToolCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredTools.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  {activeCategory === 'Todos' 
                    ? 'No hay herramientas disponibles aún.' 
                    : `No hay herramientas en la categoría "${activeCategory}".`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
