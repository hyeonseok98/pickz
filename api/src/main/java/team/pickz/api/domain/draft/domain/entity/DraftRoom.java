package team.pickz.api.domain.draft.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import team.pickz.api.domain.draft.domain.RoomStatus;

import java.util.UUID;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DraftRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String inviteCode;

    private Long hostId;
    private int maxParticipants;
    private String ruleName;

    @Enumerated(EnumType.STRING)
    private RoomStatus status;

    private int currentRound;
    private int currentPickInRound;
    private int currentTurnIndex;

    @Version
    private Long version;

    public static DraftRoom create(Long hostId, int maxParticipants, String ruleName) {
        DraftRoom room = new DraftRoom();
        room.hostId = hostId;
        room.inviteCode = UUID.randomUUID().toString().substring(0, 8);
        room.maxParticipants = maxParticipants;
        room.ruleName = ruleName;
        room.status = RoomStatus.WAITING;
        room.currentRound = 1;
        room.currentPickInRound = 0;
        room.currentTurnIndex = 0;
        return room;
    }

    public void start() {
        if (this.status != RoomStatus.WAITING) throw new IllegalStateException("이미 시작되었거나 종료된 방입니다.");
        this.status = RoomStatus.IN_PROGRESS;
    }

    public void advanceTurn(int nextRound, int nextPickInRound, int nextTurnIndex) {
        this.currentRound = nextRound;
        this.currentPickInRound = nextPickInRound;
        this.currentTurnIndex = nextTurnIndex;
    }

    public void finish() {
        this.status = RoomStatus.DONE;
    }

}
