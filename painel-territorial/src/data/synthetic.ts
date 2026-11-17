import type { DailyPoint, Metric, Territory, TerritorySeries } from '@/types';
import { TERRITORIES } from './territories';

// Gerador pseudoaleatório determinístico (mulberry32): o mesmo bairro gera sempre
// a mesma série, o que torna a demonstração e os testes reproduzíveis.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d.getTime());
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

interface Profile {
  base: number;
  weeklyAmp: number; // sazonalidade semanal
  trendFrac: number; // tendência recente, como fração da base por dia (últimos 14 dias)
  noise: number;
  min: number;
}

const PROFILES: Record<Exclude<Metric, 'climate'>, Profile> = {
  water: { base: 190, weeklyAmp: 8, trendFrac: 0.008, noise: 9, min: 80 },
  energy: { base: 4.2, weeklyAmp: 0.25, trendFrac: 0.009, noise: 0.35, min: 1 },
  waste: { base: 1.0, weeklyAmp: 0.12, trendFrac: 0.01, noise: 0.09, min: 0.2 },
  demand: { base: 22, weeklyAmp: 3, trendFrac: 0.012, noise: 4.5, min: 2 },
};

// Cada território recebe um "cenário" diferente para que o painel mostre alertas variados.
const SCENARIOS: Record<string, Partial<Record<Metric, number>>> = {
  copacabana: { water: 3, energy: 5 }, // aceleração de consumo (calor)
  tijuca: { demand: 3.2, waste: 0.8 },
  centro: {}, // controle: sem tendência relevante
  'santa-teresa': { demand: 2.2, water: 1.2 },
  rocinha: { waste: 3.5, demand: 2 },
};

export function generateSeries(
  territory: Territory,
  endDate: Date,
  days = 90,
): TerritorySeries {
  const rand = mulberry32(hash(territory.id));
  const scenario = SCENARIOS[territory.id] ?? {};
  const out = {} as TerritorySeries;

  (Object.keys(PROFILES) as Exclude<Metric, 'climate'>[]).forEach((metric) => {
    const p = PROFILES[metric];
    const scale = 0.85 + rand() * 0.3; // diferenças de base entre bairros
    const mult = scenario[metric] ?? 0.15; // multiplicador da tendência recente
    const pts: DailyPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = addDays(endDate, -i);
      const idx = days - 1 - i;
      const dow = date.getUTCDay();
      const weekly = Math.sin((dow / 7) * 2 * Math.PI) * p.weeklyAmp;
      // tendência só nos últimos 14 dias, para criar uma mudança de regime
      const trendDays = Math.max(0, idx - (days - 14));
      const trend = p.base * scale * p.trendFrac * mult * trendDays;
      const noise = (rand() - 0.5) * 2 * p.noise;
      const value = Math.max(p.min, p.base * scale + weekly + trend + noise);
      pts.push({ date: isoDate(date), value: Math.round(value * 100) / 100 });
    }
    out[metric] = pts;
  });

  // Clima: temperatura máxima sintética (usada como fallback se a API estiver offline)
  const temps: DailyPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(endDate, -i);
    const idx = days - 1 - i;
    const t = 29 + Math.sin((idx / 30) * Math.PI) * 2 + idx * 0.03 + (rand() - 0.5) * 2;
    temps.push({ date: isoDate(date), value: Math.round(t * 10) / 10 });
  }
  out.climate = temps;
  return out;
}

export function generateAll(endDate: Date): Record<string, TerritorySeries> {
  const res: Record<string, TerritorySeries> = {};
  TERRITORIES.forEach((t) => {
    res[t.id] = generateSeries(t, endDate);
  });
  return res;
}
