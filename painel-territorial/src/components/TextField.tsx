import React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { MIN_TOUCH, radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';

interface Props extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  hint?: string;
  maxLength?: number;
}

export function TextField({ label, error, hint, maxLength, value, multiline, ...rest }: Props) {
  const { colors, scale } = useTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        {...rest}
        value={value}
        multiline={multiline}
        maxLength={maxLength}
        accessibilityLabel={label}
        accessibilityHint={hint}
        placeholderTextColor={colors.textMuted}
        style={{
          minHeight: multiline ? 96 : MIN_TOUCH,
          textAlignVertical: multiline ? 'top' : 'center',
          borderWidth: error ? 2 : 1.5,
          borderColor: error ? colors.high : colors.border,
          borderRadius: radius.sm,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          fontSize: 15 * scale,
          color: colors.text,
          backgroundColor: colors.surface,
        }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }}>
        {error ? (
          <AppText
            variant="small"
            color={colors.high}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={{ flex: 1 }}
          >
            ⚠ {error}
          </AppText>
        ) : (
          <AppText variant="small" muted style={{ flex: 1 }}>
            {hint ?? ''}
          </AppText>
        )}
        {maxLength ? (
          <AppText variant="small" muted>
            {(value ?? '').length}/{maxLength}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}
