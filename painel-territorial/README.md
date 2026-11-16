# ZeroDesperdício — Painel Ambiental Mobile

## Sobre o projeto

O ZeroDesperdício é um aplicativo desenvolvido em React Native com Expo para monitorar indicadores ambientais, como consumo de água, energia, resíduos, serviços urbanos e clima.

O objetivo é ajudar gestores a identificar possíveis problemas ambientais por meio de gráficos, alertas preditivos e informações que auxiliam na tomada de decisões.

## Funcionalidades

- Dashboard com gráficos e indicadores ambientais.
- Alertas preditivos com justificativa, confiança e limitações.
- Registro de decisões e ações do gestor.
- Consulta de dados climáticos pela API Open-Meteo.
- Armazenamento local de informações.
- Configurações de acessibilidade e privacidade.

## Tecnologias utilizadas

- React Native e Expo
- TypeScript
- Expo Router
- Zustand e AsyncStorage
- API Open-Meteo

## Como executar

É necessário ter o Node.js instalado.

No terminal do VS Code, execute:

```bash
npm install
npx expo start
```

Depois, utilize o aplicativo Expo Go no celular para escanear o QR Code ou pressione `w` para abrir no navegador, quando compatível.

## Fontes de dados

Os dados de água, energia, resíduos e serviços urbanos são sintéticos, utilizados para demonstração do aplicativo.

Os dados climáticos são consultados pela API pública Open-Meteo.

## Limitações

O aplicativo utiliza dados simulados para os indicadores ambientais. As previsões são estimativas e não substituem a análise de um gestor.

As decisões ficam armazenadas localmente, sem integração com um banco de dados externo.

## Integrantes

- Lívia dos Santos Dantas — RM562967
- Luize Martinês Rosa — RM564016
- Sarah Sayoto — RM563841

## Disciplina

Global Solution 2026.2 — Cross-Platform Application Development

FIAP — Ciência da Computação