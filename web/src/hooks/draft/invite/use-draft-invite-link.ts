"use client";

import { useEffect, useMemo, useState } from "react";
import type { DraftType } from "@/types/draft";
import { createDraftInviteLink } from "@/utils/draft/draft-invite-room";

interface UseDraftInviteLinkParams {
  coachEnabled?: boolean;
  draftType: DraftType;
  headCoachEnabled?: boolean;
  inviteCode?: string;
  teamCount: string;
  teamSize: string;
}

function useBrowserOrigin() {
  const [browserOrigin, setBrowserOrigin] = useState("");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setBrowserOrigin(window.location.origin);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return browserOrigin;
}

/** hydration 이후 브라우저 origin을 읽어 초대 링크 생성 */
export function useDraftInviteLink({
  coachEnabled,
  draftType,
  headCoachEnabled,
  inviteCode,
  teamCount,
  teamSize,
}: UseDraftInviteLinkParams) {
  const browserOrigin = useBrowserOrigin();

  return useMemo(() => {
    if (!browserOrigin || !inviteCode) {
      return "";
    }

    return createDraftInviteLink({
      baseUrl: browserOrigin,
      coachEnabled,
      draftType,
      headCoachEnabled,
      inviteCode,
      teamCount,
      teamSize,
    });
  }, [
    browserOrigin,
    coachEnabled,
    draftType,
    headCoachEnabled,
    inviteCode,
    teamCount,
    teamSize,
  ]);
}
