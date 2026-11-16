import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import type { Metric } from '@/types';
import { METRICS, TERRITORIES } from '@/data/territories';
import { MIN_TOUCH, radius, spacing } from '@/theme';
import { useTheme } from '@/theme/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { DecisionForm, FormErrors, validateDecision, parseBrDate } from '@/utils/validation';
import { AppText } from '@/components/AppText';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';

export default function NewDecisionScreen() {
  const params = useLocalSearchParams<{ alertId?: string; territory?: string; metric?: string }>();
  const { colors } = useTheme();
  const addDecision = useAppStore((s) => s.addDecision);
  const currentTerritory = useAppStore((s) => s.territoryId);

  const [territoryId, setTerritoryId] = useState(params.territory ?? currentTerritory);
  const [metric, setMetric] = useState<Metric>((params.metric as Metric) ?? 'water');
  const [form, setForm] = useState<DecisionForm>({ action: '', rationale: '', responsible: '', deadline: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [reviewed, setReviewed] = useState(false);
  const [reviewError, setReviewError] = useState(false);

  const set = (k: keyof DecisionForm) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined })); // limpa o erro ao corrigir
  };
  const validateField = (k: keyof DecisionForm) => () => {
    const e = validateDecision(form);
    setErrors((prev) => ({ ...prev, [k]: e[k] }));
  };

  const submit = () => {
    const e = validateDecision(form);
    setErrors(e);
    const noReview = !reviewed;
    setReviewError(noReview);
    if (Object.keys(e).length > 0 || noReview) return;

    addDecision({
      alertId: params.alertId ?? null,
      territoryId,
      metric,
      status: 'planned',
      action: form.action.trim(),
      rationale: form.rationale.trim(),
      responsible: form.responsible.trim(),
      deadline: parseBrDate(form.deadline)!,
    });
    router.dismissAll?.();
    router.replace('/decisions');
  };

  return (
    <Screen>
      {params.alertId ? (
        <Banner title="Vinculada a um alerta">
          Esta decisão será associada ao alerta selecionado. Registre o que foi decidido, inclusive se optar por não agir.
        </Banner>
      ) : null}

      <View style={{ gap: spacing.sm }}>
        <AppText variant="label">Bairro</AppText>
        <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {TERRITORIES.map((t) => (
            <Chip key={t.id} label={t.name} selected={territoryId === t.id} onPress={() => setTerritoryId(t.id)} />
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <AppText variant="label">Tema</AppText>
        <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {METRICS.map((m) => (
            <Chip key={m.key} label={m.label} selected={metric === m.key} onPress={() => setMetric(m.key)} />
          ))}
        </View>
      </View>

      <TextField
        label="Ação decidida"
        value={form.action}
        onChangeText={set('action')}
        onBlur={validateField('action')}
        error={errors.action}
        hint="Ex.: Reforçar coleta de resíduos às segundas e quintas"
        maxLength={200}
        multiline
      />
      <TextField
        label="Justificativa"
        value={form.rationale}
        onChangeText={set('rationale')}
        onBlur={validateField('rationale')}
        error={errors.rationale}
        hint="Por que esta decisão? Considere confiança e limitações do alerta."
        maxLength={500}
        multiline
      />
      <TextField
        label="Setor ou cargo responsável"
        value={form.responsible}
        onChangeText={set('responsible')}
        onBlur={validateField('responsible')}
        error={errors.responsible}
        hint="Use o setor (ex.: Secretaria de Zeladoria), nunca dados pessoais"
        maxLength={80}
      />
      <TextField
        label="Prazo (DD/MM/AAAA)"
        value={form.deadline}
        onChangeText={set('deadline')}
        onBlur={validateField('deadline')}
        error={errors.deadline}
        keyboardType="numbers-and-punctuation"
        placeholder="31/12/2026"
        maxLength={10}
      />

      <Pressable
        onPress={() => {
          setReviewed((v) => !v);
          setReviewError(false);
        }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: reviewed }}
        accessibilityLabel="Confirmo que revisei a justificativa, a confiança e as limitações do alerta"
        style={{
          minHeight: MIN_TOUCH,
          flexDirection: 'row',
          gap: spacing.md,
          alignItems: 'center',
          borderRadius: radius.sm,
          borderWidth: reviewError ? 2 : 1.5,
          borderColor: reviewError ? colors.high : colors.border,
          padding: spacing.md,
          backgroundColor: colors.surface,
        }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: colors.primary,
            backgroundColor: reviewed ? colors.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {reviewed && <AppText color="#FFFFFF" style={{ fontWeight: '800' }}>✓</AppText>}
        </View>
        <AppText style={{ flex: 1 }}>
          Revisei a justificativa, a confiança e as limitações do alerta e assumo a decisão.
        </AppText>
      </Pressable>
      {reviewError && (
        <AppText variant="small" color={colors.high} accessibilityLiveRegion="polite">
          ⚠ Confirme a revisão para registrar a decisão.
        </AppText>
      )}

      <Button title="Salvar decisão" onPress={submit} />
      <Button title="Cancelar" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
