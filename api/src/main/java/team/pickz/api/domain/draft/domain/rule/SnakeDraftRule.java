package team.pickz.api.domain.draft.domain.rule;

import org.springframework.stereotype.Component;

@Component
public class SnakeDraftRule implements DraftRule {

    @Override
    public int calculateNextTurn(int currentPickCount, int teamCount) {
        if (teamCount <= 0) return 0;

        int round = currentPickCount / teamCount;
        int indexInRound = currentPickCount % teamCount;

        if (round % 2 == 0) {
            return indexInRound;
        }
        else {
            return teamCount - 1 - indexInRound;
        }
    }

    @Override
    public String getRuleName() {
        return "SNAKE";
    }

}
