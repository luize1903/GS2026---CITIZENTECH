import React from 'react';
import { RefreshControlProps, ScrollView, View } from 'react-native';
import { spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';

interface Props {
  children: React.ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

/** Contêiner padrão de tela: fundo, rolagem, espaçamento e largura máxima (tablets/web). */
export function Screen({ children, refreshControl }: Props) {
  const { colors } = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2, alignItems: 'center' }}
      refreshControl={refreshControl}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ width: '100%', maxWidth: 720, gap: spacing.lg }}>{children}</View>
    </ScrollView>
  );
}
