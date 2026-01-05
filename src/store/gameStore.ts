import { create } from "zustand";
import type { DieValue } from "../domain/dice";
import { rollDice, rerollUnheldDice } from "../domain/dice";
import type { Category } from "../domain/categories";
import { CATEGORIES } from "../domain/categories";
import { calcScore } from "../domain/scoring";

type Scores = Record<Category, number | null>;

const makeEmptyScores = (): Scores =>
    Object.fromEntries(CATEGORIES.map((c) => [c, null])) as Scores;

type GameState = {
    turnIndex: number;
    maxTurns: number;
    phase: "rolling" | "finished";

    // dice
    dice: DieValue[];
    held: boolean[];
    rollsLeft: 0 | 1 | 2 | 3;
    
    // animation trigger
    rollId: number;

    // score
    scores: Scores;

    // action
    initGame: () => void;
    initTurn: () => void;
    toggleHold: (index: number) => void;
    roll: () => void;

    previewScore: (category: Category) => number;
    commitScore: (category: Category) => void;

    totalScore: () => number;
}

const DICE_COUNT = 5;

export const useGameStore = create<GameState>((set, get) => ({
    turnIndex: 0,
    maxTurns: 12,
    phase: "rolling",

    dice: rollDice(DICE_COUNT),
    held: Array.from({ length: DICE_COUNT }, () => false),
    rollsLeft: 3,
    scores: makeEmptyScores(),

    rollId: 0,

    initGame: () => 
        set({
            turnIndex: 0,
            maxTurns: 12,
            phase: "rolling",
            dice: rollDice(DICE_COUNT),
            held: Array.from({ length: DICE_COUNT }, () => false),
            rollsLeft: 3,
            scores: makeEmptyScores(),
            rollId: 0,
        }),
    
    initTurn: () =>
        set({
            dice: rollDice(DICE_COUNT),
            held: Array.from({ length: DICE_COUNT }, () => false),
            rollsLeft: 3,
            rollId: get().rollId + 1,
        }),
    
    toggleHold: (index: number) =>
        set((s) => {
            if (index < 0 || index >= s.held.length) return s;
            const next = [...s.held];
            next[index] = !next[index];
            return { held: next };
        }),
    
    roll: () => {
        const { dice, held, rollsLeft, phase, rollId } = get();
        if (phase !== "rolling") return;
        if (rollsLeft <= 0) return;
    
        set({
            dice: rerollUnheldDice(dice, held),
            rollsLeft: (rollsLeft - 1) as 0 | 1 | 2 | 3,
            rollId: rollId + 1,
        });
    },

    previewScore: (category: Category) => {
        const { dice } = get();
        return calcScore(category, dice);
    },
    
    commitScore: (category: Category) => {
        const { scores, phase, turnIndex, maxTurns, rollId } = get();
        if (phase !== "rolling") return;
        if (scores[category] !== null) return; // 이미 사용
    
        const value = get().previewScore(category);
    
        // 점수 확정
        const nextScores = { ...scores, [category]: value };
    
        // 다음 턴/종료
        const isLastTurn = turnIndex + 1 >= maxTurns;
        if (isLastTurn) {
            set({
                scores: nextScores,
                phase: "finished",
                rollId: rollId + 1,
            });
            return;
        }
    
        set({
            scores: nextScores,
            turnIndex: turnIndex + 1,
            dice: rollDice(DICE_COUNT),
            held: Array.from({ length: DICE_COUNT }, () => false),
            rollsLeft: 3,
            rollId: rollId + 1,
        });
    },
    
    totalScore: () => {
        const { scores } = get();
        return Object.values(scores).reduce<number>((acc, v) => acc + (v ?? 0), 0);
    },
}));
