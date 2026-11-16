import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, View, ViewStyle } from 'react-native';
import { MIN_TOUCH, radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  accessibilityHint,
  style,
}: Props) {
  const { colors } = useTheme();
  const bg =
    variant === 'primary' ? colors.primary : variant === 'danger' ? colors.high : colors.surface;
  const fg = variant === 'secondary' ? colors.primary : '#FFFFFF';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: MIN_TOUCH,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          backgroundColor: bg,
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          borderColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDisabled ? 0.55 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {loading && <ActivityIndicator color={fg} />}
        <AppText variant="label" color={fg} style={{ fontSize: 15 }}>
          {title}
        </AppText>
      </View>
    </Pressable>
  );
}
