import { LolLineKey } from "./draft-board";

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
  line: LolLineKey;
  name: string;
  profileImageUrl: string | null;
  streamerInfo: StreamerInfo;
}
