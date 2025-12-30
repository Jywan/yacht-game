export const CATEGORIES = ["ACES", "DEUCES", "THREES", "FOURS", "FIVES", "SIXES", "CHOICE", "FOUR_KIND", "FULL_HOUSE", "SMALL_STRAIGHT", "LARGE_STRAIGHT", "YACHT"] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Category, string> = {
    ACES: "Aces (1)",
    DEUCES: "Deuces (2)",
    THREES: "Threes (3)",
    FOURS: "Fours (4)",
    FIVES: "Fives (5)",
    SIXES: "Sixes (6)",
    CHOICE: "Choice",
    FOUR_KIND: "Four of a Kind",
    FULL_HOUSE: "Full House",
    SMALL_STRAIGHT: "Small Straight",
    LARGE_STRAIGHT: "Large Straight",
    YACHT: "Yacht"
}