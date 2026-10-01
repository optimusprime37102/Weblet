/**
 * Weblet brand palette — aligned with splash + app icon.
 * Accent: #F9343E / #FF5A5F on deep ink #120E10.
 */
export const BRAND_RED = '#F9343E';
export const BRAND_RED_BRIGHT = '#FF5A5F';
export const BRAND_INK = '#120E10';

export const lightColors = {
  background: '#F6F1F2',
  backgroundSecondary: '#FBF7F8',
  surface: 'rgba(255, 255, 255, 0.94)',
  surfaceSolid: '#FFFFFF',
  surfaceMuted: '#F3EBED',
  border: 'rgba(40, 18, 22, 0.08)',
  borderStrong: 'rgba(40, 18, 22, 0.14)',
  text: '#1A1214',
  textSecondary: '#6B565B',
  textMuted: '#9A8489',
  primary: BRAND_RED,
  primarySoft: 'rgba(249, 52, 62, 0.12)',
  danger: '#D91F2A',
  dangerSoft: 'rgba(217, 31, 42, 0.1)',
  success: '#15803D',
  overlay: 'rgba(18, 14, 16, 0.48)',
  tabBar: 'rgba(255, 255, 255, 0.97)',
  shadow: '#2A1216',
  dashed: '#D6C8CB',
  iconBg: '#FFF5F6',
  statusBar: BRAND_RED,
};

export const darkColors = {
  background: BRAND_INK,
  backgroundSecondary: '#1A1416',
  surface: 'rgba(34, 26, 28, 0.94)',
  surfaceSolid: '#221A1C',
  surfaceMuted: '#2A2022',
  border: 'rgba(255, 247, 247, 0.1)',
  borderStrong: 'rgba(255, 247, 247, 0.18)',
  text: '#FFF7F7',
  textSecondary: 'rgba(255, 247, 247, 0.62)',
  textMuted: 'rgba(255, 247, 247, 0.42)',
  primary: BRAND_RED_BRIGHT,
  primarySoft: 'rgba(255, 90, 95, 0.16)',
  danger: '#FF7A7E',
  dangerSoft: 'rgba(255, 90, 95, 0.14)',
  success: '#4ADE80',
  overlay: 'rgba(8, 5, 6, 0.72)',
  tabBar: 'rgba(18, 14, 16, 0.97)',
  shadow: '#000000',
  dashed: '#4A3A3E',
  iconBg: '#1A1416',
  statusBar: BRAND_RED,
};

export type AppColors = typeof lightColors;
