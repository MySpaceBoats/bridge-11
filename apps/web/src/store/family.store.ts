import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Family } from '@/types';
import { familiesApi } from '@/lib/api';

interface FamilyState {
  families: Family[];
  currentFamily: Family | null;
  isLoading: boolean;
  fetchFamilies: () => Promise<void>;
  setCurrentFamily: (family: Family) => void;
  createFamily: (name: string, description?: string) => Promise<Family>;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      families: [],
      currentFamily: null,
      isLoading: false,

      fetchFamilies: async () => {
        set({ isLoading: true });
        try {
          const families = await familiesApi.list();
          set({ families });
          if (!get().currentFamily && families.length > 0) {
            set({ currentFamily: families[0] });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      setCurrentFamily: (family) => set({ currentFamily: family }),

      createFamily: async (name, description) => {
        const family = await familiesApi.create({ name, description });
        set((s) => ({
          families: [...s.families, family],
          currentFamily: s.currentFamily ?? family,
        }));
        return family;
      },
    }),
    {
      name: 'family-storage',
      partialize: (s) => ({ currentFamily: s.currentFamily }),
    },
  ),
);
