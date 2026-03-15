import type { StandPosition, BadgeType } from './types';

export const BRAND = {
  blue: '#475DFF',
  green: '#34D399',
  yellow: '#FBBF24',
  bgLight: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  pink: '#EC4899',
  red: '#EF4444',
  purple: '#8B5CF6',
  teal: '#14B8A6',
  accent: '#475DFF',
} as const;

export const HOODIE_COLORS = [
  BRAND.yellow,
  BRAND.blue,
  BRAND.green,
  BRAND.pink,
  BRAND.red,
  BRAND.purple,
] as const;

export const STAND_COLORS = [
  BRAND.blue,
  BRAND.green,
  BRAND.yellow,
  BRAND.pink,
  BRAND.red,
  BRAND.purple,
  '#00BCD4',
  '#FF9800',
] as const;

export const STAND_SPACING_Z = 6;
export const PATH_OFFSET_X = 5;

export function generatePathPositions(count: number): StandPosition[] {
  const positions: StandPosition[] = [];
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const row = Math.floor(i / 2);
    positions.push({ x: side * PATH_OFFSET_X, z: row * STAND_SPACING_Z });
  }
  return positions;
}

export function getWorldSize(standCount: number): number {
  const rows = Math.ceil(standCount / 2);
  const pathLength = rows * STAND_SPACING_Z + 14;
  return Math.max(30, pathLength);
}
export const PLAYER_SPEED = 3.5;
export const STAND_INTERACT_DISTANCE = 2.5;
export const PRESENCE_THROTTLE_MS = 100;
export const REMOTE_PLAYER_TIMEOUT_S = 30;
export const REMOTE_PLAYER_HIDE_DISTANCE = 15;
export const LERP_CAMERA = 0.08;
export const LERP_REMOTE = 0.15;
export const STEP_INCREMENT_INTERVAL = 0.18;

export const BADGES: BadgeType[] = [
  { id: 'first_visit', icon: 'I', name: 'First Visit', description: 'Visit your first stand' },
  { id: 'halfway', icon: 'II', name: 'Halfway There', description: 'Visit half of all stands' },
  { id: 'complete', icon: 'III', name: 'Vibecoder Complete', description: 'Visit every stand' },
  { id: 'walker', icon: 'W', name: 'Great Walker', description: 'Walk 500 steps' },
];

export const LOCALSTORAGE_KEYS = {
  deviceId: 'vbc_fair_device_id',
  visitorName: 'vbc_fair_name',
  avatar: 'vbc_fair_avatar',
  badges: 'vbc_fair_badges',
  visits: 'vbc_fair_visits',
  steps: 'vbc_fair_steps',
} as const;
