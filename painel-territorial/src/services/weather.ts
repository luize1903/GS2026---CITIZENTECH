import type { Territory, WeatherData, WeatherDay } from '../types';

// API pública Open-Meteo (sem chave, uso não comercial): https://open-meteo.com/
const BASE = 'https://api.open-meteo.com/v1/forecast';

interface OpenMeteoResponse {
  daily?: {
    time: string[];
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
    precipitation_sum: (number | null)[];
  };
}

export function parseOpenMeteo(json: OpenMeteoResponse): WeatherDay[] {
  const d = json.daily;
  if (!d || !Array.isArray(d.time)) throw new Error('Resposta inesperada da API de clima');
  const days: WeatherDay[] = [];
  d.time.forEach((date, i) => {
    const tMax = d.temperature_2m_max[i];
    const tMin = d.temperature_2m_min[i];
    if (tMax == null || tMin == null) return; // ignora dias incompletos
    days.push({
      date,
      tempMax: tMax,
      tempMin: tMin,
      precipMm: d.precipitation_sum[i] ?? 0,
    });
  });
  if (days.length === 0) throw new Error('API de clima sem dados válidos');
  return days;
}

export async function fetchWeather(
  territory: Territory,
  signal?: AbortSignal,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(territory.lat),
    longitude: String(territory.lon),
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    past_days: '14',
    forecast_days: '7',
    timezone: 'America/Sao_Paulo',
  });
  const res = await fetch(`${BASE}?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`Falha ao consultar clima (HTTP ${res.status})`);
  const json = (await res.json()) as OpenMeteoResponse;
  return {
    fetchedAt: new Date().toISOString(),
    source: 'open-meteo',
    days: parseOpenMeteo(json),
  };
}
