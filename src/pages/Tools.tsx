import { useState, useEffect } from 'react';
import { useToolsStack, getCategories } from '@/hooks/useToolsStack';
import { useTranslation } from '@/hooks/useTranslation';
import { ToolCard } from '@/components/stack/ToolCard';
import { ToolCardSkeleton } from '@/components/stack/ToolCardSkeleton';
import { cn } from '@/lib/utils';
import { usePageHeader } from '@/contexts/PageHeaderContext';
import { Wrench } from 'lucide-react';

export default function Tools() {
  const { data: tools, isLoading, error } = useToolsStack();
  const t = useTranslation('tools');
  const tCommon = useTranslation('common');
  const tErrors = useTranslation('errors');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const { setHeaderContent } = usePageHeader();

  useEffect(() => {
    setHeaderContent(
      <div className="flex items-center gap-2 min-w-0">
        <Wrench className="h-4 w-4 text-primary shrink-0" />
        <span className="font-semibold text-foreground truncate">{tCommon.navigation.tools}</span>
      </div>
    );
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  // Filter only active tools for public view
  const activeTools = tools?.filter(t => t.is_active) || [];
  const categories = getCategories(activeTools);

  const filteredTools = activeCategory === 'Todos'
    ? activeTools
    : activeTools.filter(t => t.category === activeCategory);

  return (
    <main className="flex-1">
      {/* Category Filters */}
      <section className="px-4 pt-6 pb-8">
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
              <p className="text-destructive">{tErrors.loadingError}</p>
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
                {t.noTools}
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
  );
}
