import React from 'react';
import { Pressable, View } from 'react-native';
import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { fmtNumber, fmtPct } from '@/utils/format';
import { AppText } from './AppText';

interface Props {
  label: string;
  value: number;
  unit: string;
  changePct?: number;
  accent: string;
  onPress?: () => void;
}

export function StatTile({ label, value, unit, changePct, accent, onPress }: Props) {
  const { colors } = useTheme();
  const trend =
    changePct === undefined
      ? ''
      : changePct > 0.5
        ? 'em alta'
        : changePct < -0.5
          ? 'em queda'
          : 'estável';
  const arrow = changePct === undefined ? '' : changePct > 0.5 ? '↑' : changePct < -0.5 ? '↓' : '→';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'summary'}
      accessibilityLabel={`${label}: ${fmtNumber(value, 1)} ${unit}${
        changePct !== undefined ? `, previsão ${trend}, ${fmtPct(changePct)}` : ''
      }`}
      style={{
        flexBasis: '47%',
        flexGrow: 1,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderLeftWidth: 5,
        borderLeftColor: accent,
        padding: spacing.md,
        gap: 2,
      }}
    >
      <AppText variant="label" muted>
        {label}
      </AppText>
      <AppText variant="title">{fmtNumber(value, value < 10 ? 2 : 1)}</AppText>
      <AppText variant="small" muted>
        {unit}
      </AppText>
      {changePct !== undefined && (
        <View style={{ marginTop: spacing.xs }}>
          <AppText variant="label" color={changePct >= 8 ? colors.high : colors.textMuted}>
            {arrow} {fmtPct(changePct)} (7 dias)
          </AppText>
        </View>
      )}
    </Pressable>
  );
}
