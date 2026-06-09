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

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function getSearchTokens(value: string) {
  return normalizeSearchValue(value)
    .split(/\s+/)
    .filter(Boolean);
}

function toCompactSearchValue(value: string) {
  return normalizeSearchValue(value).replace(/\s+/g, "");
}

function matchesOrderedCharacters(source: string, query: string) {
  if (query.length === 0) {
    return true;
  }

  let queryIndex = 0;

  for (const character of source) {
    if (character === query[queryIndex]) {
      queryIndex += 1;

      if (queryIndex === query.length) {
        return true;
      }
    }
  }

  return false;
}

/** 스트리머 검색창에서 이름과 초성 검색 일치 여부 확인 */
export function matchesStreamerSearchQuery(searchTargets: string | string[], query: string) {
  const targets = Array.isArray(searchTargets) ? searchTargets : [searchTargets];
  const normalizedQuery = query.trim().toLowerCase();
  const compactQuery = normalizedQuery.replace(/\s+/g, "");

  if (normalizedQuery.length === 0) {
    return true;
  }

  return targets.some((target) => {
    const normalizedTarget = normalizeSearchValue(target);

    if (normalizedTarget.length === 0) {
      return false;
    }

    if (normalizedTarget.startsWith(normalizedQuery)) {
      return true;
    }

    if (getSearchTokens(target).some((token) => token.startsWith(normalizedQuery))) {
      return true;
    }

    const searchHeadText = toSearchHeadText(target);

    if (searchHeadText.startsWith(normalizedQuery)) {
      return true;
    }

    if (matchesOrderedCharacters(toCompactSearchValue(target), compactQuery)) {
      return true;
    }

    return matchesOrderedCharacters(searchHeadText.replace(/\s+/g, ""), compactQuery);
  });
}
