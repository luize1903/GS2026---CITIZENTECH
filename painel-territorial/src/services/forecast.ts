import type { DailyPoint, Forecast, Metric } from '../types';

const HORIZON = 7; // dias previstos
const WINDOW = 28; // dias de histórico usados no ajuste

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
}

function std(xs: number[]): number {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

function ols(ys: number[]): { a: number; b: number } {
  const n = ys.length;
  const xs = ys.map((_, i) => i);
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const b = den === 0 ? 0 : num / den;
  return { a: my - b * mx, b };
}

function addDaysIso(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function dow(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getUTCDay();
}

/**
 * Previsão de 7 dias: tendência linear (OLS) + sazonalidade semanal (média dos
 * resíduos por dia da semana), ajustadas sobre os últimos 28 dias.
 *
 * É um modelo deliberadamente simples e explicável: o gestor consegue entender
 * *por que* o painel indica uma alta. A confiança é uma heurística (não uma
 * probabilidade calibrada) combinando ajuste (R²), ruído relativo e tamanho da amostra.
 */
export function forecastMetric(metric: Metric, series: DailyPoint[]): Forecast {
  const history = series.slice(-WINDOW);
  const ys = history.map((p) => p.value);
  const n = ys.length;
  if (n < 7) {
    throw new Error('Histórico insuficiente (mínimo de 7 dias) para gerar previsão');
  }

  // 1) tendência
  const first = ols(ys);
  const detr = ys.map((y, i) => y - (first.a + first.b * i));

  // 2) sazonalidade semanal (só se houver pelo menos 2 semanas)
  const season: number[] = Array(7).fill(0);
  if (n >= 14) {
    const buckets: number[][] = Array.from({ length: 7 }, () => []);
    history.forEach((p, i) => buckets[dow(p.date)].push(detr[i]));
    buckets.forEach((b, k) => (season[k] = b.length ? mean(b) : 0));
  }

  // 3) reajuste da tendência sobre a série dessazonalizada
  const deseason = ys.map((y, i) => y - season[dow(history[i].date)]);
  const { a, b } = ols(deseason);
  const fitted = ys.map((_, i) => a + b * i + season[dow(history[i].date)]);
  const residuals = ys.map((y, i) => y - fitted[i]);

  const ssRes = residuals.reduce((s, r) => s + r * r, 0);
  const my = mean(ys);
  const ssTot = ys.reduce((s, y) => s + (y - my) ** 2, 0);
  const r2 = ssTot === 0 ? 0 : Math.max(0, Math.min(1, 1 - ssRes / ssTot));
  // R² ajustado: penaliza o ajuste "fácil" de muitos parâmetros em poucos pontos
  const params = n >= 14 ? 8 : 2;
  const adjR2 = n - params - 1 > 0 ? Math.max(0, 1 - ((1 - r2) * (n - 1)) / (n - params - 1)) : 0;
  const residualStd = std(residuals);

  const lastDate = history[n - 1].date;
  const predicted: DailyPoint[] = [];
  for (let h = 1; h <= HORIZON; h++) {
    const date = addDaysIso(lastDate, h);
    const v = a + b * (n - 1 + h) + season[dow(date)];
    predicted.push({ date, value: Math.round(v * 100) / 100 });
  }

  const baseline = mean(ys.slice(-14));
  const predictedMean = mean(predicted.map((p) => p.value));
  const changePct = baseline === 0 ? 0 : ((predictedMean - baseline) / baseline) * 100;

  const relNoise = my === 0 ? 1 : residualStd / Math.abs(my);
  const confidence = Math.max(
    0.2,
    Math.min(
      0.85,
      0.3 * adjR2 + 0.45 * (1 - Math.min(1, relNoise * 6)) + 0.25 * Math.min(1, n / WINDOW),
    ),
  );

  return {
    metric,
    history,
    predicted,
    baseline,
    predictedMean,
    changePct,
    confidence: Math.round(confidence * 100) / 100,
    r2: Math.round(r2 * 100) / 100,
    residualStd,
    sampleSize: n,
  };
}

export function confidenceLabel(c: number): 'Alta' | 'Média' | 'Baixa' {
  if (c >= 0.7) return 'Alta';
  if (c >= 0.45) return 'Média';
  return 'Baixa';
}
