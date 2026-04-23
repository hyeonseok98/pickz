package team.pickz.api.domain.draft.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = {"draft_room_id", "streamerId"})
})
public class DraftPick {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long draftRoomId;

    private Long memberId;

    private String streamerId; // 치지직 채널 ID

    private int pickedRound; // 몇 라운드에 뽑았는지

    public DraftPick(Long draftRoomId, Long memberId, String streamerId, int pickedRound) {
        this.draftRoomId = draftRoomId;
        this.memberId = memberId;
        this.streamerId = streamerId;
        this.pickedRound = pickedRound;
    }

}
