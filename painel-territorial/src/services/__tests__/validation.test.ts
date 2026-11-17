import test from 'node:test';
import assert from 'node:assert/strict';
import { findPii, parseBrDate, validateDecision } from '../../utils/validation';

const future = '31/12/2099';
const ok = {
  action: 'Reforçar a coleta de resíduos às segundas',
  rationale: 'Alta prevista de 14% com confiança média; avaliar com a equipe de campo.',
  responsible: 'Secretaria de Zeladoria',
  deadline: future,
};

test('formulário válido não gera erros', () => {
  assert.deepEqual(validateDecision(ok), {});
});

test('campos curtos e data inválida geram erros', () => {
  const e = validateDecision({ action: 'curto', rationale: 'curto', responsible: '', deadline: '31/02/2099' });
  assert.ok(e.action && e.rationale && e.responsible && e.deadline);
});

test('prazo no passado é recusado', () => {
  const e = validateDecision({ ...ok, deadline: '01/01/2020' });
  assert.match(e.deadline ?? '', /passado/);
});

test('dados pessoais (CPF, e-mail, telefone) são bloqueados', () => {
  assert.equal(findPii('CPF 123.456.789-09'), 'CPF');
  assert.equal(findPii('contato fulano@exemplo.com'), 'e-mail');
  assert.equal(findPii('ligar 21 98765-4321'), 'telefone');
  assert.equal(findPii('Reforçar coleta na região central'), null);
  const e = validateDecision({ ...ok, rationale: 'Falar com maria@exemplo.com sobre a coleta no bairro.' });
  assert.match(e.rationale ?? '', /dados pessoais/);
});

test('parseBrDate converte e rejeita datas impossíveis', () => {
  assert.equal(parseBrDate('08/11/2026'), '2026-11-08');
  assert.equal(parseBrDate('31/04/2026'), null);
  assert.equal(parseBrDate('2026-11-08'), null);
});
