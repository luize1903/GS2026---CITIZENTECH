import React from 'react';
import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
import { useTheme } from '@/theme/useTheme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const tab = (title: string, icon: IconName, iconFocused: IconName) => ({
  title,
  tabBarAccessibilityLabel: title,
  tabBarIcon: ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
    <Ionicons name={focused ? iconFocused : icon} size={size} color={color as string} />
  ),
});

export default function TabsLayout() {
  const { colors: c } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: c.accentText,
        tabBarInactiveTintColor: c.textMuted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: { minHeight: 60, paddingBottom: 6, paddingTop: 4, backgroundColor: c.surface },
      }}
    >
      <Tabs.Screen name="index" options={{ ...tab('Painel', 'speedometer-outline', 'speedometer'), headerTitle: 'ZeroDesperdício' }} />
      <Tabs.Screen name="alerts" options={{ ...tab('Alertas', 'warning-outline', 'warning'), headerTitle: 'Alertas e previsões' }} />
      <Tabs.Screen name="decisions" options={{ ...tab('Ações', 'clipboard-outline', 'clipboard'), headerTitle: 'Ações do gestor' }} />
      <Tabs.Screen name="settings" options={{ ...tab('Config.', 'settings-outline', 'settings'), headerTitle: 'Configurações' }} />
    </Tabs>
  );
}
