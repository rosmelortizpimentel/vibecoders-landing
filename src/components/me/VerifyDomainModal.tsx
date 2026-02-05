 import { useState } from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Code, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
 import { toast } from 'sonner';
 
 interface VerifyDomainModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   appName: string;
   appUrl: string;
   verificationToken: string;
   onVerify: () => Promise<{ success: boolean; message?: string; error?: string }>;
   onSuccess?: () => void;
 }
 
 type VerifyState = 'idle' | 'verifying' | 'success' | 'error';
 
 export function VerifyDomainModal({
   open,
   onOpenChange,
   appName,
   appUrl,
   verificationToken,
   onVerify,
   onSuccess,
 }: VerifyDomainModalProps) {
   const [state, setState] = useState<VerifyState>('idle');
   const [errorMessage, setErrorMessage] = useState<string>('');
   const [copied, setCopied] = useState(false);
 
   const metaTag = `<meta name="vibecoders-verify" content="${verificationToken}" />`;
 
   const handleCopy = async () => {
     try {
       await navigator.clipboard.writeText(metaTag);
       setCopied(true);
       toast.success('Copiado al portapapeles');
       setTimeout(() => setCopied(false), 2000);
     } catch {
       toast.error('Error al copiar');
     }
   };
 
   const handleVerify = async () => {
     setState('verifying');
     setErrorMessage('');
 
     try {
       const result = await onVerify();
       
       if (result.success) {
         setState('success');
         toast.success('¡Dominio verificado!');
         onSuccess?.();
         setTimeout(() => {
           onOpenChange(false);
           setState('idle');
         }, 1500);
       } else {
         setState('error');
         setErrorMessage(result.message || 'Error al verificar');
       }
     } catch (error) {
       setState('error');
       setErrorMessage('Error inesperado al verificar');
       console.error('Verification error:', error);
     }
   };
 
   const handleOpenChange = (newOpen: boolean) => {
     if (!newOpen) {
       setState('idle');
       setErrorMessage('');
     }
     onOpenChange(newOpen);
   };
 
   const hostname = (() => {
     try {
       return new URL(appUrl).hostname;
     } catch {
       return appUrl;
     }
   })();
 
   return (
     <Dialog open={open} onOpenChange={handleOpenChange}>
       <DialogContent className="w-[95vw] max-w-lg bg-white p-4 sm:p-6">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2 text-[#1c1c1c]">
             <Code className="h-5 w-5 text-[#3D5AFE]" />
             Verifica que {appName || 'tu app'} es tuya
           </DialogTitle>
           <DialogDescription className="text-gray-600 text-sm sm:text-base">
             Añade la siguiente etiqueta en la sección <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs sm:text-sm">&lt;head&gt;</code> de tu página de inicio.
           </DialogDescription>
         </DialogHeader>
 
         <div className="space-y-4 py-2 sm:py-4">
           {/* Label */}
           <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Código a insertar</p>
 
           {/* Code block */}
           <div className="relative bg-[#1c1c1c] rounded-lg overflow-hidden">
             <pre className="p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm text-white font-mono whitespace-pre-wrap break-all">
               {metaTag}
             </pre>
           </div>
 
           {/* URL to verify */}
           <p className="text-xs sm:text-sm text-gray-600">
             Verificaremos: <span className="font-medium text-[#1c1c1c]">{hostname}</span>
           </p>
 
           {/* Error message */}
           {state === 'error' && errorMessage && (
             <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-700">
               <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
               <div>
                 <p>{errorMessage}</p>
               </div>
             </div>
           )}
 
           {/* Success state */}
           {state === 'success' && (
             <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-xs sm:text-sm text-green-700">
               <Check className="h-5 w-5" />
               ¡Verificación exitosa!
             </div>
           )}
         </div>
 
         {/* Action buttons */}
         <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
           {/* Copy Button */}
           <Button
             variant="outline"
             onClick={handleCopy}
             className="flex-1 border-gray-300 text-[#1c1c1c] hover:bg-gray-100"
           >
             {copied ? (
               <>
                 <Check className="h-4 w-4 mr-2 text-green-600" />
                 ¡Copiado!
               </>
             ) : (
               <>
                 <Copy className="h-4 w-4 mr-2" />
                 Copiar Código
               </>
             )}
           </Button>
 
           {/* Verify Button */}
           <Button
             onClick={handleVerify}
             disabled={state === 'verifying' || state === 'success'}
             className="flex-1 bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white"
           >
             {state === 'verifying' ? (
               <>
                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                 Buscando...
               </>
             ) : state === 'success' ? (
               <>
                 <Check className="h-4 w-4 mr-2" />
                 ¡Verificado!
               </>
             ) : (
               'Verificar ahora'
             )}
           </Button>
         </div>
       </DialogContent>
     </Dialog>
   );
 }