import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import HeroSection from '@/components/HeroSection';
import WaveDivider from '@/components/WaveDivider';
import BentoGrid from '@/components/BentoGrid';
import Footer from '@/components/Footer';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/me');
    }
  }, [user, loading, navigate]);

  // Si está cargando o hay usuario, mostrar loading
  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-pulse text-[#3D5AFE] text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <WaveDivider fromColor="hsl(231, 99%, 62%)" toColor="#F6F5F4" />
        <BentoGrid />
      </main>
      <WaveDivider fromColor="#F6F5F4" toColor="#1c1c1c" size="sm" />
      <Footer />
    </div>
  );
};

export default Index;
