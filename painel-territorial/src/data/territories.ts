import type { MetricInfo, Territory } from '@/types';
import { colors } from '@/theme';

// Territórios de demonstração no Rio de Janeiro. População aproximada e
// arredondada — usada apenas para normalizar consumo per capita (dados agregados).
export const TERRITORIES: Territory[] = [
  { id: 'copacabana', name: 'Copacabana', population: 147000, lat: -22.9711, lon: -43.1823 },
  { id: 'tijuca', name: 'Tijuca', population: 163000, lat: -22.9249, lon: -43.2326 },
  { id: 'centro', name: 'Centro', population: 41000, lat: -22.9068, lon: -43.1729 },
  { id: 'santa-teresa', name: 'Santa Teresa', population: 40000, lat: -22.9226, lon: -43.1888 },
  { id: 'rocinha', name: 'Rocinha', population: 72000, lat: -22.9879, lon: -43.2487 },
];

export const METRICS: MetricInfo[] = [
  {
    key: 'water',
    label: 'Água',
    unit: 'L/hab/dia',
    color: colors.water,
    description: 'Consumo médio diário de água por habitante.',
  },
  {
    key: 'energy',
    label: 'Energia',
    unit: 'kWh/hab/dia',
    color: colors.energy,
    description: 'Consumo médio diário de energia elétrica por habitante.',
  },
  {
    key: 'waste',
    label: 'Resíduos',
    unit: 'kg/hab/dia',
    color: colors.waste,
    description: 'Resíduos sólidos coletados por habitante.',
  },
  {
    key: 'demand',
    label: 'Serviços',
    unit: 'chamados/10 mil hab',
    color: colors.demand,
    description: 'Solicitações de serviços urbanos por 10 mil habitantes.',
  },
  {
    key: 'climate',
    label: 'Temp. máx.',
    unit: '°C',
    color: colors.climate,
    description: 'Temperatura máxima diária (observada/prevista).',
  },
];

export const metricInfo = (key: string): MetricInfo =>
  METRICS.find((m) => m.key === key) ?? METRICS[0];

export const territoryById = (id: string): Territory =>
  TERRITORIES.find((t) => t.id === id) ?? TERRITORIES[0];
