package team.pickz.api.domain.draft.domain.rule;

import team.pickz.api.domain.draft.domain.type.DraftMode;

public interface DraftRule {

    int calculateNextTurn(int currentPickCount, int totalParticipants);

    DraftMode getMode();

}
