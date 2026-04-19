package team.pickz.api.domain.draft.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DraftParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "draft_room_id")
    private DraftRoom draftRoom;

    private Long memberId;

    private int turnIndex;

    public DraftParticipant(DraftRoom draftRoom, Long memberId, int turnIndex) {
        this.draftRoom = draftRoom;
        this.memberId = memberId;
        this.turnIndex = turnIndex;
    }

}
