import React from 'react';
import { View, ViewProps } from 'react-native';
import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

export function Card({ style, ...rest }: ViewProps) {
  const { colors } = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.lg,
          gap: spacing.sm,
        },
        style,
      ]}
    />
  );
}
