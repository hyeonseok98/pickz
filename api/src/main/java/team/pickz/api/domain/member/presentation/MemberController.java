package team.pickz.api.domain.member.presentation;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import team.pickz.api.domain.member.application.MemberService;
import team.pickz.api.domain.member.application.dto.response.MemberInfoResponse;
import team.pickz.api.global.annotation.MemberId;

@RequiredArgsConstructor
@RequestMapping("/members")
@RestController
public class MemberController {

    private final MemberService memberService;

    @GetMapping("/me")
    public ResponseEntity<MemberInfoResponse> getMyInfo(@MemberId Long memberId) {
        MemberInfoResponse response = memberService.getMyInfo(memberId);

        return ResponseEntity.status(200).body(response);
    }

}
