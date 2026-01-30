import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';

interface WaitlistSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  alreadyRegistered: boolean;
}

const WaitlistSuccessModal = ({ isOpen, onClose, alreadyRegistered }: WaitlistSuccessModalProps) => {
  const t = useTranslation('waitlist');
  const { signInWithGoogle } = useAuth();

  if (!isOpen) return null;

  const content = alreadyRegistered ? t.alreadyRegistered : t.success;

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error during Google sign in:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm animate-fade-in rounded-2xl bg-background p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground">
            {content.title}
          </h3>
          <p className="mt-3 text-muted-foreground">
            {content.subtitle}
          </p>

          <Button
            onClick={handleGoogleLogin}
            className="mt-6 w-full gap-3 bg-primary py-6 text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {content.googleButton}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WaitlistSuccessModal;
