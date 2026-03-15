import { supabase } from '@/integrations/supabase/client';
import type { AvatarConfig, Workshop, Speaker, FairPresence } from './types';

export { supabase };

export async function fetchConfirmedWorkshops(): Promise<Workshop[]> {
  const { data: workshops, error: wErr } = await supabase
    .from('workshops')
    .select('*')
    .eq('is_confirmed', true)
    .order('scheduled_at', { ascending: true });

  if (wErr || !workshops) return [];

  const { data: wsData } = await supabase
    .from('workshop_speakers')
    .select('workshop_id, speaker_id');

  const { data: sData } = await supabase
    .from('speakers')
    .select('id, display_name, photo_url, tagline, email');

  const speakersMap = new Map<string, Speaker>();
  (sData || []).forEach((s: any) => speakersMap.set(s.id, s));

  const workshopSpeakers = new Map<string, Speaker[]>();
  (wsData || []).forEach((ws: any) => {
    const speaker = speakersMap.get(ws.speaker_id);
    if (speaker) {
      const list = workshopSpeakers.get(ws.workshop_id) || [];
      list.push(speaker);
      workshopSpeakers.set(ws.workshop_id, list);
    }
  });

  return workshops.map((w: any) => ({
    id: w.id,
    title: w.title,
    tagline: w.tagline,
    description: w.description,
    banner_url: w.banner_url,
    audio_url: w.audio_url ?? null,
    luma_url: w.luma_url ?? null,
    scheduled_at: w.scheduled_at,
    duration_minutes: w.duration_minutes,
    is_confirmed: w.is_confirmed,
    status: w.status,
    speakers: workshopSpeakers.get(w.id) || [],
  }));
}

export async function upsertVisitor(deviceId: string, name: string, avatar: AvatarConfig) {
  const { error } = await supabase
    .from('fair_visitors' as any)
    .upsert(
      { device_id: deviceId, name, avatar } as any,
      { onConflict: 'device_id' }
    );
  return !error;
}

export async function upsertPresence(presence: Omit<FairPresence, 'updated_at'>) {
  await supabase
    .from('fair_presence' as any)
    .upsert(
      { ...presence, updated_at: new Date().toISOString() } as any,
      { onConflict: 'device_id' }
    );
}

export async function removePresence(deviceId: string) {
  await supabase
    .from('fair_presence' as any)
    .delete()
    .eq('device_id', deviceId);
}

export async function recordStandVisit(deviceId: string, workshopId: string) {
  await supabase
    .from('fair_stand_visits' as any)
    .upsert(
      { device_id: deviceId, workshop_id: workshopId, visited_at: new Date().toISOString() } as any,
      { onConflict: 'device_id,workshop_id' }
    );
}

export async function fetchStandVisits(deviceId: string): Promise<string[]> {
  const { data } = await supabase
    .from('fair_stand_visits' as any)
    .select('workshop_id')
    .eq('device_id', deviceId);
  return (data || []).map((d: any) => d.workshop_id);
}

export async function fetchOnlineCount(): Promise<number> {
  const threshold = new Date(Date.now() - 30_000).toISOString();
  const { count } = await supabase
    .from('fair_presence' as any)
    .select('*', { count: 'exact', head: true })
    .gte('updated_at', threshold);
  return count || 0;
}

export function subscribePresence(
  onInsert: (p: FairPresence) => void,
  onUpdate: (p: FairPresence) => void,
  onDelete: (deviceId: string) => void,
) {
  const channel = supabase
    .channel('fair_presence_realtime')
    .on(
      'postgres_changes' as any,
      { event: 'INSERT', schema: 'public', table: 'fair_presence' },
      (payload: any) => onInsert(payload.new as FairPresence),
    )
    .on(
      'postgres_changes' as any,
      { event: 'UPDATE', schema: 'public', table: 'fair_presence' },
      (payload: any) => onUpdate(payload.new as FairPresence),
    )
    .on(
      'postgres_changes' as any,
      { event: 'DELETE', schema: 'public', table: 'fair_presence' },
      (payload: any) => onDelete(payload.old?.device_id),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function fetchAllPresence(): Promise<FairPresence[]> {
  const threshold = new Date(Date.now() - 30_000).toISOString();
  const { data } = await supabase
    .from('fair_presence' as any)
    .select('*')
    .gte('updated_at', threshold);
  return (data || []) as unknown as FairPresence[];
}
