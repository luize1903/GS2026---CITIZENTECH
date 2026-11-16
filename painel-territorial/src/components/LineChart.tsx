import React, { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { DailyPoint } from '@/types';
import { spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { fmtDayMonth, fmtNumber } from '@/utils/format';
import { AppText } from './AppText';

interface Props {
  history: DailyPoint[];
  predicted?: DailyPoint[];
  /** desvio-padrão residual: usado para a faixa de incerteza (~90%) */
  uncertainty?: number;
  color: string;
  unit: string;
  title: string;
  height?: number;
}

const PAD = { top: 12, right: 12, bottom: 24, left: 44 };

export function LineChart({
  history,
  predicted = [],
  uncertainty = 0,
  color,
  unit,
  title,
  height = 200,
}: Props) {
  const { colors, scale } = useTheme();
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const all = [...history, ...predicted];
  const band = uncertainty * 1.64;
  const vals = all.map((p) => p.value);
  const minV = Math.min(...vals) - (predicted.length ? band : 0);
  const maxV = Math.max(...vals) + (predicted.length ? band : 0);
  const span = maxV - minV || 1;
  const yMin = minV - span * 0.05;
  const yMax = maxV + span * 0.05;

  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = height - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (all.length <= 1 ? 0 : (i / (all.length - 1)) * innerW);
  const y = (v: number) => PAD.top + (1 - (v - yMin) / (yMax - yMin)) * innerH;

  const pathFor = (pts: DailyPoint[], offset: number) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i + offset).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');

  const histPath = pathFor(history, 0);
  // a linha prevista começa no último ponto real para ficar contínua
  const predPath = predicted.length
    ? pathFor([history[history.length - 1], ...predicted], history.length - 1)
    : '';

  const bandPath = predicted.length
    ? [
        ...predicted.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(history.length + i).toFixed(1)},${y(p.value + band).toFixed(1)}`),
        ...[...predicted]
          .reverse()
          .map((p, i) => `L${x(history.length + predicted.length - 1 - i).toFixed(1)},${y(p.value - band).toFixed(1)}`),
        'Z',
      ].join(' ')
    : '';

  const ticks = [0, 0.5, 1].map((t) => yMin + (yMax - yMin) * t);
  const last = history[history.length - 1];
  const summary =
    `Gráfico de linha: ${title}. Último valor ${fmtNumber(last.value, 1)} ${unit}` +
    (predicted.length
      ? `; previsão para ${fmtDayMonth(predicted[predicted.length - 1].date)}: ${fmtNumber(predicted[predicted.length - 1].value, 1)} ${unit}, com faixa de incerteza.`
      : '.');

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={summary} style={{ gap: spacing.xs }}>
      <AppText variant="label">{title}</AppText>
      <View onLayout={onLayout} style={{ height }}>
        {width > 0 && (
          <Svg width={width} height={height}>
            {ticks.map((t, i) => (
              <React.Fragment key={i}>
                <Line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={colors.border} strokeWidth={1} />
                <SvgText x={PAD.left - 6} y={y(t) + 4} fontSize={11 * Math.min(scale, 1.15)} fill={colors.textMuted} textAnchor="end">
                  {fmtNumber(t, t < 10 ? 1 : 0)}
                </SvgText>
              </React.Fragment>
            ))}
            {predicted.length > 0 && (
              <Rect
                x={x(history.length - 1)}
                y={PAD.top}
                width={Math.max(0, x(all.length - 1) - x(history.length - 1))}
                height={innerH}
                fill={colors.primarySoft}
                opacity={0.45}
              />
            )}
            {bandPath !== '' && <Path d={bandPath} fill={color} opacity={0.18} />}
            <Path d={histPath} stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
            {predPath !== '' && (
              <Path d={predPath} stroke={color} strokeWidth={2.5} fill="none" strokeDasharray="6 4" />
            )}
            <SvgText x={PAD.left} y={height - 6} fontSize={11 * Math.min(scale, 1.15)} fill={colors.textMuted}>
              {fmtDayMonth(history[0].date)}
            </SvgText>
            <SvgText x={width - PAD.right} y={height - 6} fontSize={11 * Math.min(scale, 1.15)} fill={colors.textMuted} textAnchor="end">
              {fmtDayMonth(all[all.length - 1].date)}
            </SvgText>
          </Svg>
        )}
      </View>
      {predicted.length > 0 && (
        <AppText variant="small" muted>
          Linha contínua = observado · tracejada = previsão · faixa = incerteza aproximada (~90%)
        </AppText>
      )}
    </View>
  );
}
