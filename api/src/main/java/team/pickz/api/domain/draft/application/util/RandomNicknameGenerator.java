package team.pickz.api.domain.draft.application.util;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class RandomNicknameGenerator {

    private static final List<String> ADJECTIVES = List.of(
            "행복한", "즐거운", "신난", "귀여운", "멋진", "용감한",
            "똑똑한", "찬란한", "빛나는", "졸린", "배고픈", "침착한",
            "포근한", "신비로운", "수줍은", "느긋한", "불타는", "산뜻한"
    );
    private static final String BASE_NAME = "Pickz";

    public static String generate(int sequenceNumber) {
        int randomIndex = ThreadLocalRandom.current().nextInt(ADJECTIVES.size());
        String adjective = ADJECTIVES.get(randomIndex);

        return adjective + " " + BASE_NAME + sequenceNumber;
    }

}
