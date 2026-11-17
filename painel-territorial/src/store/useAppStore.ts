import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Decision, DecisionStatus, WeatherData } from '@/types';
import { TERRITORIES, territoryById } from '@/data/territories';
import { fetchWeather } from '@/services/weather';
import { newId } from '@/utils/format';

export type FontScale = 1 | 1.15 | 1.3;
export type WeatherStatus = 'idle' | 'loading' | 'ok' | 'error';

interface AppState {
  // persistido
  territoryId: string;
  weather: Record<string, WeatherData>;
  decisions: Decision[];
  fontScale: FontScale;
  highContrast: boolean;
  privacyAccepted: boolean;

  // volátil
  weatherStatus: WeatherStatus;
  weatherError: string | null;

  // ações
  setTerritory: (id: string) => void;
  loadWeather: (territoryId?: string) => Promise<void>;
  addDecision: (d: Omit<Decision, 'id' | 'createdAt'>) => Decision;
  setDecisionStatus: (id: string, status: DecisionStatus) => void;
  removeDecision: (id: string) => void;
  setFontScale: (s: FontScale) => void;
  setHighContrast: (v: boolean) => void;
  acceptPrivacy: () => void;
  clearLocalData: () => void;
}

const initial = {
  territoryId: TERRITORIES[0].id,
  weather: {} as Record<string, WeatherData>,
  decisions: [] as Decision[],
  fontScale: 1 as FontScale,
  highContrast: false,
  privacyAccepted: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial,
      weatherStatus: 'idle',
      weatherError: null,

      setTerritory: (id) => set({ territoryId: id }),

      loadWeather: async (territoryId) => {
        const id = territoryId ?? get().territoryId;
        set({ weatherStatus: 'loading', weatherError: null });
        try {
          const data = await fetchWeather(territoryById(id));
          set((s) => ({ weather: { ...s.weather, [id]: data }, weatherStatus: 'ok' }));
        } catch (err) {
          // Falha de rede: mantém o último cache (se existir) e avisa o usuário.
          const msg = err instanceof Error ? err.message : 'Erro desconhecido';
          set({ weatherStatus: 'error', weatherError: msg });
        }
      },

      addDecision: (d) => {
        const decision: Decision = { ...d, id: newId(), createdAt: new Date().toISOString() };
        set((s) => ({ decisions: [decision, ...s.decisions] }));
        return decision;
      },

      setDecisionStatus: (id, status) =>
        set((s) => ({ decisions: s.decisions.map((d) => (d.id === id ? { ...d, status } : d)) })),

      removeDecision: (id) => set((s) => ({ decisions: s.decisions.filter((d) => d.id !== id) })),

      setFontScale: (fontScale) => set({ fontScale }),
      setHighContrast: (highContrast) => set({ highContrast }),
      acceptPrivacy: () => set({ privacyAccepted: true }),

      // Direito de apagar dados locais (LGPD): remove decisões, cache e preferências.
      clearLocalData: () =>
        set({ ...initial, privacyAccepted: get().privacyAccepted, weatherStatus: 'idle', weatherError: null }),
    }),
    {
      name: 'painel-territorial-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        territoryId: s.territoryId,
        weather: s.weather,
        decisions: s.decisions,
        fontScale: s.fontScale,
        highContrast: s.highContrast,
        privacyAccepted: s.privacyAccepted,
      }),
    },
  ),
);

/** true quando o estado persistido já foi lido do AsyncStorage. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useAppStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useAppStore.persist.hasHydrated());
    return unsub;
  }, []);
  return hydrated;
}
