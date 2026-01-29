import HeroSection from '@/components/HeroSection';
import BentoGrid from '@/components/BentoGrid';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <BentoGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
