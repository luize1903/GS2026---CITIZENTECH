// Identidade visual do ZeroDesperdício.
// Paleta verde e azul para um painel ambiental simples e legível.
export const colors = {
  bg: '#F4F8F5',
  surface: '#FFFFFF',
  primary: '#174B38',
  primarySoft: '#E6F3EA',
  accent: '#5AAE78',
  accentText: '#206B46',
  text: '#141414',
  textMuted: '#5C5C63',
  border: '#E1E1E4',
  water: '#1E6FB8',
  energy: '#B7791F',
  waste: '#2F855A',
  demand: '#6B46C1',
  climate: '#C05621',
  // severidade (sempre acompanhada de ícone/texto — nunca só cor)
  low: '#2F855A',
  lowBg: '#E3F4EA',
  medium: '#8A5A00',
  mediumBg: '#FFF1CC',
  high: '#B42318',
  highBg: '#FDE4E1',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 14, lg: 20, pill: 999 };

export const font = {
  title: { fontSize: 24, fontWeight: '700' as const },
  h2: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '600' as const },
};

export const MIN_TOUCH = 48; // alvo mínimo de toque (acessibilidade)
