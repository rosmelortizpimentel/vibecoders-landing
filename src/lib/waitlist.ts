import { supabase } from '@/integrations/supabase/client';
import { collectDeviceInfo } from './deviceInfo';

export interface WaitlistResult {
  success: boolean;
  alreadyExists: boolean;
  error?: string;
}

/**
 * Normaliza un email removiendo aliases (+algo)
 * cesaras+test@gmail.com → cesaras@gmail.com
 */
function normalizeEmail(email: string): string {
  const [localPart, domain] = email.toLowerCase().trim().split('@');
  if (!domain) return email.toLowerCase().trim();
  
  // Remover todo después del + en la parte local
  const normalizedLocal = localPart.split('+')[0];
  return `${normalizedLocal}@${domain}`;
}

export async function registerToWaitlist(email: string): Promise<WaitlistResult> {
  const deviceInfo = collectDeviceInfo();
  const normalizedEmail = normalizeEmail(email);

  // Verificar si ya existe (por email normalizado)
  const exists = await checkEmailExists(normalizedEmail);
  if (exists) {
    return { success: true, alreadyExists: true };
  }

  const { error } = await supabase
    .from('waitlist')
    .insert({
      email: normalizedEmail,
      ...deviceInfo,
    });

  if (error) {
    // Check for unique constraint violation (email already exists)
    if (error.code === '23505') {
      return { success: true, alreadyExists: true };
    }
    return { success: false, alreadyExists: false, error: error.message };
  }

  return { success: true, alreadyExists: false };
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);
  
  const { data, error } = await supabase
    .from('waitlist')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error('Error checking email:', error);
    return false;
  }

  return !!data;
}
