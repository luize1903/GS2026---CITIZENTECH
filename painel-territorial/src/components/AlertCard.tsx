import React from 'react';
import { Pressable, View } from 'react-native';
import type { Alert } from '@/types';
import { metricInfo, territoryById } from '@/data/territories';
import { radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { SEVERITY_LABEL } from '@/utils/format';
import { AppText } from './AppText';
import { SeverityBadge } from './Badge';
import { ConfidenceMeter } from './ConfidenceMeter';

interface Props {
  alert: Alert;
  showTerritory?: boolean;
  onPress: () => void;
}

export function AlertCard({ alert, showTerritory, onPress }: Props) {
  const { colors } = useTheme();
  const m = metricInfo(alert.metric);
  const territory = territoryById(alert.territoryId);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${alert.title}${showTerritory ? ` em ${territory.name}` : ''}. Severidade ${SEVERITY_LABEL[alert.severity]}. ${alert.summary}`}
      accessibilityHint="Abre a justificativa, limitações e ações sugeridas"
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderLeftWidth: 5,
        borderLeftColor: m.color,
        padding: spacing.lg,
        gap: spacing.sm,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm }}>
        <SeverityBadge severity={alert.severity} />
        <AppText variant="small" muted>
          {m.label}
          {showTerritory ? ` · ${territory.name}` : ''}
        </AppText>
      </View>
      <AppText variant="h2">{alert.title}</AppText>
      <AppText muted>{alert.summary}</AppText>
      <ConfidenceMeter value={alert.confidence} />
      <AppText variant="label" color={colors.accentText}>
        Ver justificativa e limitações ›
      </AppText>
    </Pressable>
  );
}
