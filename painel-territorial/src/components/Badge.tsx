import React from 'react';
import { View } from 'react-native';
import type { Severity } from '@/types';
import { colors, radius, spacing } from '@/theme';
import { SEVERITY_LABEL } from '@/utils/format';
import { AppText } from './AppText';

// Severidade nunca é indicada só por cor: sempre há ícone + texto.
const CONFIG = {
  high: { icon: '▲', fg: colors.high, bg: colors.highBg },
  medium: { icon: '◆', fg: colors.medium, bg: colors.mediumBg },
  low: { icon: '●', fg: colors.low, bg: colors.lowBg },
} as const;

export function SeverityBadge({ severity }: { severity: Severity }) {
  const c = CONFIG[severity];
  return (
    <View
      accessible
      accessibilityLabel={`Severidade ${SEVERITY_LABEL[severity]}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: c.bg,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.pill,
        alignSelf: 'flex-start',
      }}
    >
      <AppText variant="small" color={c.fg} importantForAccessibility="no">
        {c.icon}
      </AppText>
      <AppText variant="label" color={c.fg}>
        {SEVERITY_LABEL[severity]}
      </AppText>
    </View>
  );
}
