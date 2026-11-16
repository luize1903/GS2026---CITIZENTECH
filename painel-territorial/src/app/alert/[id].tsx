import React from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { metricInfo, territoryById } from '@/data/territories';
import { colors, spacing } from '@/theme';
import { useAnalysis } from '@/store/useAnalysis';
import { useAppStore } from '@/store/useAppStore';
import { confidenceLabel } from '@/services/forecast';
import { AppText } from '@/components/AppText';
import { Banner } from '@/components/Banner';
import { SeverityBadge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';
import { LineChart } from '@/components/LineChart';
import { Screen } from '@/components/Screen';
import { todayIso } from '@/utils/format';

function Bullets({ items }: { items: string[] }) {
  return (
    <View style={{ gap: spacing.xs }}>
      {items.map((t, i) => (
        <AppText key={i}>• {t}</AppText>
      ))}
    </View>
  );
}

export default function AlertDetailScreen() {
  const { id, territory } = useLocalSearchParams<{ id: string; territory: string }>();
  const fallback = useAppStore((s) => s.territoryId);
  const analysis = useAnalysis(territory ?? fallback);
  const alert = analysis.alerts.find((a) => a.id === id);

  if (!alert) {
    return (
      <Screen>
        <Card>
          <AppText variant="h2">Alerta não encontrado</AppText>
          <AppText muted>
            Este alerta pode ter deixado de existir após a atualização dos dados. Volte à lista para ver os alertas atuais.
          </AppText>
          <Button title="Voltar" variant="secondary" onPress={() => router.back()} />
        </Card>
      </Screen>
    );
  }

  const info = metricInfo(alert.metric);
  const t = territoryById(alert.territoryId);
  const today = todayIso();
  const f = alert.metric === 'climate' ? undefined : analysis.forecasts[alert.metric];
  const chartHistory = f ? f.history : analysis.series.climate.slice(-28);
  const chartPredicted = f
    ? f.predicted
    : (analysis.weather?.days.filter((d) => d.date > today).map((d) => ({ date: d.date, value: d.tempMax })) ?? []);

  return (
    <Screen>
      <View style={{ gap: spacing.sm }}>
        <SeverityBadge severity={alert.severity} />
        <AppText variant="title" accessibilityRole="header">
          {alert.title}
        </AppText>
        <AppText muted>
          {t.name} · {info.label}
        </AppText>
        <AppText>{alert.summary}</AppText>
      </View>

      <Card>
        <ConfidenceMeter value={alert.confidence} />
        <AppText variant="small" muted>
          Confiança {confidenceLabel(alert.confidence).toLowerCase()}: heurística que combina qualidade do ajuste, ruído
          dos dados e tamanho do histórico — não é uma probabilidade.
        </AppText>
      </Card>

      <Card>
        <LineChart
          title={`${info.label} — ${t.name}`}
          history={chartHistory}
          predicted={chartPredicted}
          uncertainty={f?.residualStd ?? 0}
          color={info.color}
          unit={info.unit}
        />
      </Card>

      <Card>
        <AppText variant="h2" accessibilityRole="header">
          Por que este alerta foi emitido
        </AppText>
        <Bullets items={alert.justification} />
      </Card>

      <Card style={{ borderColor: colors.medium }}>
        <AppText variant="h2" accessibilityRole="header">
          ⚠ Limitações
        </AppText>
        <Bullets items={alert.limitations} />
      </Card>

      <Card>
        <AppText variant="h2" accessibilityRole="header">
          Ações para avaliação
        </AppText>
        <AppText variant="small" muted>
          Sugestões genéricas — a escolha depende do contexto local e da sua avaliação.
        </AppText>
        <Bullets items={alert.suggestedActions} />
      </Card>

      <Banner tone="warning" title="Decisão humana">
        O painel não executa nenhuma ação. Registre abaixo o que você decidiu e por quê, para manter a transparência.
      </Banner>

      <Button
        title="Registrar decisão sobre este alerta"
        onPress={() =>
          router.push({
            pathname: '/decision/new',
            params: { alertId: alert.id, territory: alert.territoryId, metric: alert.metric },
          })
        }
      />
    </Screen>
  );
}
