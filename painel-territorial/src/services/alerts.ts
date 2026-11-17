import type { Alert, Forecast, Metric, Severity, WeatherData } from '../types';

export interface AlertInput {
  territoryId: string;
  forecasts: Partial<Record<Metric, Forecast>>;
  weather: WeatherData | null;
}

const LABELS: Record<Exclude<Metric, 'climate'>, string> = {
  water: 'consumo de água',
  energy: 'consumo de energia',
  waste: 'geração de resíduos',
  demand: 'demanda por serviços (156)',
};

const ACTIONS: Record<Exclude<Metric, 'climate'>, string[]> = {
  water: [
    'Verificar pressão e possíveis perdas na rede do bairro',
    'Avaliar comunicado de uso consciente com a concessionária',
  ],
  energy: [
    'Alinhar com a distribuidora a previsão de pico de carga',
    'Revisar a programação de iluminação pública e prédios municipais',
  ],
  waste: [
    'Avaliar reforço temporário da frequência de coleta',
    'Checar pontos críticos de descarte irregular',
  ],
  demand: [
    'Avaliar reforço de equipes de zeladoria na região',
    'Priorizar chamados por risco (drenagem, iluminação, árvores)',
  ],
};

const COMMON_LIMITATIONS = [
  'Modelo simples (tendência linear + sazonalidade semanal) sobre 28 dias; não captura eventos pontuais.',
  'A confiança é uma heurística de qualidade do ajuste, não uma probabilidade calibrada.',
  'A previsão apoia a decisão humana: não deve ser usada para ações automáticas de alto impacto.',
];

export function severityFromChange(changePct: number): Severity | null {
  if (changePct >= 15) return 'high';
  if (changePct >= 8) return 'medium';
  return null;
}

function fmt(n: number, d = 1): string {
  return n.toFixed(d).replace('.', ',');
}

export function buildAlerts(input: AlertInput, nowIso: string): Alert[] {
  const alerts: Alert[] = [];
  const { territoryId, forecasts, weather } = input;

  const heatDays = weather?.days.filter((d) => d.tempMax >= 33) ?? [];
  const forecastDays = weather ? weather.days.slice(-7) : [];

  // --- Alertas de tendência (água, energia, resíduos, demanda) ---
  (Object.keys(LABELS) as Exclude<Metric, 'climate'>[]).forEach((metric) => {
    const f = forecasts[metric];
    if (!f) return;
    const severity = severityFromChange(f.changePct);
    if (!severity) return;

    const justification = [
      `Média prevista dos próximos 7 dias: ${fmt(f.predictedMean, 2)}, contra ${fmt(f.baseline, 2)} nos últimos 14 dias (${f.changePct > 0 ? '+' : ''}${fmt(f.changePct)}%).`,
      `Modelo ajustado em ${f.sampleSize} dias de histórico (R² = ${fmt(f.r2, 2)}).`,
    ];
    const limitations = [...COMMON_LIMITATIONS];

    if ((metric === 'water' || metric === 'energy') && heatDays.length > 0) {
      justification.push(
        `Previsão de calor: ${heatDays.length} dia(s) com máxima ≥ 33 °C, fator que costuma elevar o consumo.`,
      );
    }
    if (f.confidence < 0.45) {
      limitations.unshift('Confiança baixa: os dados recentes variam muito em relação ao padrão ajustado.');
    }

    alerts.push({
      id: `${territoryId}-${metric}-${severity}`,
      territoryId,
      metric,
      severity,
      title: `Alta prevista no ${LABELS[metric]}`,
      summary: `Projeção de ${f.changePct > 0 ? '+' : ''}${fmt(f.changePct)}% nos próximos 7 dias.`,
      justification,
      confidence: f.confidence,
      limitations,
      suggestedActions: ACTIONS[metric],
      createdAt: nowIso,
    });
  });

  // --- Alertas de clima (a partir da previsão da API) ---
  if (forecastDays.length > 0) {
    const maxT = Math.max(...forecastDays.map((d) => d.tempMax));
    const hottest = forecastDays.find((d) => d.tempMax === maxT)!;
    if (maxT >= 33) {
      const severity: Severity = maxT >= 36 ? 'high' : 'medium';
      alerts.push({
        id: `${territoryId}-climate-heat-${severity}`,
        territoryId,
        metric: 'climate',
        severity,
        title: 'Onda de calor prevista',
        summary: `Máxima prevista de ${fmt(maxT)} °C em ${hottest.date.split('-').reverse().join('/')}.`,
        justification: [
          `Previsão de temperatura máxima de ${fmt(maxT)} °C nos próximos 7 dias.`,
          'Calor intenso aumenta riscos à saúde de idosos, crianças e pessoas em situação de rua.',
        ],
        confidence: 0.75,
        limitations: [
          'Previsão meteorológica global (Open-Meteo), sem calibração para o microclima do bairro.',
          'A incerteza aumenta nos dias mais distantes da previsão.',
        ],
        suggestedActions: [
          'Avaliar abertura de pontos de hidratação e abrigos climatizados',
          'Reforçar comunicação preventiva da saúde para grupos de risco',
        ],
        createdAt: nowIso,
      });
    }

    const maxRain = Math.max(...forecastDays.map((d) => d.precipMm));
    const rainiest = forecastDays.find((d) => d.precipMm === maxRain)!;
    if (maxRain >= 30) {
      const severity: Severity = maxRain >= 60 ? 'high' : 'medium';
      alerts.push({
        id: `${territoryId}-climate-rain-${severity}`,
        territoryId,
        metric: 'climate',
        severity,
        title: 'Chuva intensa prevista',
        summary: `Até ${fmt(maxRain, 0)} mm em ${rainiest.date.split('-').reverse().join('/')}.`,
        justification: [
          `Acumulado diário previsto de ${fmt(maxRain, 0)} mm.`,
          'Chuva forte tende a elevar chamados de drenagem, queda de árvores e deslizamentos.',
        ],
        confidence: 0.7,
        limitations: [
          'Previsão de precipitação é mais incerta que a de temperatura, sobretudo em chuvas convectivas.',
          'Não considera condição atual de encostas e galerias de drenagem.',
        ],
        suggestedActions: [
          'Alinhar prontidão com Defesa Civil e Comlurb',
          'Verificar limpeza de bueiros em pontos críticos conhecidos',
        ],
        createdAt: nowIso,
      });
    }
  }

  const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  return alerts.sort((a, b) => order[a.severity] - order[b.severity] || b.confidence - a.confidence);
}
