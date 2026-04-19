package team.pickz.api.domain.draft.domain.rule;

public class SnakeDraftRule implements DraftRule{

    @Override
    public int calculateNextTurn(int currentRound, int currentPickInRound, int totalParticipants) {
        return (currentRound % 2 != 0)
                ? currentPickInRound
                : (totalParticipants - 1) - currentPickInRound;
    }

    @Override
    public String getRuleName() {
        return "SNAKE";
    }

}
