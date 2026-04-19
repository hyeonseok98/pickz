package team.pickz.api.domain.draft.domain.rule;

public interface DraftRule {

    int calculateNextTurn(int currentRound, int currentPickInRound, int totalParticipants);

    String getRuleName();

}
