export type StreamerLine = "top" | "jungle" | "mid" | "adc" | "support" | "headCoach" | "coach";

export interface StreamerInfo {
  channelId: string;
  channelName: string;
  followerCount: number | null;
  group?: string;
  groupGeneration?: number;
  id: string;
  mcnName?: string;
  profileImageUrl: string | null;
  streamerName: string;
}

export interface StreamerDirectoryItem {
  avatarDataUrl: string;
  channelId: string;
  channelName: string;
  id: string;
  line: StreamerLine;
  name: string;
  profileImageUrl: string | null;
  streamerInfo: StreamerInfo;
}
