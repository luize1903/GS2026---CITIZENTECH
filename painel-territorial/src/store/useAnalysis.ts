import { useMemo } from 'react';
import type { Alert, DailyPoint, Forecast, Metric, TerritorySeries, WeatherData } from '@/types';
import { generateSeries } from '@/data/synthetic';
import { territoryById } from '@/data/territories';
import { forecastMetric } from '@/services/forecast';
import { buildAlerts } from '@/services/alerts';
import { todayIso } from '@/utils/format';
import { useAppStore } from './useAppStore';

export interface Analysis {
  series: TerritorySeries;
  forecasts: Partial<Record<Metric, Forecast>>;
  alerts: Alert[];
  weather: WeatherData | null;
  usingRealWeather: boolean;
}

export function analyze(territoryId: string, weather: WeatherData | null, today: string): Analysis {
  const territory = territoryById(territoryId);
  const series = generateSeries(territory, new Date(`${today}T00:00:00Z`));

  // Se houver clima real, ele substitui a série sintética de temperatura (dias já ocorridos).
  if (weather) {
    const past: DailyPoint[] = weather.days
      .filter((d) => d.date <= today)
      .map((d) => ({ date: d.date, value: d.tempMax }));
    if (past.length > 0) series.climate = past;
  }

  const forecasts: Partial<Record<Metric, Forecast>> = {};
  (['water', 'energy', 'waste', 'demand'] as const).forEach((m) => {
    forecasts[m] = forecastMetric(m, series[m]);
  });

  const alerts = buildAlerts(
    { territoryId, forecasts, weather },
    new Date().toISOString(),
  );
  return { series, forecasts, alerts, weather, usingRealWeather: weather?.source === 'open-meteo' };
}

export function useAnalysis(territoryId?: string): Analysis {
  const selected = useAppStore((s) => s.territoryId);
  const id = territoryId ?? selected;
  const weather = useAppStore((s) => s.weather[id] ?? null);
  const today = todayIso();
  return useMemo(() => analyze(id, weather, today), [id, weather, today]);
}
