package team.pickz.api.domain.member.application.dto.response;

import lombok.Builder;
import team.pickz.api.domain.member.domain.Member;

@Builder
public record MemberInfoResponse(

        Long memberId,

        String email,

        String nickName

) {

    public static MemberInfoResponse from(Member member) {
        return MemberInfoResponse.builder()
                .memberId(member.getId())
                .email(member.getEmail())
                .nickName(member.getNickname())
                .build();
    }

}
