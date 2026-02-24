import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { ToggleUpProxyService } from '@/services/toggleUpProxy';
import { cleanDomain } from '@/utils/domain';

// Button configuration for banners
export interface BannerButton {
  text: string;
  action: 'link' | 'close';
  url: string;
  style: {
    backgroundColor: string;
    textColor: string;
    borderRadius: string;
  };
}

// Image configuration for banners
export interface BannerImage {
  url: string;
  position: 'left' | 'right';
  height: string;
}

// Content style configuration
export interface ContentStyle {
  text: string;
  style: {
    color: string;
    fontWeight?: string;
    fontSize?: string;
  };
}

// Feature item for modal benefits list
export interface ModalFeature {
  icon: string;
  text: string;
}

// Button configuration for modals
export interface ModalButton {
  text: string;
  action: 'link' | 'close';
  url?: string;
  primary?: boolean;
  style: {
    backgroundColor: string;
    textColor: string;
    borderRadius: string;
  };
}

// Footer for modal
export interface ModalFooter {
  text: string;
  links: { text: string; url: string }[];
}

// Image for modal
export interface ModalImage {
  url: string;
  position: 'top' | 'left' | 'right' | 'background';
  height: string;
  centered?: boolean;
}

// Modal content
export interface ModalContent {
  headline: ContentStyle;
  body: ContentStyle;
  image?: ModalImage;
  features?: ModalFeature[];
  input?: {
    enabled: boolean;
    type: 'email' | 'text' | 'phone';
    placeholder: string;
  };
}

export interface PopupConfig {
  type: 'modal' | 'bar';
  position: 'top' | 'bottom' | null;
  fixed: boolean;
  showCloseButton: boolean;
  size?: 'small' | 'medium' | 'large' | 'custom';
  customWidth?: string;
  customHeight?: string;
  closeOnOverlay?: boolean;
  content: {
    headline: ContentStyle;
    body?: ContentStyle;
    image?: BannerImage | ModalImage;
    features?: ModalFeature[];
    input?: {
      enabled: boolean;
      type: 'email' | 'text' | 'phone';
      placeholder: string;
    };
    footer?: ModalFooter;
  };
  buttons?: (BannerButton | ModalButton)[];
  colors?: {
    background?: string;
    overlay?: string;
  };
  style: {
    backgroundColor?: string;
    fontFamily?: string;
    borderRadius?: string;
    boxShadow?: string;
    padding?: string;
    loadFont?: boolean;
  };
}

export interface UrlPattern {
  type: 'exact' | 'contains' | 'startsWith' | 'regex';
  value: string;
}

export interface PopupRules {
  urlTargeting: {
    mode: 'all' | 'include' | 'exclude';
    patterns: UrlPattern[];
  };
  subdomainTargeting: {
    mode: 'all' | 'include' | 'exclude';
    list: string[];
  };
  deviceTargeting: {
    desktop: boolean;
    tablet: boolean;
    mobile: boolean;
  };
  scheduling: {
    enabled: boolean;
    startAt: string | null;
    endAt: string | null;
    timezone: string;
  };
  trigger: {
    type: 'immediate' | 'time_delay' | 'exit_intent' | 'scroll_percent';
    value: number;
  };
  frequency: {
    cap: 'always' | 'once_per_session' | 'once_per_day' | 'once_per_week' | 'once_ever';
  };
}

// This interface matches ToggleUp's actual popups table columns
export interface Popup {
  id: string;
  project_id: string;
  name: string;
  config: PopupConfig;
  rules: PopupRules;
  is_active: boolean;
  start_at: string | null;
  end_at: string | null;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_MODAL_CONFIG: PopupConfig = {
  type: 'modal',
  position: 'top',
  fixed: true,
  showCloseButton: true,
  size: 'medium',
  content: {
    headline: { text: "Welcome!", style: { color: "#1a1a1a", fontSize: "24px", fontWeight: "bold" } },
    body: { text: "We're glad to have you here.", style: { color: "#666666", fontSize: "16px" } },
  },
  buttons: [
    { text: "Get Started", action: "close", style: { backgroundColor: "#3b82f6", textColor: "#ffffff", borderRadius: "8px" } }
  ],
  style: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    fontFamily: "Inter"
  }
};

export const DEFAULT_BANNER_CONFIG: PopupConfig = {
  type: 'bar',
  position: 'top',
  fixed: true,
  showCloseButton: true,
  content: {
    headline: { text: "Announcement!", style: { color: "#ffffff", fontSize: "14px", fontWeight: "bold" } },
  },
  buttons: [
    { text: "Learn More", action: "link", url: "#", style: { backgroundColor: "#ffffff", textColor: "#3b82f6", borderRadius: "4px" } }
  ],
  style: {
    backgroundColor: "#3b82f6",
    fontFamily: "Inter"
  }
};

export const DEFAULT_RULES: PopupRules = {
  urlTargeting: { mode: 'all', patterns: [] },
  subdomainTargeting: { mode: 'all', list: [] },
  deviceTargeting: { desktop: true, tablet: true, mobile: true },
  scheduling: { enabled: false, startAt: null, endAt: null, timezone: 'UTC' },
  trigger: { type: 'immediate', value: 0 },
  frequency: { cap: 'always' }
};

// ── React Query Hooks ──

/**
 * Fetch all popups for a Vibecoders app.
 * The proxy auto-creates the ToggleUp project on first access.
 */
 export function usePopups(vibecodersAppId: string | undefined, appName?: string, appUrl?: string) {
  return useQuery({
    queryKey: ['popups', vibecodersAppId],
    queryFn: () => (vibecodersAppId
      ? ToggleUpProxyService.getPopups(vibecodersAppId, appName, cleanDomain(appUrl))
      : Promise.resolve({ popups: [], projectId: '', api_key: '' })),
    enabled: !!vibecodersAppId,
  });
}

/**
 * Create a new popup for a Vibecoders app.
 */
 export function useCreatePopup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vibecodersAppId, appName, appUrl, popupData }: {
      vibecodersAppId: string;
      appName?: string;
      appUrl?: string;
      popupData: { name: string; config: PopupConfig; rules: PopupRules; is_active: boolean };
    }) => ToggleUpProxyService.createPopup(vibecodersAppId, popupData, appName, cleanDomain(appUrl)),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['popups', variables.vibecodersAppId] });
    },
  });
}

/**
 * Update an existing popup (ownership verified server-side).
 */
export function useUpdatePopup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ popupId, updates }: { popupId: string; updates: Partial<Popup> }) =>
      ToggleUpProxyService.updatePopup(popupId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popups'] });
    },
  });
}

/**
 * Delete a popup (ownership verified server-side).
 */
export function useDeletePopup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ popupId }: { popupId: string }) =>
      ToggleUpProxyService.deletePopup(popupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popups'] });
    },
  });
}
