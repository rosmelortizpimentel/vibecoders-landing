import { useState } from 'react';
import { ExternalLink, Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  detectInAppBrowser,
  redirectToSafari,
  copyCurrentUrlToClipboard,
  shouldShowWarning,
  dismissWarning,
} from '@/lib/inAppBrowser';

export function InAppBrowserWarning() {
  const [showWarning, setShowWarning] = useState(shouldShowWarning);
  const [copied, setCopied] = useState(false);
  
  const browserInfo = detectInAppBrowser();
  
  if (!showWarning || !browserInfo.isInAppBrowser) {
    return null;
  }

  const handleOpenInSafari = () => {
    redirectToSafari();
  };

  const handleCopyLink = async () => {
    const success = await copyCurrentUrlToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDismiss = () => {
    dismissWarning();
    setShowWarning(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-background p-6 shadow-2xl animate-fade-in">
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <ExternalLink className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-foreground">
            Abre en Safari
          </h2>
          
          <p className="mt-3 text-sm text-muted-foreground">
            Para iniciar sesión con Google, necesitas abrir esta página en Safari.
            {browserInfo.browserName && (
              <span className="block mt-1">
                El navegador de {browserInfo.browserName} no es compatible.
              </span>
            )}
          </p>

          <div className="mt-6 space-y-3">
            <Button
              onClick={handleOpenInSafari}
              className="w-full gap-2"
              size="lg"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir en Safari
            </Button>
            
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  ¡Enlace copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar enlace
                </>
              )}
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Pega el enlace en Safari para continuar
          </p>
        </div>
      </div>
    </div>
  );
}
