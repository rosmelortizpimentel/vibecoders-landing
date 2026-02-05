import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { useFreshDrops } from '@/hooks/useFreshDrops';
import { useTranslation } from '@/hooks/useTranslation';
import { PublicProfileHeader } from '@/components/PublicProfileHeader';
import Footer from '@/components/Footer';
import { BuilderOnboarding } from '@/components/home/BuilderOnboarding';
import { FreshDropsCarousel } from '@/components/home/FreshDropsCarousel';
import { ShowcaseCardSkeleton } from '@/components/showcase/ShowcaseCardSkeleton';

const ONBOARDING_STORAGE_KEY = 'onboarding_dismissed';

export default function Home() {
  const { user } = useAuth();
  const t = useTranslation('home');
  const profileCompletion = useProfileCompletion();
  const { data: freshDrops = [], isLoading: freshDropsLoading } = useFreshDrops();
  
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
  });

  const handleDismissOnboarding = () => {
    setIsDismissed(true);
  };

  // Reset dismissed state when user logs in with incomplete profile
  useEffect(() => {
    if (user && !profileCompletion.isComplete) {
      // Optional: reset dismissal on new session
    }
  }, [user, profileCompletion.isComplete]);

  const showOnboarding = user && !profileCompletion.isComplete && !isDismissed && !profileCompletion.loading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <PublicProfileHeader />

      <main className="flex-1">
        {/* Builder Onboarding */}
        {showOnboarding && (
          <section className="container px-4 py-6">
            <BuilderOnboarding
              percentage={profileCompletion.percentage}
              checklist={profileCompletion.checklist}
              onDismiss={handleDismissOnboarding}
            />
          </section>
        )}

        {/* Fresh Drops Carousel */}
        <section className="py-8 md:py-12">
          <div className="container px-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
              {t.freshDrops.title}
            </h2>
            {freshDropsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <ShowcaseCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <FreshDropsCarousel apps={freshDrops} />
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
