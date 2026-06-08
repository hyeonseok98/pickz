package team.pickz.api.domain.draft.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import team.pickz.api.domain.draft.domain.type.Position;

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

    private String streamerName;

    @Enumerated(EnumType.STRING)
    private Position position;

    private int roundIndex; // 몇 라운드에 뽑았는지

    @Builder
    public DraftPick(Long roomId, Long participantId, String streamerName, Position position, int roundIndex) {
        this.roomId = roomId;
        this.participantId = participantId;
        this.streamerName = streamerName;
        this.position = position;
        this.roundIndex = roundIndex;
    }

}
