import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ToggleUpProxyService } from '@/services/toggleUpProxy';
import { usePopups } from './usePopups';

export interface DomainScrape {
  id: string;
  project_id: string;
  url?: string;
  branding: any;
  stored_images: any;
}

export interface BrandingOverrides {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
  typography?: {
    fontFamily?: string;
    borderRadius?: string;
  };
  components?: {
    buttonPrimaryBg?: string;
    buttonPrimaryText?: string;
    buttonPrimaryBorderRadius?: string;
    buttonSecondaryBg?: string;
    buttonSecondaryText?: string;
    buttonSecondaryBorderRadius?: string;
  };
}

export const useDomainBranding = (vibecodersAppId?: string) => {
    return useQuery({
        queryKey: ['branding', vibecodersAppId],
        queryFn: async () => {
            if (!vibecodersAppId) return null;
            const data = await ToggleUpProxyService.getBranding(vibecodersAppId);
            return data.branding as BrandingOverrides;
        },
        enabled: !!vibecodersAppId,
    });
};

export const useUpdateDomainBranding = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ vibecodersAppId, branding }: { vibecodersAppId: string; branding: BrandingOverrides }) =>
            ToggleUpProxyService.updateBranding(vibecodersAppId, branding as Record<string, unknown>),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['branding', variables.vibecodersAppId] });
            queryClient.invalidateQueries({ queryKey: ['domain-scrape', variables.vibecodersAppId] });
        },
    });
};

export const useDomainScrape = (vibecodersAppId?: string) => {
  return useQuery({
    queryKey: ['domain-scrape', vibecodersAppId],
    queryFn: async () => {
      if (!vibecodersAppId) return null;
      const data = await ToggleUpProxyService.getBranding(vibecodersAppId);
      return data.domainScrape as DomainScrape;
    },
    enabled: !!vibecodersAppId,
  });
};

export const getProjectLogoUrl = (domainScrape: DomainScrape | null | undefined, brandingOverrides: BrandingOverrides | null) => {
    return null;
};

export const useBrandingColors = (overrides?: BrandingOverrides | null) => {
    return {
        colors: {
            primary: '#3b82f6',
            secondary: '#10b981',
            background: '#ffffff',
            text: '#1a1a1a',
        }
    };
};

