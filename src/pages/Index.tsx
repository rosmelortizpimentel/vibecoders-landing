import HeroSection from '@/components/HeroSection';
import FeaturesGrid from '@/components/FeaturesGrid';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <FeaturesGrid />
        <FeaturesGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
