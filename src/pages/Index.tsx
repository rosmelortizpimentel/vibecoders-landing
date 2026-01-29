import HeroSection from '@/components/HeroSection';
import ManifestoSection from '@/components/ManifestoSection';
import FeaturesGrid from '@/components/FeaturesGrid';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <ManifestoSection />
        <FeaturesGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
