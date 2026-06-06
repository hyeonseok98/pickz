package team.pickz.api.domain.draft.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import team.pickz.api.domain.draft.domain.type.Position;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class DraftRoomStreamer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    private String streamerName;

    @Enumerated(EnumType.STRING)
    private Position position;

    private int teamSlot;

    @Builder
    public DraftRoomStreamer(Long roomId, String streamerName, Position position, int teamSlot) {
        this.roomId = roomId;
        this.streamerName = streamerName;
        this.position = position;
        this.teamSlot = teamSlot;
    }

}
