import type { DieValue } from "./dice";
import type { Category } from "./categories";

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

const counts = (dice: DieValue[]) => {
    const map = new Map<number, number>();
    for (const d of dice) map.set(d, (map.get(d) ?? 0) + 1);
    return map;
};

const isSmallStraight = (dice: DieValue[]) => {
    const u: number[] = Array.from(new Set(dice)).sort((a, b) => a - b);

    for (let i = 0; i <= u.length - 4; i++) {
        const a = u[i];
        if (u.includes(a + 1) && u.includes(a + 2) && u.includes(a + 3)) return true;
    }

    return false;
};

const isLargeStraight = (dice: DieValue[]) => {
    const u: number[] = Array.from(new Set(dice)).sort((a, b) => a - b);
    if (u.length !== 5) return false;

    const s1 = [1, 2, 3, 4, 5];
    const s2 = [2, 3, 4, 5, 6];

    return s1.every((n) => u.includes(n)) || s2.every((n) => u.includes(n));
};

export const calcScore = (category: Category, dice: DieValue[]): number => {
    const c = counts(dice);
    const diceSum = sum(dice);

    switch (category) {
        case "ACES":
            return (c.get(1) ?? 0) * 1;
        case "DEUCES":
            return (c.get(2) ?? 0) * 2;
        case "THREES":
            return (c.get(3) ?? 0) * 3;
        case "FOURS":
            return (c.get(4) ?? 0) * 4;
        case "FIVES":
            return (c.get(5) ?? 0) * 5;
        case "SIXES":
            return (c.get(6) ?? 0) * 6;
        case "CHOICE":
            return diceSum;
        case "FOUR_KIND": {
            const has4 = Array.from(c.values()).some((v) => v >= 4);
            return has4 ? 25 : 0;
        }
        case "FULL_HOUSE": {
            const vals = Array.from(c.values()).sort((a, b) => a - b);
            const ok = vals.length === 2 && vals[0] === 2 && vals[1] === 3;
            return ok ? 30 : 0; 
        }
        case "SMALL_STRAIGHT":
            return isSmallStraight(dice) ? 30 : 0;
        case "LARGE_STRAIGHT":
            return isLargeStraight(dice) ? 40 : 0;
        case "YACHT": {
            const ok = Array.from (c.values()).some((v) => v === 5);
            return ok ? 50 : 0;
        }

        default: {
            const _exhaustive: never = category;
            return _exhaustive;
        }
    }
};