import { create } from "zustand";
import type { DieValue } from "../domain/dice";
import { rollDice } from "../domain/dice";
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

	dice: DieValue[];
	held: boolean[];
	rollsLeft: 0 | 1 | 2 | 3;

	rollId: number;

	scores: Scores;

	initGame: () => void;
	initTurn: () => void;
	toggleHold: (index: number) => void;
	roll: () => void;

	// A안: 물리 결과 확정값을 store에 반영
	setDieValue: (index: number, value: DieValue) => void;

	previewScore: (category: Category) => number;
	commitScore: (category: Category) => void;

	totalScore: () => number;
};

const DICE_COUNT = 5;

export const useGameStore = create<GameState>((set, get) => ({
	turnIndex: 0,
	maxTurns: 12,
	phase: "rolling",

	dice: rollDice(DICE_COUNT),
	held: Array.from({ length: DICE_COUNT }, () => false),
	rollsLeft: 3,

	rollId: 0,

	scores: makeEmptyScores(),

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
		const { rollsLeft, phase, rollId, held } = get();
		if (phase !== "rolling") return;
		if (rollsLeft <= 0) return;

		// 전부 held면 roll 금지 + rollsLeft 감소도 금지
		const hasUnheld = held.some((h) => !h);
		if (!hasUnheld) return;

		// A안: 값은 물리 엔진 정착 후 확정되므로 여기서 dice를 바꾸지 않음
		set({
			rollsLeft: (rollsLeft - 1) as 0 | 1 | 2 | 3,
			rollId: rollId + 1,
		});
	},

	setDieValue: (index, value) =>
		set((s) => {
			if (index < 0 || index >= s.dice.length) return s;
			const next = [...s.dice];
			next[index] = value;
			return { dice: next };
		}),

	previewScore: (category: Category) => {
		const { dice } = get();
		return calcScore(category, dice);
	},

	commitScore: (category: Category) => {
		const { scores, phase, turnIndex, maxTurns, rollId } = get();
		if (phase !== "rolling") return;
		if (scores[category] !== null) return;

		const value = get().previewScore(category);
		const nextScores = { ...scores, [category]: value };

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