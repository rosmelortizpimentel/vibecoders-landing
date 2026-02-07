 import { useState, useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { X, Check, Circle } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Progress } from '@/components/ui/progress';
 import { useTranslation } from '@/hooks/useTranslation';
 import type { ChecklistItem } from '@/hooks/useProfileCompletion';
 
 interface BuilderOnboardingProps {
   percentage: number;
   checklist: ChecklistItem[];
   onDismiss: () => void;
 }
 
 const STORAGE_KEY = 'onboarding_dismissed';
 
 export function BuilderOnboarding({ percentage, checklist, onDismiss }: BuilderOnboardingProps) {
   const navigate = useNavigate();
   const t = useTranslation('home');
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
 
   const titleText = (t.onboarding?.titleWithPercent || 'Your identity is at {percent}%')
     .replace('{percent}', String(Math.round(percentage)));
 
   return (
     <div className="bg-card border border-border rounded-xl p-4 relative w-full">
       {/* Close button */}
       <button
         onClick={handleDismiss}
         className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
         aria-label={t.onboarding?.close || 'Close'}
       >
         <X className="h-4 w-4" />
       </button>
 
       {/* Header */}
       <div className="mb-3 pr-6">
         <h3 className="text-sm sm:text-base font-semibold text-foreground">
           {titleText}
         </h3>
       </div>
 
       {/* Progress bar */}
       <Progress value={percentage} className="h-2 mb-3" />
 
       {/* Checklist */}
       <ul className="space-y-1.5 mb-3">
         {checklist.map((item) => (
           <li key={item.key} className="flex items-center gap-2 text-xs sm:text-sm">
             {item.completed ? (
               <Check className="h-4 w-4 text-primary flex-shrink-0" />
             ) : (
               <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
       <p className="text-xs sm:text-sm text-muted-foreground mb-3">
         {t.onboarding?.persuasiveText || 'Complete profiles get 3x more views.'}
       </p>
 
       {/* CTA */}
       <Button
         onClick={() => navigate('/me/profile')}
         size="sm"
         className="w-full"
       >
         {t.onboarding?.ctaButton || 'Complete my Profile'}
       </Button>
     </div>
   );
 }