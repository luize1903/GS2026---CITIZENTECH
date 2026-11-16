import React from 'react';
import { View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

interface Props {
  tone?: 'info' | 'warning';
  title?: string;
  children: React.ReactNode;
}

export function Banner({ tone = 'info', title, children }: Props) {
  const warn = tone === 'warning';
  return (
    <View
      accessible
      accessibilityRole="summary"
      style={{
        backgroundColor: warn ? colors.mediumBg : colors.primarySoft,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: 2,
        borderLeftWidth: 5,
        borderLeftColor: warn ? colors.medium : colors.accent,
      }}
    >
      {title ? (
        <AppText variant="label" color={warn ? colors.medium : colors.accentText}>
          {warn ? '⚠ ' : 'ℹ '}
          {title}
        </AppText>
      ) : null}
      <AppText variant="small" color={colors.text}>
        {children}
      </AppText>
    </View>
  );
}
