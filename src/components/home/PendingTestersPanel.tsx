import { FlaskConical, Check, X, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';

interface PendingTester {
  id: string;
  userId: string;
  appId: string;
  appName: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
}

interface PendingTestersPanelProps {
  testers: PendingTester[];
  onAccept: (testerId: string) => Promise<boolean>;
  onReject: (testerId: string) => Promise<boolean>;
  isLoading?: boolean;
}

export function PendingTestersPanel({
  testers,
  onAccept,
  onReject,
  isLoading,
}: PendingTestersPanelProps) {
  const t = useTranslation('home');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (testerId: string) => {
    setProcessingId(testerId);
    await onAccept(testerId);
    setProcessingId(null);
  };

  const handleReject = async (testerId: string) => {
    setProcessingId(testerId);
    await onReject(testerId);
    setProcessingId(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 h-full w-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-muted rounded-lg">
          <FlaskConical className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h3 className="font-semibold text-foreground text-sm">
          {t.actionCenter?.pendingTesters || 'Pending Testers'}
        </h3>
        {testers.length > 0 && (
          <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            {testers.length}
          </span>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : testers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {t.actionCenter?.noPending || 'No pending requests'}
        </div>
      ) : (
        <div className="space-y-2">
          {testers.map((tester) => (
            <div
              key={tester.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={tester.userAvatar} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(tester.userName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {tester.userName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {t.actionCenter?.wantsToJoin || 'wants to join'}{' '}
                  <span className="font-medium">{tester.appName}</span>
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-green-600 hover:bg-green-100 hover:text-green-700"
                  onClick={() => handleAccept(tester.id)}
                  disabled={processingId === tester.id}
                >
                  {processingId === tester.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-500 hover:bg-red-100 hover:text-red-600"
                  onClick={() => handleReject(tester.id)}
                  disabled={processingId === tester.id}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
