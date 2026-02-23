import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { type PopupConfig, type PopupRules } from '@/hooks/usePopups';
import { type BrandingOverrides } from '@/hooks/useDomainBranding';

interface AIGenerateRequest {
    prompt: string;
    branding: BrandingOverrides | null;
    logoUrl: string | null;
    currentConfig?: PopupConfig | null;
    previousMessages?: { role: 'user' | 'assistant'; content: string }[];
    projectId?: string;
    popupId?: string | null;
}

interface AIGenerateResponse {
    config: PopupConfig;
    rules?: Partial<PopupRules>;
    message?: string;
}

export const useAIPopupGenerator = () => {
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);

    const generateMutation = useMutation({
        mutationFn: async (request: AIGenerateRequest): Promise<AIGenerateResponse> => {
            const { data, error } = await supabase.functions.invoke('toggleup-proxy', {
                body: {
                    action: 'generate_popup_config',
                    payload: {
                        prompt: request.prompt,
                        branding: request.branding,
                        logoUrl: request.logoUrl,
                        currentConfig: request.currentConfig,
                        conversationHistory: request.previousMessages || [],
                        projectId: request.projectId,
                        popupId: request.popupId,
                    }
                },
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            return data as AIGenerateResponse;
        },
        onSuccess: (data, variables) => {
            setMessages(prev => [
                ...prev,
                { role: 'user', content: variables.prompt },
                { role: 'assistant', content: data.message || 'Popup generado' },
            ]);
        },
    });

    const generate = async (
        prompt: string,
        branding: BrandingOverrides | null,
        logoUrl: string | null,
        currentConfig?: PopupConfig | null,
        projectId?: string,
        popupId?: string | null
    ) => {
        return generateMutation.mutateAsync({
            prompt,
            branding,
            logoUrl,
            currentConfig,
            previousMessages: messages,
            projectId,
            popupId,
        });
    };

    const clearHistory = () => {
        setMessages([]);
    };

    return {
        generate,
        messages,
        clearHistory,
        isLoading: generateMutation.isPending,
        error: generateMutation.error,
    };
};
