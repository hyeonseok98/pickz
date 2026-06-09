package team.pickz.api.domain.draft.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "draft_participant", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"room_id", "selected_coach_name"})
})
@Entity
public class DraftParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id")
    private Long roomId;

    private Long memberId;

    @Column(nullable = false, unique = true)
    private String participantToken;

    private String nickname;

    private boolean isHost;

    private Integer turnOrder;

    private String selectedCoachName;

    private boolean isReady;

    @Builder
    public DraftParticipant(Long roomId, Long memberId, String nickname, boolean isHost) {
        this.roomId = roomId;
        this.memberId = memberId;
        this.participantToken = UUID.randomUUID().toString();
        this.nickname = nickname;
        this.isHost = isHost;
    }

    public void assignTurnOrder(int turnOrder) {
        this.turnOrder = turnOrder;
    }

    public void selectCoach(String coachName, int turnOrder) {
        this.selectedCoachName = coachName;
        this.turnOrder = turnOrder;
        this.isReady = (coachName != null);
    }

}
