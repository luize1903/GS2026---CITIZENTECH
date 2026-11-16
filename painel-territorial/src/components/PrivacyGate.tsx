import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';
import { useAppStore } from '@/store/useAppStore';
import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Card';
import { Screen } from './Screen';

/** Aviso de privacidade exibido no primeiro uso (transparência — LGPD, Lei 13.709/2018). */
export function PrivacyGate() {
  const accept = useAppStore((s) => s.acceptPrivacy);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen>
        <View style={{ gap: spacing.sm }}>
          <AppText variant="title" color={colors.accentText} accessibilityRole="header">
            ZeroDesperdício
          </AppText>
          <AppText muted>Antes de começar, veja como este app trata dados.</AppText>
        </View>
        <Card>
          <AppText variant="h2" accessibilityRole="header">
            Privacidade por padrão
          </AppText>
          <AppText>• O painel usa apenas dados agregados por bairro (sem nome, CPF, endereço ou localização de pessoas).</AppText>
          <AppText>• Nenhum dado de cidadão é coletado, enviado ou armazenado.</AppText>
          <AppText>• As decisões que você registra ficam somente neste aparelho e podem ser apagadas em Ajustes.</AppText>
          <AppText>• Campos de texto bloqueiam CPF, e-mail e telefone para evitar registro acidental de dados pessoais.</AppText>
        </Card>
        <Card>
          <AppText variant="h2" accessibilityRole="header">
            O painel apoia, você decide
          </AppText>
          <AppText>
            Os alertas são previsões estatísticas com nível de confiança e limitações explícitas. Nenhuma ação é
            executada automaticamente: toda decisão é registrada e confirmada por uma pessoa.
          </AppText>
        </Card>
        <Button
          title="Entendi e quero continuar"
          onPress={accept}
          accessibilityHint="Aceita o aviso de privacidade e abre o painel"
        />
      </Screen>
    </SafeAreaView>
  );
}
