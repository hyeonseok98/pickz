import type {
  AuctionPlayerLine,
  AuctionStaffMember,
  AuctionStreamer,
  AuctionTeamStaff,
} from "@/types/draft/auction";

export const pickzInvitational2026Id = "pickz-invitational-2026";
export const pickzInvitational2026Name = "2026 자낳대";
export const pickzInvitational2026TeamCount = 4;
export const pickzInvitational2026TeamSize = 7;

interface PickzInvitational2026PlayerParams {
  line: AuctionPlayerLine;
  name: string;
}

function createPickzInvitational2026Player({
  line,
  name,
}: PickzInvitational2026PlayerParams): AuctionStreamer {
  return {
    id: `${pickzInvitational2026Id}-${line}-${name}`,
    line,
    name,
    profileImageUrl: null,
  };
}

function createPickzInvitational2026Staff(
  role: AuctionStaffMember["role"],
  teamSlot: number,
  name: string,
): AuctionStaffMember {
  return {
    id: `${pickzInvitational2026Id}-team-${teamSlot}-${role}-${name}`,
    name,
    profileImageUrl: null,
    role,
  };
}

export const pickzInvitational2026PlayersByLine = {
  top: ["러너", "룩삼", "강소연", "샘웨"].map((name) =>
    createPickzInvitational2026Player({ line: "top", name }),
  ),
  jungle: ["갱맘", "소우릎", "뱅", "운타라"].map((name) =>
    createPickzInvitational2026Player({ line: "jungle", name }),
  ),
  mid: ["플레임", "앰비션", "헤징", "네클릿"].map((name) =>
    createPickzInvitational2026Player({ line: "mid", name }),
  ),
  adc: ["고수달", "크캣", "캬하하", "순당무"].map((name) =>
    createPickzInvitational2026Player({ line: "adc", name }),
  ),
  support: ["던", "푸린", "윤가놈", "침착맨"].map((name) =>
    createPickzInvitational2026Player({ line: "support", name }),
  ),
} satisfies Record<AuctionPlayerLine, AuctionStreamer[]>;

export const pickzInvitational2026Players = Object.values(
  pickzInvitational2026PlayersByLine,
).flat();

export const pickzInvitational2026TeamStaffs: AuctionTeamStaff[] = [
  {
    teamSlot: 1,
    headCoach: createPickzInvitational2026Staff("headCoach", 1, "마린"),
    coach: createPickzInvitational2026Staff("coach", 1, "엄티"),
  },
  {
    teamSlot: 2,
    headCoach: createPickzInvitational2026Staff("headCoach", 2, "베릴"),
    coach: createPickzInvitational2026Staff("coach", 2, "로컨"),
  },
  {
    teamSlot: 3,
    headCoach: createPickzInvitational2026Staff("headCoach", 3, "인간젤리"),
    coach: createPickzInvitational2026Staff("coach", 3, "노페"),
  },
  {
    teamSlot: 4,
    headCoach: createPickzInvitational2026Staff("headCoach", 4, "큐베"),
    coach: createPickzInvitational2026Staff("coach", 4, "플라이"),
  },
];

export const pickzInvitational2026AuctionStreamerOrder = [
  ...pickzInvitational2026PlayersByLine.top,
  ...pickzInvitational2026PlayersByLine.jungle,
  ...pickzInvitational2026PlayersByLine.mid,
  ...pickzInvitational2026PlayersByLine.adc,
  ...pickzInvitational2026PlayersByLine.support,
];
