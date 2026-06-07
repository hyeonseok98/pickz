package team.pickz.api.domain.draft.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = {"draft_room_id", "streamer_id"})
})
@Entity
public class DraftPick {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long roomId;

    private Long participantId;

    private String streamerId; // 치지직 채널 ID

    private String streamerName;

    private int roundIndex; // 몇 라운드에 뽑았는지

    @Builder
    public DraftPick(Long roomId, Long participantId, String streamerId, String streamerName, int roundIndex) {
        this.roomId = roomId;
        this.participantId = participantId;
        this.streamerId = streamerId;
        this.streamerName = streamerName;
        this.roundIndex = roundIndex;
    }

}
