import test from 'node:test';
import assert from 'node:assert/strict';
import { forecastMetric, confidenceLabel } from '../forecast';
import { buildAlerts, severityFromChange } from '../alerts';
import { parseOpenMeteo } from '../weather';
import { generateSeries } from '../../data/synthetic';
import { TERRITORIES } from '../../data/territories';

const END = new Date('2026-11-08T00:00:00Z');
const byId = (id: string) => TERRITORIES.find((t) => t.id === id)!;

test('previsão retorna 7 dias e datas consecutivas', () => {
  const s = generateSeries(byId('copacabana'), END);
  const f = forecastMetric('water', s.water);
  assert.equal(f.predicted.length, 7);
  assert.equal(f.predicted[0].date, '2026-11-09');
  assert.equal(f.predicted[6].date, '2026-11-15');
});

test('série com tendência de alta gera changePct positivo', () => {
  const s = generateSeries(byId('copacabana'), END);
  const f = forecastMetric('water', s.water);
  assert.ok(f.changePct > 0, `changePct=${f.changePct}`);
});

test('série constante não gera alerta e tem confiança limitada', () => {
  const flat = Array.from({ length: 28 }, (_, i) => ({
    date: new Date(Date.UTC(2026, 9, 12 + i)).toISOString().slice(0, 10),
    value: 100,
  }));
  const f = forecastMetric('water', flat);
  assert.ok(Math.abs(f.changePct) < 0.01);
  assert.equal(severityFromChange(f.changePct), null);
});

test('histórico curto lança erro explicativo', () => {
  assert.throws(() => forecastMetric('water', [{ date: '2026-11-01', value: 1 }]), /insuficiente/);
});

test('confiança fica no intervalo [0.2, 0.85] e rótulo é coerente', () => {
  for (const t of TERRITORIES) {
    const s = generateSeries(t, END);
    for (const m of ['water', 'energy', 'waste', 'demand'] as const) {
      const f = forecastMetric(m, s[m]);
      assert.ok(f.confidence >= 0.2 && f.confidence <= 0.85);
    }
  }
  assert.equal(confidenceLabel(0.8), 'Alta');
  assert.equal(confidenceLabel(0.5), 'Média');
  assert.equal(confidenceLabel(0.3), 'Baixa');
});

test('alertas trazem justificativa, confiança e limitações', () => {
  const s = generateSeries(byId('copacabana'), END);
  const forecasts = {
    water: forecastMetric('water', s.water),
    energy: forecastMetric('energy', s.energy),
  };
  const alerts = buildAlerts({ territoryId: 'copacabana', forecasts, weather: null }, END.toISOString());
  assert.ok(alerts.length > 0);
  for (const a of alerts) {
    assert.ok(a.justification.length > 0);
    assert.ok(a.limitations.length > 0);
    assert.ok(a.confidence > 0 && a.confidence <= 1);
  }
});

test('previsão de calor gera alerta climático', () => {
  const days = Array.from({ length: 7 }, (_, i) => ({
    date: `2026-11-${String(9 + i).padStart(2, '0')}`,
    tempMax: i === 3 ? 37 : 31,
    tempMin: 24,
    precipMm: 0,
  }));
  const alerts = buildAlerts(
    { territoryId: 'tijuca', forecasts: {}, weather: { fetchedAt: '', source: 'open-meteo', days } },
    END.toISOString(),
  );
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].severity, 'high');
  assert.equal(alerts[0].metric, 'climate');
});

test('parseOpenMeteo descarta dias incompletos e valida formato', () => {
  const days = parseOpenMeteo({
    daily: {
      time: ['2026-11-08', '2026-11-09'],
      temperature_2m_max: [30, null],
      temperature_2m_min: [22, 21],
      precipitation_sum: [null, 5],
    },
  });
  assert.equal(days.length, 1);
  assert.equal(days[0].precipMm, 0);
  assert.throws(() => parseOpenMeteo({}), /inesperada/);
});
