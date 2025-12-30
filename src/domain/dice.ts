export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

export const rollDie = (): DieValue => {
    return (Math.floor(Math.random() * 6) + 1) as DieValue;
};

export const rollDice = (count: number): DieValue[] => {
    return Array.from({ length: count }, rollDie);
};

export const rerollUnheldDice = (dice: DieValue[], held: boolean[]): DieValue[] => {
    if (dice.length !== held.length) {
        throw new Error("dice and held length mismatch");
    }

    return dice.map((v, i) => (held[i] ? v : rollDie()));
}