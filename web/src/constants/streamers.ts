export type StreamerLine = "top" | "jungle" | "mid" | "adc" | "support";

export interface StreamerDirectoryItem {
  avatarDataUrl: string;
  id: string;
  line: StreamerLine;
  name: string;
}

function createAvatarDataUrl(backgroundColor: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="48" fill="${backgroundColor}" />
      <circle cx="48" cy="36" r="18" fill="#ffffff" fill-opacity="0.92" />
      <path d="M21 79c4-15 16-23 27-23s23 8 27 23" fill="#ffffff" fill-opacity="0.92" />
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createStreamer(id: string, name: string, line: StreamerLine, backgroundColor: string) {
  return {
    avatarDataUrl: createAvatarDataUrl(backgroundColor),
    id,
    line,
    name,
  } satisfies StreamerDirectoryItem;
}

export const STREAMER_DIRECTORY = [
  createStreamer("zeus", "Zeus", "top", "#dbeafe"),
  createStreamer("kingen", "Kingen", "top", "#dbeafe"),
  createStreamer("doran", "Doran", "top", "#dbeafe"),
  createStreamer("morgan", "Morgan", "top", "#dbeafe"),
  createStreamer("dudu", "DuDu", "top", "#dbeafe"),
  createStreamer("bin", "Bin", "top", "#dbeafe"),
  createStreamer("369", "369", "top", "#dbeafe"),
  createStreamer("kiin", "Kiin", "top", "#dbeafe"),
  createStreamer("photon", "Photon", "top", "#dbeafe"),
  createStreamer("chim", "침착맨", "top", "#dbeafe"),
  createStreamer("poong", "풍월량", "top", "#dbeafe"),
  createStreamer("oknyang", "옥냥이", "top", "#dbeafe"),
  createStreamer("yapyap", "얍얍", "top", "#dbeafe"),
  createStreamer("nokduro", "녹두로", "top", "#dbeafe"),
  createStreamer("canyon", "Canyon", "jungle", "#dcfce7"),
  createStreamer("oner", "Oner", "jungle", "#dcfce7"),
  createStreamer("peanut", "Peanut", "jungle", "#dcfce7"),
  createStreamer("lucid", "Lucid", "jungle", "#dcfce7"),
  createStreamer("cuzz", "Cuzz", "jungle", "#dcfce7"),
  createStreamer("wei", "Wei", "jungle", "#dcfce7"),
  createStreamer("xun", "Xun", "jungle", "#dcfce7"),
  createStreamer("tarzan", "Tarzan", "jungle", "#dcfce7"),
  createStreamer("kanavi", "Kanavi", "jungle", "#dcfce7"),
  createStreamer("captainjack", "캡틴잭", "jungle", "#dcfce7"),
  createStreamer("wolf", "울프", "jungle", "#dcfce7"),
  createStreamer("ddahyoni", "따효니", "jungle", "#dcfce7"),
  createStreamer("phoenix", "피닉스박", "jungle", "#dcfce7"),
  createStreamer("rallo", "랄로", "jungle", "#dcfce7"),
  createStreamer("faker", "Faker", "mid", "#fee2e2"),
  createStreamer("chovy", "Chovy", "mid", "#fee2e2"),
  createStreamer("showmaker", "ShowMaker", "mid", "#fee2e2"),
  createStreamer("bdd", "Bdd", "mid", "#fee2e2"),
  createStreamer("clozer", "Clozer", "mid", "#fee2e2"),
  createStreamer("knight", "Knight", "mid", "#fee2e2"),
  createStreamer("scout", "Scout", "mid", "#fee2e2"),
  createStreamer("caps", "Caps", "mid", "#fee2e2"),
  createStreamer("zeka", "Zeka", "mid", "#fee2e2"),
  createStreamer("monster", "괴물쥐", "mid", "#fee2e2"),
  createStreamer("tamtam", "탬탬버린", "mid", "#fee2e2"),
  createStreamer("dohyeon", "도현", "mid", "#fee2e2"),
  createStreamer("kimblue", "김블루", "mid", "#fee2e2"),
  createStreamer("ddutti", "뚜띠", "mid", "#fee2e2"),
  createStreamer("deft", "Deft", "adc", "#fef3c7"),
  createStreamer("viper", "Viper", "adc", "#fef3c7"),
  createStreamer("gumayusi", "Gumayusi", "adc", "#fef3c7"),
  createStreamer("aiming", "Aiming", "adc", "#fef3c7"),
  createStreamer("jiwoo", "Jiwoo", "adc", "#fef3c7"),
  createStreamer("ruler", "Ruler", "adc", "#fef3c7"),
  createStreamer("elk", "Elk", "adc", "#fef3c7"),
  createStreamer("gala", "GALA", "adc", "#fef3c7"),
  createStreamer("noah", "Noah", "adc", "#fef3c7"),
  createStreamer("baedon", "배돈", "adc", "#fef3c7"),
  createStreamer("danuri", "다누리", "adc", "#fef3c7"),
  createStreamer("smalladc", "하꼬원딜", "adc", "#fef3c7"),
  createStreamer("runner", "러너", "adc", "#fef3c7"),
  createStreamer("ambitionbot", "앰비션봇", "adc", "#fef3c7"),
  createStreamer("keria", "Keria", "support", "#ede9fe"),
  createStreamer("delight", "Delight", "support", "#ede9fe"),
  createStreamer("beryl", "BeryL", "support", "#ede9fe"),
  createStreamer("lehends", "Lehends", "support", "#ede9fe"),
  createStreamer("andil", "Andil", "support", "#ede9fe"),
  createStreamer("missing", "Missing", "support", "#ede9fe"),
  createStreamer("on", "ON", "support", "#ede9fe"),
  createStreamer("mikyx", "Mikyx", "support", "#ede9fe"),
  createStreamer("life", "Life", "support", "#ede9fe"),
  createStreamer("esca", "에스카", "support", "#ede9fe"),
  createStreamer("silp", "실프", "support", "#ede9fe"),
  createStreamer("kimnaseong", "김나성", "support", "#ede9fe"),
  createStreamer("sebom", "서새봄", "support", "#ede9fe"),
  createStreamer("sonishow", "소니쇼", "support", "#ede9fe"),
  createStreamer("aya", "아야", "support", "#ede9fe"),
] satisfies StreamerDirectoryItem[];

export const STREAMER_DIRECTORY_BY_NAME = new Map(
  STREAMER_DIRECTORY.map((streamer) => [streamer.name, streamer]),
);

export const STREAMER_DIRECTORY_BY_ID = new Map(
  STREAMER_DIRECTORY.map((streamer) => [streamer.id, streamer]),
);
