import { create } from "zustand";
import type { DieValue } from "../domain/dice";

type GameState = {
    rollId: number;
    topValue: DieValue;
    roll: () => void;
    reportTopValue: (value: DieValue) => void;
};

export const useGameStore = create<GameState>((set) => ({
    rollId: 0,
    topValue: 1,

    roll: () =>
        set((s) => ({
            rollId: s.rollId + 1,
        })
    ),

    reportTopValue: (value) => set({ topValue: value }),
}));