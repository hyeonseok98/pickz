package team.pickz.api.domain.draft.domain.rule;

public interface DraftRule {

    int calculateNextTurn(int currentPickCount, int totalParticipants);

    String getRuleName();

}
