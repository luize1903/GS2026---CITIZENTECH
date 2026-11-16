import React from 'react';
import { View } from 'react-native';
import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { confidenceLabel } from '@/services/forecast';
import { AppText } from './AppText';

export function ConfidenceMeter({ value }: { value: number }) {
  const { colors } = useTheme();
  const label = confidenceLabel(value);
  const pct = Math.round(value * 100);
  const fill = label === 'Alta' ? colors.low : label === 'Média' ? colors.medium : colors.high;

  return (
    <View
      accessible
      accessibilityLabel={`Nível de confiança ${label}, ${pct} por cento`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: pct }}
      style={{ gap: spacing.xs }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText variant="label">Confiança: {label}</AppText>
        <AppText variant="label" muted>
          {pct}%
        </AppText>
      </View>
      <View
        style={{
          height: 10,
          borderRadius: radius.pill,
          backgroundColor: colors.primarySoft,
          overflow: 'hidden',
        }}
      >
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: fill }} />
      </View>
    </View>
  );
}
