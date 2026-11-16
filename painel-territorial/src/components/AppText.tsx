import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { font } from '@/theme';
import { useTheme } from '@/theme/useTheme';

type Variant = keyof typeof font;

interface Props extends TextProps {
  variant?: Variant;
  muted?: boolean;
  color?: string;
  align?: TextStyle['textAlign'];
}

/**
 * Texto base do app. Aplica o fator de escala escolhido pelo usuário (acessibilidade)
 * sobre o tamanho de fonte do sistema (allowFontScaling continua ativo).
 */
export function AppText({ variant = 'body', muted, color, align, style, ...rest }: Props) {
  const { colors, scale } = useTheme();
  const f = font[variant];
  return (
    <Text
      {...rest}
      style={[
        {
          fontSize: f.fontSize * scale,
          fontWeight: f.fontWeight,
          color: color ?? (muted ? colors.textMuted : colors.text),
          textAlign: align,
          lineHeight: f.fontSize * scale * 1.35,
        },
        style,
      ]}
    />
  );
}
