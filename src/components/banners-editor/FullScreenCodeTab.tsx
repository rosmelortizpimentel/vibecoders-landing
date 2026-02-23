import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, Code, Info } from "lucide-react";
import { toast } from "sonner";

interface FullScreenCodeTabProps {
  apiKey: string | undefined;
  projectDomain: string | undefined;
}

export const FullScreenCodeTab = ({
  apiKey,
  projectDomain,
}: FullScreenCodeTabProps) => {
  const [copied, setCopied] = useState(false);

  const scriptCode = `<script src="https://cdn.toggleup.io/v1/sdk.js" data-project-id="${apiKey || 'YOUR_API_KEY'}"></script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scriptCode);
      setCopied(true);
      toast.success("Script copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Error al copiar");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Code className="w-4 h-4" />
            Script de Instalación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Copia y pega este script en el <code className="bg-muted px-1 py-0.5 rounded text-xs">&lt;head&gt;</code> de tu sitio web 
            <strong className="text-foreground"> {projectDomain}</strong>.
          </p>
          
          <div className="relative">
            <pre className="bg-foreground text-background p-4 rounded-lg overflow-x-auto text-sm font-mono">
              <code>{scriptCode}</code>
            </pre>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Sobre los subdominios</h4>
              <p className="text-sm text-muted-foreground">
                Este script funciona automáticamente en todos los subdominios de tu dominio principal.
                Por ejemplo, si tu dominio es <strong>example.com</strong>, el script también funcionará en 
                <strong> app.example.com</strong>, <strong>blog.example.com</strong>, etc.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
