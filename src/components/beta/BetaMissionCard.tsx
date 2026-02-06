import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { parseMarkdown } from '@/lib/markdown';
import { Shield, ExternalLink, FileText, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface BetaMissionCardProps {
  instructions: string | null;
  betaLink: string | null;
}

export function BetaMissionCard({ instructions, betaLink }: BetaMissionCardProps) {
  const { t } = useTranslation('beta');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (betaLink) {
      navigator.clipboard.writeText(betaLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied');
    }
  };

  return (
    <Card className="h-full border-primary/20 flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Shield className="w-4 h-4 text-primary" />
          Tu Misión
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 flex flex-col">
        {/* Instructions */}
        <div className="flex-1 space-y-3">
          {instructions ? (
            <div 
              className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(instructions) }}
            />
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {t('noInstructions')}
            </p>
          )}
        </div>

        {/* Access Button Footer */}
        {betaLink ? (
          <div className="pt-2">
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                size="lg"
                onClick={() => window.open(betaLink, '_blank')}
              >
                {t('accessLink')}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic text-center py-2">
            {t('noLink')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
