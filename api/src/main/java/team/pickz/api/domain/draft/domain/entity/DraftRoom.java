package team.pickz.api.domain.draft.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import team.pickz.api.domain.draft.domain.type.DraftMode;
import team.pickz.api.domain.draft.domain.type.ParticipationType;
import team.pickz.api.domain.draft.domain.type.RoomStatus;

import java.util.UUID;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class DraftRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(nullable = false, unique = true)
    private String inviteCode;

    @Enumerated(EnumType.STRING)
    private RoomStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DraftMode draftMode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParticipationType participationType;

    private String preset;

    private int teamCount;

    private int teamSize;

    private int currentPickCount;

    @Builder
    public DraftRoom(String title, DraftMode draftMode, ParticipationType participationType, String preset, int teamCount, int teamSize) {
        if (participationType == ParticipationType.TOGETHER && (title == null || title.isBlank())) {
            throw new IllegalArgumentException("같이하기 모드에서는 방 제목이 필수입니다.");
        }
        this.title = title;
        this.inviteCode = UUID.randomUUID().toString().substring(0, 8);
        this.status = RoomStatus.WAITING;
        this.draftMode = draftMode;
        this.participationType = participationType;
        this.preset = preset;
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

//    public void updateSettings(int teamCount, int teamSize) {
//        this.teamCount = teamCount;
//        this.teamSize = teamSize;
//    }

}
