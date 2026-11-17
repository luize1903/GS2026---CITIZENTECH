import { todayIso } from './format';

export interface DecisionForm {
  action: string;
  rationale: string;
  responsible: string;
  deadline: string; // DD/MM/AAAA digitado pelo usuário
}

export type FormErrors = Partial<Record<keyof DecisionForm, string>>;

// Padrões que sugerem dado pessoal de cidadão (CPF, e-mail, telefone).
// O app só trabalha com dados agregados: bloqueamos esse tipo de conteúdo nos textos livres.
const PII_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/, label: 'CPF' },
  { re: /[\w.+-]+@[\w-]+\.[\w.-]+/, label: 'e-mail' },
  { re: /(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}\b/, label: 'telefone' },
];

export function findPii(text: string): string | null {
  for (const p of PII_PATTERNS) if (p.re.test(text)) return p.label;
  return null;
}

/** Converte "08/11/2026" em "2026-11-08"; retorna null se inválida. */
export function parseBrDate(input: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input.trim());
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
  if (
    d.getUTCFullYear() !== Number(yyyy) ||
    d.getUTCMonth() !== Number(mm) - 1 ||
    d.getUTCDate() !== Number(dd)
  ) {
    return null;
  }
  return `${yyyy}-${mm}-${dd}`;
}

export function validateDecision(f: DecisionForm): FormErrors {
  const e: FormErrors = {};

  const action = f.action.trim();
  if (action.length < 10) e.action = 'Descreva a ação com pelo menos 10 caracteres.';
  else if (action.length > 200) e.action = 'Máximo de 200 caracteres.';
  else {
    const pii = findPii(action);
    if (pii) e.action = `Remova dados pessoais (${pii}). O painel trabalha apenas com dados agregados.`;
  }

  const rationale = f.rationale.trim();
  if (rationale.length < 20) {
    e.rationale = 'Registre a justificativa (mín. 20 caracteres) para garantir transparência.';
  } else if (rationale.length > 500) e.rationale = 'Máximo de 500 caracteres.';
  else {
    const pii = findPii(rationale);
    if (pii) e.rationale = `Remova dados pessoais (${pii}). O painel trabalha apenas com dados agregados.`;
  }

  const resp = f.responsible.trim();
  if (resp.length < 3) e.responsible = 'Informe o setor ou cargo responsável.';
  else if (findPii(resp)) e.responsible = 'Use o setor/cargo (ex.: "Secretaria de Zeladoria"), não dados pessoais.';

  const iso = parseBrDate(f.deadline);
  if (!iso) e.deadline = 'Use o formato DD/MM/AAAA com uma data válida.';
  else if (iso < todayIso()) e.deadline = 'O prazo não pode estar no passado.';

  return e;
}
