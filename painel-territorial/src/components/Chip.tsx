import React from 'react';
import { Pressable } from 'react-native';
import { MIN_TOUCH, radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export function Chip({ label, selected, onPress, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      style={{
        minHeight: MIN_TOUCH,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.pill,
        justifyContent: 'center',
        backgroundColor: selected ? colors.primary : colors.surface,
        borderWidth: 1.5,
        borderColor: colors.primary,
      }}
    >
      <AppText variant="label" color={selected ? '#FFFFFF' : colors.primary}>
        {selected ? '✓ ' : ''}
        {label}
      </AppText>
    </Pressable>
  );
}
