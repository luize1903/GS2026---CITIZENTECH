import React from 'react';
import { Alert as RNAlert, Switch, View } from 'react-native';
import { colors, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { FontScale, useAppStore } from '@/store/useAppStore';
import { AppText } from '@/components/AppText';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';

const SCALES: { v: FontScale; label: string }[] = [
  { v: 1, label: 'Normal' },
  { v: 1.15, label: 'Grande' },
  { v: 1.3, label: 'Muito grande' },
];

export default function SettingsScreen() {
  const { colors: c } = useTheme();
  const fontScale = useAppStore((s) => s.fontScale);
  const setFontScale = useAppStore((s) => s.setFontScale);
  const highContrast = useAppStore((s) => s.highContrast);
  const setHighContrast = useAppStore((s) => s.setHighContrast);
  const clear = useAppStore((s) => s.clearLocalData);
  const decisionsCount = useAppStore((s) => s.decisions.length);

  const confirmClear = () =>
    RNAlert.alert(
      'Apagar dados locais?',
      `Serão removidas ${decisionsCount} decisão(ões), o cache de clima e suas preferências. Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar tudo', style: 'destructive', onPress: clear },
      ],
    );

  return (
    <Screen>
      <Card>
        <AppText variant="h2" accessibilityRole="header">
          Acessibilidade
        </AppText>
        <AppText variant="label">Tamanho do texto</AppText>
        <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {SCALES.map((s) => (
            <Chip key={s.v} label={s.label} selected={fontScale === s.v} onPress={() => setFontScale(s.v)} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, minHeight: 56 }}>
          <View style={{ flex: 1 }}>
            <AppText variant="label">Alto contraste</AppText>
            <AppText variant="small" muted>
              Texto preto, bordas fortes e cores mais escuras.
            </AppText>
          </View>
          <Switch
            value={highContrast}
            onValueChange={setHighContrast}
            accessibilityLabel="Alto contraste"
            trackColor={{ false: c.border, true: colors.primary }}
          />
        </View>
        <AppText variant="small" muted>
          O app também respeita o tamanho de fonte e as configurações de leitor de tela do sistema. A severidade nunca é
          indicada só por cor: sempre há ícone e texto.
        </AppText>
      </Card>

      <Card>
        <AppText variant="h2" accessibilityRole="header">
          Privacidade e dados
        </AppText>
        <AppText>• Dados agregados por bairro: nenhuma informação individual de cidadãos.</AppText>
        <AppText>• Sem login, sem rastreamento e sem localização do aparelho.</AppText>
        <AppText>• A única chamada de rede é à API Open-Meteo, com as coordenadas aproximadas do bairro escolhido.</AppText>
        <AppText>• Decisões e preferências ficam apenas neste aparelho.</AppText>
        <Button title="Apagar dados locais" variant="danger" onPress={confirmClear} accessibilityHint="Remove decisões, cache e preferências" />
      </Card>

      <Card>
        <AppText variant="h2" accessibilityRole="header">
          Fontes de dados
        </AppText>
        <AppText>• Clima: Open-Meteo (api.open-meteo.com), dados públicos.</AppText>
        <AppText>• Água, energia, resíduos e chamados 156: séries sintéticas geradas para demonstração (sem relação com dados reais da cidade).</AppText>
      </Card>

      <Banner tone="warning" title="Limitações">
        O modelo é simples (tendência linear + sazonalidade semanal) e não substitui análise técnica. Eventos
        extraordinários, obras e feriados não são considerados.
      </Banner>
    </Screen>
  );
}
