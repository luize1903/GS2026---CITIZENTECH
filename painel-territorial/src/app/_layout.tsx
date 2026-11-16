import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/theme';
import { PrivacyGate } from '@/components/PrivacyGate';
import { useAppStore, useHydrated } from '@/store/useAppStore';

export default function RootLayout() {
  const hydrated = useHydrated();
  const accepted = useAppStore((s) => s.privacyAccepted);
  const territoryId = useAppStore((s) => s.territoryId);
  const loadWeather = useAppStore((s) => s.loadWeather);

  // Consome a API de clima ao abrir o app e sempre que o bairro muda.
  useEffect(() => {
    if (hydrated && accepted) void loadWeather(territoryId);
  }, [hydrated, accepted, territoryId, loadWeather]);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Carregando" />
      </View>
    );
  }

  if (!accepted) return <PrivacyGate />;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
          headerBackTitle: 'Voltar',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="alert/[id]" options={{ title: 'Detalhe do alerta' }} />
        <Stack.Screen name="decision/new" options={{ title: 'Registrar decisão', presentation: 'modal' }} />
      </Stack>
    </>
  );
}
