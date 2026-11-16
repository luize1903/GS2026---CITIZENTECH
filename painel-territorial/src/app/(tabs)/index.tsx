import React, { useMemo, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { router } from 'expo-router';
import type { DailyPoint, Metric } from '@/types';
import { METRICS, TERRITORIES, metricInfo, territoryById } from '@/data/territories';
import { colors, radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { analyze, useAnalysis } from '@/store/useAnalysis';
import { fmtDate, fmtNumber, fmtPct, todayIso } from '@/utils/format';
import { AlertCard } from '@/components/AlertCard';
import { AppText } from '@/components/AppText';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { LineChart } from '@/components/LineChart';
import { Screen } from '@/components/Screen';
import { StatTile } from '@/components/StatTile';
import { TerritoryPicker } from '@/components/TerritoryPicker';

export default function DashboardScreen() {
  const { colors: c } = useTheme();
  const territoryId = useAppStore((s) => s.territoryId);
  const weatherStatus = useAppStore((s) => s.weatherStatus);
  const weatherError = useAppStore((s) => s.weatherError);
  const weatherCache = useAppStore((s) => s.weather);
  const loadWeather = useAppStore((s) => s.loadWeather);
  const [metric, setMetric] = useState<Metric>('water');

  const territory = territoryById(territoryId);
  const analysis = useAnalysis();
  const today = todayIso();
  const info = metricInfo(metric);

  // Série exibida no gráfico (clima usa observado + previsão da API)
  const chart = useMemo(() => {
    if (metric === 'climate') {
      const future: DailyPoint[] =
        analysis.weather?.days.filter((d) => d.date > today).map((d) => ({ date: d.date, value: d.tempMax })) ?? [];
      return { history: analysis.series.climate.slice(-28), predicted: future, uncertainty: 0 };
    }
    const f = analysis.forecasts[metric]!;
    return { history: f.history, predicted: f.predicted, uncertainty: f.residualStd };
  }, [metric, analysis, today]);

  // Ranking entre bairros: variação prevista da métrica selecionada
  const ranking = useMemo(() => {
    if (metric === 'climate') return [];
    return TERRITORIES.map((t) => {
      const a = analyze(t.id, weatherCache[t.id] ?? null, today);
      return { id: t.id, name: t.name, change: a.forecasts[metric]!.changePct };
    }).sort((a, b) => b.change - a.change);
  }, [metric, weatherCache, today]);
  const maxAbs = Math.max(1, ...ranking.map((r) => Math.abs(r.change)));

  const high = analysis.alerts.filter((a) => a.severity === 'high').length;
  const medium = analysis.alerts.filter((a) => a.severity === 'medium').length;

  const weatherCached = weatherCache[territoryId];
  const weatherLine =
    weatherStatus === 'loading'
      ? 'Atualizando clima…'
      : weatherStatus === 'error'
        ? weatherCached
          ? `Sem conexão com a API de clima. Usando dados salvos de ${fmtDate(weatherCached.fetchedAt)}.`
          : 'Sem conexão com a API de clima. Alertas climáticos indisponíveis; temperatura exibida é sintética.'
        : weatherCached
          ? `Clima: Open-Meteo, atualizado em ${fmtDate(weatherCached.fetchedAt)}.`
          : 'Clima ainda não carregado.';

  return (
    <Screen
      refreshControl={
        <RefreshControl refreshing={weatherStatus === 'loading'} onRefresh={() => loadWeather(territoryId)} />
      }
    >
      <View style={{ gap: spacing.xs }}>
        <AppText variant="small" muted>
          Hoje, {fmtDate(today)}
        </AppText>
        <AppText variant="title" color={colors.primary} accessibilityRole="header">
          {territory.name}
        </AppText>
      </View>

      <TerritoryPicker />

      {/* Resumo de alertas */}
      <Card
        accessible
        accessibilityLabel={`Resumo: ${high} alertas de severidade alta e ${medium} de severidade média em ${territory.name}`}
        style={{ backgroundColor: c.primary, borderColor: c.primary, borderTopWidth: 4, borderTopColor: colors.accent }}
      >
        <AppText variant="label" color="#E5E5E8">
          Riscos para os próximos 7 dias
        </AppText>
        <View style={{ flexDirection: 'row', gap: spacing.xl }}>
          <View>
            <AppText variant="title" color="#FFFFFF">
              {high}
            </AppText>
            <AppText variant="small" color="#E5E5E8">
              ▲ alta
            </AppText>
          </View>
          <View>
            <AppText variant="title" color="#FFFFFF">
              {medium}
            </AppText>
            <AppText variant="small" color="#E5E5E8">
              ◆ média
            </AppText>
          </View>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <AppText variant="small" color="#FFFFFF">
              {high + medium === 0 ? 'Nenhum alerta ativo para este bairro.' : 'Alertas exigem avaliação humana.'}
            </AppText>
          </View>
        </View>
      </Card>

      <Banner tone={weatherStatus === 'error' ? 'warning' : 'info'}>
        {weatherLine}
        {weatherStatus === 'error' && weatherError ? ` (${weatherError})` : ''}
      </Banner>

      {/* Indicadores */}
      <View accessibilityRole="header">
        <AppText variant="h2">Indicadores</AppText>
        <AppText variant="small" muted>
          Último dia e variação prevista dos próximos 7 dias vs. últimos 14 dias
        </AppText>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        {METRICS.filter((m) => m.key !== 'climate').map((m) => {
          const f = analysis.forecasts[m.key]!;
          return (
            <StatTile
              key={m.key}
              label={m.label}
              unit={m.unit}
              accent={m.color}
              value={f.history[f.history.length - 1].value}
              changePct={f.changePct}
              onPress={() => setMetric(m.key)}
            />
          );
        })}
      </View>

      {/* Gráfico */}
      <Card>
        <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {METRICS.map((m) => (
            <Chip key={m.key} label={m.label} selected={metric === m.key} onPress={() => setMetric(m.key)} />
          ))}
        </View>
        <AppText variant="small" muted>
          {info.description} Unidade: {info.unit}.
        </AppText>
        <LineChart
          title={`${info.label} — ${territory.name}`}
          history={chart.history}
          predicted={chart.predicted}
          uncertainty={chart.uncertainty}
          color={info.color}
          unit={info.unit}
        />
        {metric !== 'climate' && (
          <AppText variant="small" muted>
            Ajuste: R² {fmtNumber(analysis.forecasts[metric]!.r2, 2)} em {analysis.forecasts[metric]!.sampleSize} dias.
            Dados sintéticos para demonstração.
          </AppText>
        )}
      </Card>

      {/* Ranking entre bairros */}
      {ranking.length > 0 && (
        <Card>
          <AppText variant="h2" accessibilityRole="header">
            Comparativo entre bairros
          </AppText>
          <AppText variant="small" muted>
            Variação prevista de {info.label.toLowerCase()} (7 dias)
          </AppText>
          {ranking.map((r) => (
            <View
              key={r.id}
              accessible
              accessibilityLabel={`${r.name}: ${fmtPct(r.change)}`}
              style={{ gap: 2, marginTop: spacing.xs }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <AppText variant="label">{r.name}</AppText>
                <AppText variant="label" color={r.change >= 8 ? colors.high : c.textMuted}>
                  {fmtPct(r.change)}
                </AppText>
              </View>
              <View style={{ height: 10, borderRadius: radius.pill, backgroundColor: c.primarySoft, overflow: 'hidden' }}>
                <View
                  style={{
                    width: `${Math.max(3, (Math.abs(r.change) / maxAbs) * 100)}%`,
                    height: '100%',
                    backgroundColor: r.change >= 15 ? colors.high : r.change >= 8 ? colors.medium : info.color,
                  }}
                />
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Alertas principais */}
      <View accessibilityRole="header">
        <AppText variant="h2">Alertas prioritários</AppText>
      </View>
      {analysis.alerts.length === 0 ? (
        <Card>
          <AppText>Nenhum alerta para {territory.name} com os dados atuais.</AppText>
        </Card>
      ) : (
        analysis.alerts.slice(0, 2).map((a) => (
          <AlertCard
            key={a.id}
            alert={a}
            onPress={() => router.push({ pathname: '/alert/[id]', params: { id: a.id, territory: a.territoryId } })}
          />
        ))
      )}
      <Button
        variant="secondary"
        title="Ver todos os alertas"
        onPress={() => router.push('/alerts')}
      />

      <Banner title="Apoio à decisão">
        Previsões são estimativas estatísticas com incerteza. O painel não executa ações: cabe ao gestor avaliar o
        contexto local e decidir.
      </Banner>
    </Screen>
  );
}
