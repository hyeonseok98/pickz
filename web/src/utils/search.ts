const HANGUL_SYLLABLE_START = 0xac00;
const HANGUL_SYLLABLE_END = 0xd7a3;
const HANGUL_INITIAL_CYCLE = 21 * 28;
const HANGUL_INITIALS = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

function getSearchHeadCharacter(character: string) {
  const characterCode = character.charCodeAt(0);

  if (characterCode < HANGUL_SYLLABLE_START || characterCode > HANGUL_SYLLABLE_END) {
    return character.toLowerCase();
  }

  const initialIndex = Math.floor((characterCode - HANGUL_SYLLABLE_START) / HANGUL_INITIAL_CYCLE);

  return HANGUL_INITIALS[initialIndex] ?? character.toLowerCase();
}

function toSearchHeadText(value: string) {
  return Array.from(value)
    .map((character) => getSearchHeadCharacter(character))
    .join("");
}

export function matchesStreamerSearchQuery(name: string, query: string) {
  const normalizedName = name.trim().toLowerCase();
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return true;
  }

  if (normalizedName.startsWith(normalizedQuery)) {
    return true;
  }

  return toSearchHeadText(name).startsWith(normalizedQuery);
}
