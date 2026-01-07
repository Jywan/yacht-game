import { create } from "zustand";

export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

type GameState = {
    rollId: number;
    dice: DieValue[];
    roll: () => void;
    reportDieValue: (index: number, value: DieValue) => void;
};

const DICE_COUNT = 5;

export const useGameStore = create<GameState>((set) => ({
    rollId: 0,
    dice: Array.from({ length: DICE_COUNT }, () => 1 as DieValue),
    roll: () => 
        set((s) => ({ 
            rollId: s.rollId + 1,
            dice: Array.from({ length: DICE_COUNT }, () => 1 as DieValue),
        })),
    reportDieValue: (index: number, value: DieValue) =>
        set((s) => {
            if (index < 0 || index >= s.dice.length) return s;
            const next = [...s.dice];
            next[index] = value;
            return { dice: next };
        }),
}));