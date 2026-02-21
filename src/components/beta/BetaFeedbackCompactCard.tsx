import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { MyFeedback } from '@/hooks/useMyFeedback';
import { cn } from '@/lib/utils';

interface BetaFeedbackCompactCardProps {
  feedback: MyFeedback;
}

export function BetaFeedbackCompactCard({ feedback }: BetaFeedbackCompactCardProps) {
  const navigate = useNavigate();
  
  const status = feedback.status;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'closed':
        return {
          label: 'Resuelto',
          icon: CheckCircle2,
          className: 'border-[#68CFA2]/40 text-[#68CFA2]',
          iconClass: 'text-[#68CFA2]'
        };
      case 'in_review':
        return {
          label: 'En Revisión',
          icon: Clock,
          className: 'border-blue-500/40 text-blue-500',
          iconClass: 'text-blue-500'
        };
      default:
        return {
          label: 'Abierto',
          icon: AlertCircle,
          className: 'border-[#FFD700]/50 text-[#D4A800]',
          iconClass: 'text-[#D4A800]'
        };
    }
  };

  const config = getStatusConfig(status);
  const StatusIcon = config.icon;

  return (
    <Card 
      className="w-full border-border bg-card/50 hover:bg-card transition-all cursor-pointer group"
      onClick={() => navigate(`/app/${feedback.app_id}/feedback`)}
    >
      <CardContent className="p-3 flex flex-col gap-2">
        {/* App Info */}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 rounded-lg border border-border shrink-0">
            {feedback.app.logo_url ? (
              <AvatarImage src={feedback.app.logo_url} alt={feedback.app.name} className="object-contain p-0.5" />
            ) : (
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
                {feedback.app.name.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors">
              {feedback.app.name}
            </h4>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <MessageSquare className="w-2.5 h-2.5" />
              {feedback.type.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex">
          <Badge variant="outline" className={cn("bg-transparent gap-1 font-medium text-[10px] px-3 py-1 rounded-2xl", config.className)}>
            <StatusIcon className={cn("w-3 h-3", config.iconClass)} />
            {config.label}
          </Badge>
        </div>

        <p className="text-[10px] text-muted-foreground line-clamp-1 italic">
          "{feedback.content}"
        </p>
      </CardContent>
    </Card>
  );
}
