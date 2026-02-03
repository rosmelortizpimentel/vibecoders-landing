// Google Identity Services TypeScript declarations
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleOneTapConfig) => void;
          prompt: (callback?: (notification: PromptNotification) => void) => void;
          cancel: () => void;
          revoke: (hint: string, callback?: () => void) => void;
        };
      };
    };
  }
}

export interface GoogleOneTapConfig {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: 'signin' | 'signup' | 'use';
  itp_support?: boolean;
  use_fedcm_for_prompt?: boolean;
  // Legacy top-level nonce (deprecated by Google; removal scheduled around Chrome 145)
  nonce?: string;
  // New structure for FedCM / future Chrome versions
  params?: {
    nonce?: string;
    [key: string]: unknown;
  };
}

export interface CredentialResponse {
  credential: string;
  select_by: string;
  clientId?: string;
}

export interface PromptNotification {
  getMomentType: () => string;
  getDismissedReason: () => string;
}
