package team.pickz.api.domain.draft.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import team.pickz.api.domain.draft.domain.entity.DraftPick;
import team.pickz.api.domain.draft.domain.type.Position;

import java.util.List;

public interface DraftPickJpaRepository extends JpaRepository<DraftPick, Long> {

    Boolean existsByRoomIdAndStreamerId(Long roomId, String streamerId);

    // 1. 해당 방(roomId)에서 특정 포지션을 낙찰받은 고유한 팀의 '수'를 반환
    @Query("SELECT COUNT(DISTINCT dp.participantId) FROM DraftPick dp WHERE dp.roomId = :roomId AND dp.position = :position")
    int countDistinctParticipantIdByDraftRoomIdAndPosition(@Param("roomId") Long roomId, @Param("position") Position position);

    // 2. 해당 방(roomId)에서 특정 포지션을 낙찰받은 팀들의 'ID 목록'을 반환
    @Query("SELECT DISTINCT dp.participantId FROM DraftPick dp WHERE dp.roomId = :roomId AND dp.position = :position")
    List<Long> findParticipantIdsByDraftRoomIdAndPosition(@Param("roomId") Long roomId, @Param("position") Position position);

}
