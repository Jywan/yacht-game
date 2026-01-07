import { create } from "zustand";

type GameState = {
    rollId: number;
    roll: () => void;
};

export const useGameStore = create<GameState>((set) => ({
    rollId: 0,
    roll: () => set((s) => ({ rollId: s.rollId + 1 })),
}));