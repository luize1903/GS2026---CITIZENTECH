export type Metric = 'water' | 'energy' | 'waste' | 'demand' | 'climate';
export type Severity = 'low' | 'medium' | 'high';

export interface Territory {
  id: string;
  name: string;
  population: number; // dado agregado — nenhum dado individual é usado
  lat: number;
  lon: number;
}

export interface MetricInfo {
  key: Metric;
  label: string;
  unit: string;
  color: string;
  description: string;
}

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

export type TerritorySeries = Record<Metric, DailyPoint[]>;

export interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipMm: number;
}

export interface WeatherData {
  fetchedAt: string;
  source: 'open-meteo' | 'cache' | 'synthetic';
  days: WeatherDay[];
}

export interface Forecast {
  metric: Metric;
  history: DailyPoint[];
  predicted: DailyPoint[];
  baseline: number; // média dos últimos 14 dias
  predictedMean: number;
  changePct: number; // variação prevista vs baseline
  confidence: number; // 0..1
  r2: number;
  residualStd: number;
  sampleSize: number;
}

export interface Alert {
  id: string;
  territoryId: string;
  metric: Metric;
  severity: Severity;
  title: string;
  summary: string;
  justification: string[];
  confidence: number; // 0..1
  limitations: string[];
  suggestedActions: string[];
  createdAt: string;
}

export type DecisionStatus = 'planned' | 'approved' | 'dismissed';

export interface Decision {
  id: string;
  alertId: string | null;
  territoryId: string;
  metric: Metric;
  status: DecisionStatus;
  action: string;
  rationale: string;
  responsible: string; // cargo/setor, nunca dado pessoal de cidadão
  deadline: string; // YYYY-MM-DD
  createdAt: string;
}
