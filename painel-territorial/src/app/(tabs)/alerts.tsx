import React, { useMemo, useState } from 'react';
import { router } from 'expo-router';
import type { Severity } from '@/types';
import { TERRITORIES } from '@/data/territories';
import { spacing } from '@/theme';
import { useAppStore } from '@/store/useAppStore';
import { analyze } from '@/store/useAnalysis';
import { todayIso } from '@/utils/format';
import { AlertCard } from '@/components/AlertCard';
import { AppText } from '@/components/AppText';
import { Banner } from '@/components/Banner';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { View } from 'react-native';

type Filter = 'all' | Severity;

export default function AlertsScreen() {
  const weather = useAppStore((s) => s.weather);
  const [filter, setFilter] = useState<Filter>('all');
  const today = todayIso();

  // Alertas de todos os bairros, ordenados por severidade e confiança
  const alerts = useMemo(() => {
    const all = TERRITORIES.flatMap((t) => analyze(t.id, weather[t.id] ?? null, today).alerts);
    const order = { high: 0, medium: 1, low: 2 } as const;
    return all.sort((a, b) => order[a.severity] - order[b.severity] || b.confidence - a.confidence);
  }, [weather, today]);

  const shown = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <Screen>
      <Banner title="Como ler os alertas">
        Cada alerta traz o nível de confiança, a justificativa e as limitações da previsão. Abra um alerta para ver
        detalhes e registrar sua decisão.
      </Banner>

      <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <Chip label={`Todos (${alerts.length})`} selected={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label="▲ Alta" selected={filter === 'high'} onPress={() => setFilter('high')} accessibilityLabel="Severidade alta" />
        <Chip label="◆ Média" selected={filter === 'medium'} onPress={() => setFilter('medium')} accessibilityLabel="Severidade média" />
      </View>

      {shown.length === 0 ? (
        <Card>
          <AppText>Nenhum alerta nesta categoria.</AppText>
        </Card>
      ) : (
        shown.map((a) => (
          <AlertCard
            key={a.id}
            alert={a}
            showTerritory
            onPress={() => router.push({ pathname: '/alert/[id]', params: { id: a.id, territory: a.territoryId } })}
          />
        ))
      )}
    </Screen>
  );
}
