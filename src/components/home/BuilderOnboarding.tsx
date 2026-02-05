 import { useState, useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { X, Check, Circle } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Progress } from '@/components/ui/progress';
 import type { ChecklistItem } from '@/hooks/useProfileCompletion';
 
 interface BuilderOnboardingProps {
   percentage: number;
   checklist: ChecklistItem[];
   onDismiss: () => void;
 }
 
 const STORAGE_KEY = 'onboarding_dismissed';
 
 export function BuilderOnboarding({ percentage, checklist, onDismiss }: BuilderOnboardingProps) {
   const navigate = useNavigate();
   const [visible, setVisible] = useState(true);
 
   useEffect(() => {
     const dismissed = localStorage.getItem(STORAGE_KEY);
     if (dismissed === 'true') {
       setVisible(false);
     }
   }, []);
 
   const handleDismiss = () => {
     localStorage.setItem(STORAGE_KEY, 'true');
     setVisible(false);
     onDismiss();
   };
 
   if (!visible) return null;
 
   return (
     <div className="bg-card border border-border rounded-lg p-4 md:p-6 relative">
       {/* Close button */}
       <button
         onClick={handleDismiss}
         className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
         aria-label="Cerrar"
       >
         <X className="h-4 w-4" />
       </button>
 
       {/* Header */}
       <div className="mb-4 pr-6">
         <h3 className="text-base font-semibold text-foreground">
           Tu identidad esta al {Math.round(percentage)}%
         </h3>
       </div>
 
       {/* Progress bar */}
       <Progress value={percentage} className="h-2 mb-4" />
 
       {/* Checklist */}
       <ul className="space-y-2 mb-4">
         {checklist.map((item) => (
           <li key={item.key} className="flex items-center gap-2 text-sm">
             {item.completed ? (
               <Check className="h-4 w-4 text-primary" />
             ) : (
               <Circle className="h-4 w-4 text-muted-foreground" />
             )}
             <span
               className={
                 item.completed
                   ? 'text-foreground'
                   : 'text-muted-foreground'
               }
             >
               {item.label}
             </span>
           </li>
         ))}
       </ul>
 
       {/* Persuasive text */}
       <p className="text-sm text-muted-foreground mb-4">
         Los perfiles completos reciben 3x mas visitas.
       </p>
 
       {/* CTA */}
       <Button
         onClick={() => navigate('/me/profile')}
         size="sm"
         className="w-full sm:w-auto"
       >
         Completar mi Perfil
       </Button>
     </div>
   );
 }