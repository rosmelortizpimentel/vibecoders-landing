import HeroSection from '@/components/HeroSection';
import WaveDivider from '@/components/WaveDivider';
import BentoGrid from '@/components/BentoGrid';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <WaveDivider fromColor="hsl(231, 99%, 62%)" toColor="#F6F5F4" />
        <BentoGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
