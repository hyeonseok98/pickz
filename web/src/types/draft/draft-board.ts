export type LolLineKey = "top" | "jungle" | "mid" | "adc" | "support" | "headCoach" | "coach";
export type BoardState = Record<LolLineKey, Array<string | null>>;
