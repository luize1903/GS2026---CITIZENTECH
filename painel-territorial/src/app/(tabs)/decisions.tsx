import React from 'react';
import { Alert as RNAlert, View } from 'react-native';
import { router } from 'expo-router';
import type { Decision } from '@/types';
import { metricInfo, territoryById } from '@/data/territories';
import { colors, radius, spacing } from '@/theme';
import { useAppStore } from '@/store/useAppStore';
import { STATUS_LABEL, fmtDate } from '@/utils/format';
import { AppText } from '@/components/AppText';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';

const STATUS_STYLE = {
  planned: { icon: '◔', fg: colors.medium, bg: colors.mediumBg },
  approved: { icon: '✔', fg: colors.low, bg: colors.lowBg },
  dismissed: { icon: '✕', fg: colors.textMuted, bg: colors.primarySoft },
} as const;

function DecisionItem({ d }: { d: Decision }) {
  const setStatus = useAppStore((s) => s.setDecisionStatus);
  const remove = useAppStore((s) => s.removeDecision);
  const m = metricInfo(d.metric);
  const s = STATUS_STYLE[d.status];

  const confirmRemove = () =>
    RNAlert.alert('Excluir decisão?', 'O registro será removido deste aparelho e não poderá ser recuperado.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => remove(d.id) },
    ]);

  return (
    <Card style={{ borderLeftWidth: 5, borderLeftColor: m.color }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }}>
        <View
          accessible
          accessibilityLabel={`Situação: ${STATUS_LABEL[d.status]}`}
          style={{ backgroundColor: s.bg, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs }}
        >
          <AppText variant="label" color={s.fg}>
            {s.icon} {STATUS_LABEL[d.status]}
          </AppText>
        </View>
        <AppText variant="small" muted>
          {territoryById(d.territoryId).name} · {m.label}
        </AppText>
      </View>
      <AppText variant="h2">{d.action}</AppText>
      <AppText muted>{d.rationale}</AppText>
      <AppText variant="small" muted>
        Responsável: {d.responsible} · Prazo: {fmtDate(d.deadline)}
      </AppText>
      <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
        {d.status === 'planned' && (
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button style={{ flex: 1 }} title="Aprovar" onPress={() => setStatus(d.id, 'approved')} />
            <Button style={{ flex: 1 }} title="Descartar" variant="secondary" onPress={() => setStatus(d.id, 'dismissed')} />
          </View>
        )}
        {d.status !== 'planned' && (
          <Button title="Reabrir como planejada" variant="secondary" onPress={() => setStatus(d.id, 'planned')} />
        )}
        <Button title="Excluir registro" variant="danger" onPress={confirmRemove} />
      </View>
    </Card>
  );
}

export default function DecisionsScreen() {
  const decisions = useAppStore((s) => s.decisions);

  return (
    <Screen>
      <Banner title="Registro de decisões">
        Apenas decisões tomadas por pessoas. Ficam salvas neste aparelho e não contêm dados de cidadãos.
      </Banner>
      <Button title="+ Nova decisão" onPress={() => router.push('/decision/new')} />

      {decisions.length === 0 ? (
        <Card>
          <AppText variant="h2">Nenhuma decisão registrada</AppText>
          <AppText muted>
            Abra um alerta e registre o que foi decidido — ou crie uma decisão avulsa pelo botão acima.
          </AppText>
        </Card>
      ) : (
        decisions.map((d) => <DecisionItem key={d.id} d={d} />)
      )}
    </Screen>
  );
}
