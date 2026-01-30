import { supabase } from '@/integrations/supabase/client';
import { collectDeviceInfo } from './deviceInfo';

export interface WaitlistResult {
  success: boolean;
  alreadyExists: boolean;
  error?: string;
}

export async function registerToWaitlist(email: string): Promise<WaitlistResult> {
  const deviceInfo = collectDeviceInfo();

  const { error } = await supabase
    .from('waitlist')
    .insert({
      email: email.toLowerCase().trim(),
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
  const { data, error } = await supabase
    .from('waitlist')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (error) {
    console.error('Error checking email:', error);
    return false;
  }

  return !!data;
}
