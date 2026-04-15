package team.pickz.api.domain.member.presentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import team.pickz.api.domain.member.application.dto.response.MemberInfoResponse;
import team.pickz.api.global.annotation.MemberId;

@Tag(name = "Member", description = "회원 관련 API")
@RequestMapping("/members")
public interface MemberDocsController {

    @Operation(
            summary = "내 정보 조회",
            description = "현재 로그인한 사용자의 정보를 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자")
    })
    @GetMapping("/me")
    ResponseEntity<MemberInfoResponse> getMyInfo(@MemberId Long memberId);

}
