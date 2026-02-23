import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type PopupConfig, type PopupRules } from "@/hooks/usePopups";
import { type BrandingOverrides } from "@/hooks/useDomainBranding";
import { useAIPopupGenerator } from "@/hooks/useAIPopupGenerator";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface AIPopupChatProps {
    popupId: string;
    branding: BrandingOverrides | null;
    logoUrl: string | null;
    currentConfig: PopupConfig;
    onApplyConfig: (config: PopupConfig, rules?: Partial<PopupRules>) => void;
}

export const AIPopupChat = ({
    popupId,
    branding,
    logoUrl,
    currentConfig,
    onApplyConfig,
}: AIPopupChatProps) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const previousPopupIdRef = useRef<string>(popupId);
    const { generate, messages, clearHistory, isLoading } = useAIPopupGenerator();

    // Clear AI history when switching to a different popup
    useEffect(() => {
        if (previousPopupIdRef.current !== popupId) {
            clearHistory();
            previousPopupIdRef.current = popupId;
        }
    }, [popupId, clearHistory]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const prompt = input.trim();
        setInput("");

        try {
            const result = await generate(prompt, branding, logoUrl, currentConfig);
            if (result.config) {
                onApplyConfig(result.config, result.rules);
                toast.success(t('editor.ai.config_applied'));
            }
        } catch (error) {
            toast.error(t('editor.ai.error'));
            console.error("AI generation error:", error);
        }
    };

    if (!isOpen) {
        return (
            <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] gap-1.5"
                onClick={() => setIsOpen(true)}
            >
                <Sparkles className="w-3 h-3" />
                {t('editor.ai.generate')}
            </Button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-card border border-border rounded-lg shadow-xl z-50 flex flex-col max-h-96">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium">{t('editor.ai.assistant')}</span>
                </div>
                <div className="flex items-center gap-1">
                    {messages.length > 0 && (
                        <button
                            onClick={clearHistory}
                            className="p-1 hover:bg-muted rounded"
                            title={t('editor.ai.clear_history')}
                        >
                            <RotateCcw className="w-3 h-3 text-muted-foreground" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-muted rounded"
                    >
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[100px]">
                {messages.length === 0 ? (
                    <div className="text-[10px] text-muted-foreground text-center py-4">
                        <p className="mb-2">{t('editor.ai.description_prompt')}</p>
                        <div className="space-y-1 text-left">
                            <p className="p-1.5 bg-muted rounded text-[9px]">
                                {t('editor.ai.sample_maintenance')}
                            </p>
                            <p className="p-1.5 bg-muted rounded text-[9px]">
                                {t('editor.ai.sample_discount')}
                            </p>
                            <p className="p-1.5 bg-muted rounded text-[9px]">
                                {t('editor.ai.sample_urgent')}
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`text-[10px] p-2 rounded ${msg.role === "user"
                                ? "bg-primary text-primary-foreground ml-4"
                                : "bg-muted mr-4"
                                }`}
                        >
                            {msg.content}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-2 border-t border-border">
                <div className="flex gap-1.5">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('editor.ai.placeholder')}
                        className="flex-1 h-7 px-2 text-[11px] bg-muted border-0 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="h-7 w-7"
                        disabled={!input.trim() || isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <Send className="w-3 h-3" />
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};
