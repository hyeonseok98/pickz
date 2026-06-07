package team.pickz.api.domain.draft.domain.rule;

import org.springframework.stereotype.Component;
import team.pickz.api.domain.draft.domain.type.DraftMode;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Component
public class DraftRuleFactory {
    private final Map<DraftMode, DraftRule> ruleMap = new EnumMap<>(DraftMode.class);

    public DraftRuleFactory(List<DraftRule> rules) {
        for(DraftRule rule : rules) {
            if(rule.getRuleName().equals("SNAKE")) {
                ruleMap.put(DraftMode.SNAKE, rule);
            }
            else if(rule.getRuleName().equals("AUCTION")) {
                ruleMap.put(DraftMode.AUCTION, rule);
            }
        }
    }

    public DraftRule getRule(DraftMode mode) {
        DraftRule rule = ruleMap.get(mode);
        if (rule == null) {
            throw new IllegalArgumentException("지원하지 않는 드래프트 모드입니다: " + mode);
        }
        return rule;
    }
}
