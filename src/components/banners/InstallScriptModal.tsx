import { useState } from "react";
import { Check, Copy, Code, AlertCircle, Info, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface InstallScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  appName: string;
}

export function InstallScriptModal({ isOpen, onClose, projectId, appName }: InstallScriptModalProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  // Clean appName for domain usage if it looks like a URL
  const domain = appName.toLowerCase().replace(/^https?:\/\//, '').split('/')[0];

  const scriptSnippet = `<script src="https://cdn.toggleup.io/v1/sdk.js" data-project-id="${projectId}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptSnippet);
    setCopied(true);
    toast.success(t('banners.install.copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden border-none shadow-2xl bg-white rounded-3xl">
        <div className="p-8">
          <DialogHeader className="flex flex-row items-center gap-4 mb-8">
            <div className="text-zinc-600">
              <Code className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-900">
              {t('banners.install.header').replace('{appName}', appName)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8">
            <div className="bg-[#FFF9F2] border border-[#FFEDD5] rounded-2xl p-6 flex gap-4 transition-all duration-300 hover:shadow-sm">
              <div className="bg-amber-100/50 p-2 h-fit rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              </div>
              <p className="text-[15px] text-amber-900 leading-relaxed font-medium">
                {t('banners.install.paste_once').split('{headTag}').map((part, i, arr) => (
                  <span key={i}>
                    {part.split('{allPopups}').map((subpart, j, subarr) => (
                      <span key={j}>
                        {subpart}
                        {j < subarr.length - 1 && <strong className="font-bold border-b-2 border-amber-500/20">{t('banners.install.all_popups')}</strong>}
                      </span>
                    ))}
                    {i < arr.length - 1 && <code className="bg-amber-100 px-1.5 py-0.5 rounded-md text-amber-950 font-mono text-[14px] font-bold">&lt;head&gt;</code>}
                  </span>
                ))}
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em] pl-1">
                {t('banners.install.embed_code')}
              </label>
              <div className="bg-[#0A0A0A] p-8 rounded-2xl font-mono text-[14px] leading-relaxed break-all text-zinc-200 border border-zinc-900 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] overflow-x-auto min-h-[120px] flex items-center group relative cursor-pointer active:brightness-95 transition-all" onClick={handleCopy}>
                {scriptSnippet}
                <div className="absolute top-4 right-4 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Copy className="h-4 w-4" />
                </div>
              </div>
            </div>

            <p className="text-[14px] text-zinc-500 leading-relaxed font-medium px-1">
              {t('banners.install.domain_message')
                .split('{domain}')
                .map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && <strong className="text-zinc-900 font-bold underline decoration-zinc-200 decoration-2 underline-offset-4">{domain}</strong>}
                  </span>
                ))
              }
            </p>

            <Button
              className="w-full h-16 bg-[#000] hover:bg-[#111] text-white rounded-2xl text-[17px] font-bold shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.15)] transition-all active:scale-[0.98] gap-4"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-6 w-6 text-green-400" /> : <Copy className="h-6 w-6 text-zinc-100" />}
              {copied ? t('banners.install.copied') : t('banners.install.copy_button')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
