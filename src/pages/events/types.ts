export interface AvatarConfig {
  hoodie: string;
  glasses: 'pixel' | 'round' | 'none';
  hat: 'none' | 'beanie' | 'cap';
  gender: 'm' | 'f';
}

export interface FairVisitor {
  id: string;
  device_id: string;
  name: string;
  avatar: AvatarConfig;
  created_at: string;
}

export interface FairPresence {
  device_id: string;
  name: string;
  avatar: AvatarConfig;
  pos_x: number;
  pos_z: number;
  heading: number;
  current_stand_id: string | null;
  updated_at: string;
}

export interface FairStandVisit {
  id: string;
  device_id: string;
  workshop_id: string;
  visited_at: string;
}

export interface Speaker {
  id: string;
  display_name: string;
  photo_url: string | null;
  tagline: string | null;
  email: string | null;
}

export interface Workshop {
  id: string;
  title: string;
  tagline: string | null;
  description: string | null;
  banner_url: string | null;
  audio_url: string | null;
  luma_url: string | null;
  scheduled_at: string;
  duration_minutes: number | null;
  is_confirmed: boolean;
  status: string;
  speakers: Speaker[];
}

export interface RemotePlayer {
  device_id: string;
  name: string;
  avatar: AvatarConfig;
  pos_x: number;
  pos_z: number;
  heading: number;
  current_stand_id: string | null;
  updated_at: string;
  targetX?: number;
  targetZ?: number;
  targetHeading?: number;
}

export type FairScreen = 'creator' | 'world' | 'speaker';

export interface BadgeType {
  id: string;
  icon: string;
  name: string;
  description: string;
}

export interface StandPosition {
  x: number;
  z: number;
}
