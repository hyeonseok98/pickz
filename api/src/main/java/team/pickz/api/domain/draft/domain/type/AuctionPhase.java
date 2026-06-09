package team.pickz.api.domain.draft.domain.type;

public enum AuctionPhase {
    STANDBY,    // (1) 10초 대기
    COUNTDOWN,  // (1) 3초 카운트다운 (입찰 불가)
    BIDDING,    // 15초 입찰 진행
    EVALUATING  // 결과 판정 및 로직 처리
}
