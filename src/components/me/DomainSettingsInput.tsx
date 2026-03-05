import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, X, Globe, RefreshCw, Crown, Copy } from 'lucide-react';
import { ProBadge } from "@/components/ui/ProBadge";
import { UpgradeBadge } from "@/components/ui/UpgradeBadge";
import { useTranslation } from '@/hooks/useTranslation';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DomainSettingsInputProps {
  appId: string;
  appName: string;
  initialDomain: string | null;
  baseDomain?: string;
  onDomainChange: (domain: string | null) => void;
  onRefetch?: () => void;
  disabled?: boolean;
}

export const DomainSettingsInput: React.FC<DomainSettingsInputProps> = ({
  appId,
  appName,
  initialDomain,
  baseDomain,
  onDomainChange,
  onRefetch,
  disabled
}) => {
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState<'idle' | 'adding' | 'verifying' | 'removing'>('idle');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [showDNS, setShowDNS] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { t } = useTranslation('roadmap');
  const { isFounder, isPro } = useSubscription();

  const checkVerification = useCallback(async (domainName: string, force = false) => {
    if (!domainName || status === 'verifying') return;
    
    setStatus('verifying');
    try {
      const { data, error } = await supabase.functions.invoke('verify-domain_v1', {
        body: { domain: domainName, appId }
      });

      if (error) throw error;
      setVerificationResult(data);
    } catch (err) {
      console.error('Error verifying domain:', err);
      if (force) toast.error(t('editor.domain.verifyError'));
    } finally {
      setStatus('idle');
    }
  }, [appId, t, status]);

  useEffect(() => {
    if (initialDomain && !verificationResult && status === 'idle') {
      checkVerification(initialDomain);
    }
  }, [initialDomain, verificationResult, status, checkVerification]);

  const handleAddDomain = async () => {
    if (!domain.trim()) return;
    const fullDomain = baseDomain ? `${domain}.${baseDomain}` : domain;
    setStatus('adding');
    try {
      const { error } = await supabase.functions.invoke('add-domain_v1', {
        body: { domain: fullDomain, appId }
      });
      if (error) throw error;
      toast.success(t('editor.domain.addSuccess'));
      onDomainChange(fullDomain);
      setDomain('');
      checkVerification(fullDomain, true);
    } catch (err: any) {
      console.error('Error adding domain:', err);
      toast.error(err.message || t('editor.domain.addError'));
    } finally { setStatus('idle'); }
  };

  const handleRemoveDomain = async () => {
    if (!initialDomain) return;
    setStatus('removing');
    try {
      const { error } = await supabase.functions.invoke('remove-domain_v1', {
        body: { domain: initialDomain, appId }
      });
      if (error) throw error;
      toast.success(t('editor.domain.removeSuccess'));
      onDomainChange(null);
      setVerificationResult(null);
      if (onRefetch) onRefetch();
    } catch (err) {
      console.error('Error removing domain:', err);
      toast.error(t('editor.domain.removeError'));
    } finally { setStatus('idle'); }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { price_id: 'price_1Qf7eBKh9U3U3U3U3U3U3U3U' }
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Error initiating checkout');
    } finally { setCheckoutLoading(false); }
  };

  const isInputDisabled = disabled || status !== 'idle';
  const exampleSubdomain = "roadmap";
  const exampleBase = baseDomain || (appName ? `${appName.toLowerCase().replace(/\s+/g, '')}.com` : "tuempresa.com");
  const exampleString = baseDomain ? `${exampleSubdomain}.${baseDomain}` : `${exampleSubdomain}.${exampleBase}`;

  return (
    <div className={cn("space-y-4 bg-muted/30 p-4 rounded-2xl border transition-all duration-300", disabled && "opacity-50 pointer-events-none")}>
      {/* Top Badge Area */}
      {/* Replaced internal badge area with a simple top spacer if needed, or removed to keep it tight */}

      {!initialDomain ? (
        <div className="space-y-2 pb-2">
          <p className="text-xs text-muted-foreground mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
            {t('editor.domain.subtitle', { example: exampleString })}
          </p>
          <div className="space-y-2">
            <div className="flex items-center bg-background border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-primary h-10 px-3">
              <span className="text-muted-foreground text-sm font-medium pr-2 border-r mr-2">https://</span>
              <input 
                placeholder={baseDomain ? t('editor.domain.subdomainPlaceholder') : t('editor.domain.placeholder')} 
                value={domain} 
                onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1 bg-transparent border-none outline-none text-sm h-full"
                disabled={isInputDisabled}
              />
              {baseDomain && (
                <span className="text-muted-foreground text-sm font-medium border-l pl-2 ml-1">.{baseDomain}</span>
              )}
            </div>
            <Button size="sm" onClick={handleAddDomain} disabled={!domain.trim() || isInputDisabled} className="w-full h-9">
              {status === 'adding' ? <Loader2 className="w-4 h-4 animate-spin" /> : t('editor.domain.addButton')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-zinc-950/5 p-2 px-3 border rounded-xl shadow-sm border-zinc-200/50">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-semibold tracking-tight">{initialDomain}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-black rounded-full"
                onClick={() => checkVerification(initialDomain, true)} disabled={status !== 'idle'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${status === 'verifying' ? 'animate-spin' : ''}`} />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full" disabled={status !== 'idle'}>
                    {status === 'removing' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('editor.domain.removeConfirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('editor.domain.removeConfirmDescription')}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('editor.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemoveDomain} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {t('editor.domain.removeConfirmAction')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          {(status === 'verifying' && !verificationResult) ? (
            <div className="bg-zinc-50 border border-zinc-200/50 rounded-xl p-6 flex flex-col items-center justify-center gap-3 animate-pulse">
              <RefreshCw className="w-5 h-5 text-zinc-300 animate-spin" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Sincronizando...</span>
              </div>
            </div>
          ) : (
            <>
              {(verificationResult?.status?.verified || verificationResult?.verified) ? (
                <div className="space-y-3">
                  <div className="bg-zinc-950/5 border border-zinc-200/50 rounded-xl p-4 flex items-center justify-between gap-4 animate-in fade-in zoom-in duration-500 shadow-sm">
                    <div className="flex items-center gap-3 text-zinc-900/80">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">Activo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowDNS(!showDNS)}
                        className="text-[9px] uppercase font-black text-zinc-400 hover:text-black hover:bg-transparent px-2 h-7 tracking-tighter"
                      >
                        {showDNS ? 'Ocultar DNS' : 'Ver DNS'}
                      </Button>
                      <a 
                        href={`https://${initialDomain}`} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] bg-black text-white hover:bg-zinc-800 px-4 py-2 rounded-lg font-black uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all active:scale-95"
                      >
                        <span>Abrir</span>
                        <Globe className="w-3 h-3 text-white/70" />
                      </a>
                    </div>
                  </div>

                  {showDNS && (
                    <div className="bg-zinc-50 border border-zinc-200/50 rounded-xl p-4 text-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-muted-foreground italic text-[10px]">
                        Registros DNS configurados para: <span className="text-zinc-900 font-black">{initialDomain}</span>
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { label: 'Tipo', value: verificationResult?.config?.cname ? 'CNAME' : (verificationResult?.config?.aValues ? 'A' : (initialDomain?.split('.').length > 2 ? 'CNAME' : 'A')) },
                          { label: 'Nombre', value: (initialDomain?.split('.').length > 2 && initialDomain?.split('.')[0] !== 'www') ? initialDomain?.split('.')[0] : (initialDomain?.startsWith('www.') ? 'www' : '@') },
                          { label: 'Valor', value: verificationResult?.config?.cname || verificationResult?.config?.aValues?.[0] || (initialDomain?.split('.').length > 2 ? 'cname.vercel-dns.com' : '76.76.21.21') }
                        ].map((row, i) => (
                          <div key={i} className="flex items-center justify-between bg-white border border-zinc-200 p-2 px-3 rounded-lg group">
                            <div className="flex flex-col">
                              <span className="text-[9px] uppercase text-zinc-400 font-bold">{row.label}</span>
                              <span className="text-xs font-mono font-bold text-zinc-800 truncate max-w-[140px]">{row.value}</span>
                            </div>
                            <Button 
                              variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all hover:bg-zinc-100"
                              onClick={() => { navigator.clipboard.writeText(row.value); toast.success(`${row.label} copiado`); }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {(!isFounder && !isPro) ? (
                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 text-xs space-y-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <ProBadge />
                        <UpgradeBadge className="ml-1" />
                      </div>
                      <p className="text-muted-foreground">Actualiza para conectar tu propia marca.</p>
                      <Button onClick={handleCheckout} disabled={checkoutLoading} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-9">
                        {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Desbloquear"}
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-zinc-50 border border-zinc-200/50 rounded-xl p-4 text-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-muted-foreground italic text-[10px]">
                        Añade estos registros para: <span className="text-zinc-900 font-black">{initialDomain}</span>
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { label: 'Tipo', value: verificationResult?.config?.cname ? 'CNAME' : (verificationResult?.config?.aValues ? 'A' : (initialDomain?.split('.').length > 2 ? 'CNAME' : 'A')) },
                          { label: 'Nombre', value: (initialDomain?.split('.').length > 2 && initialDomain?.split('.')[0] !== 'www') ? initialDomain?.split('.')[0] : (initialDomain?.startsWith('www.') ? 'www' : '@') },
                          { label: 'Valor', value: verificationResult?.config?.cname || verificationResult?.config?.aValues?.[0] || (initialDomain?.split('.').length > 2 ? 'cname.vercel-dns.com' : '76.76.21.21') }
                        ].map((row, i) => (
                          <div key={i} className="flex items-center justify-between bg-white border border-zinc-200 p-2 px-3 rounded-lg group">
                            <div className="flex flex-col">
                              <span className="text-[9px] uppercase text-zinc-400 font-bold">{row.label}</span>
                              <span className="text-xs font-mono font-bold text-zinc-800 truncate max-w-[150px]">{row.value}</span>
                            </div>
                            <Button 
                              variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all hover:bg-zinc-100"
                              onClick={() => { navigator.clipboard.writeText(row.value); toast.success(`${row.label} copiado`); }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 p-2 pt-0">
                        <div className="w-1 h-1 rounded-full bg-zinc-400" />
                        <p className="text-[9px] text-zinc-400 italic">La propagación puede tardar. Refresca para validar.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
