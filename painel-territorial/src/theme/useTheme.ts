import { useMemo } from 'react';
import { colors as base } from './index';
import { useAppStore } from '@/store/useAppStore';

const highContrast: typeof base = {
  ...base,
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  primary: '#000000',
  primarySoft: '#F1F1F1',
  accentText: '#B00035',
  text: '#000000',
  textMuted: '#222222',
  border: '#000000',
  low: '#14532D',
  medium: '#5C3B00',
  high: '#8A1007',
};

export function useTheme() {
  const hc = useAppStore((s) => s.highContrast);
  const scale = useAppStore((s) => s.fontScale);
  return useMemo(() => ({ colors: hc ? highContrast : base, scale, highContrast: hc }), [hc, scale]);
}
