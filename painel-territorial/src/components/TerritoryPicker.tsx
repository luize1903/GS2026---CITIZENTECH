import React from 'react';
import { ScrollView, View } from 'react-native';
import { TERRITORIES } from '@/data/territories';
import { spacing } from '@/theme';
import { useAppStore } from '@/store/useAppStore';
import { Chip } from './Chip';

export function TerritoryPicker() {
  const territoryId = useAppStore((s) => s.territoryId);
  const setTerritory = useAppStore((s) => s.setTerritory);
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Escolher bairro">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
        {TERRITORIES.map((t) => (
          <Chip
            key={t.id}
            label={t.name}
            accessibilityLabel={`Bairro ${t.name}`}
            selected={t.id === territoryId}
            onPress={() => setTerritory(t.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
