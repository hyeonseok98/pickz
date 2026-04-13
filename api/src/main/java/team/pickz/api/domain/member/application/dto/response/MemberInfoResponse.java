package team.pickz.api.domain.member.application.dto.response;

import lombok.Builder;
import team.pickz.api.domain.member.domain.Member;

@Builder
public record MemberInfoResponse(

        Long memberId,

        String email,

        String nickname

) {

    public static MemberInfoResponse from(Member member) {
        return MemberInfoResponse.builder()
                .memberId(member.getId())
                .email(member.getEmail())
                .nickname(member.getNickname())
                .build();
    }

}
