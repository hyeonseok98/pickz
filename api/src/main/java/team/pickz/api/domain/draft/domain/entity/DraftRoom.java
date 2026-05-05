package team.pickz.api.domain.draft.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
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

    @Enumerated(EnumType.STRING)
    private RoomStatus status;

    private String draftMode;

    private String draftRuleType;

    private int teamCount;

    private int teamSize;

    private int currentPickCount;

    @Builder
    public DraftRoom(String draftMode, String draftRuleType, int teamCount, int teamSize) {
        this.inviteCode = UUID.randomUUID().toString().substring(0, 8);
        this.status = RoomStatus.WAITING;
        this.draftMode = draftMode;
        this.draftRuleType = draftRuleType;
        this.teamCount = teamCount;
        this.teamSize = teamSize;
        this.currentPickCount = 0;
    }

    public void start() {
        if (this.status != RoomStatus.WAITING) {
            throw new IllegalStateException("이미 시작되었거나 종료된 드래프트입니다.");
        }
        this.status = RoomStatus.IN_PROGRESS;
    }

    public void incrementPickCount() {
        this.currentPickCount++;
        if (this.currentPickCount >= (this.teamCount * this.teamSize)) {
            this.status = RoomStatus.DONE;
        }
    }

}
