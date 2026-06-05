export type LineKey = "top" | "jungle" | "mid" | "adc" | "support" | "headCoach" | "coach";
export type BoardState = Record<LineKey, Array<string | null>>;
