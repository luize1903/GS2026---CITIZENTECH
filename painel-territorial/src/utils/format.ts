export const fmtNumber = (n: number, digits = 1): string =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmtPct = (n: number, digits = 1): string =>
  `${n > 0 ? '+' : ''}${fmtNumber(n, digits)}%`;

/** "2026-11-08" -> "08/11/2026" */
export const fmtDate = (iso: string): string => iso.slice(0, 10).split('-').reverse().join('/');

/** "2026-11-08" -> "08/11" */
export const fmtDayMonth = (iso: string): string => fmtDate(iso).slice(0, 5);

export const todayIso = (): string => {
  // data local do dispositivo (não UTC), para o "hoje" do gestor
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

export const newId = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const SEVERITY_LABEL = { low: 'Baixa', medium: 'Média', high: 'Alta' } as const;
export const STATUS_LABEL = {
  planned: 'Planejada',
  approved: 'Aprovada',
  dismissed: 'Descartada',
} as const;
