package team.pickz.api.domain.draft.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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

}
