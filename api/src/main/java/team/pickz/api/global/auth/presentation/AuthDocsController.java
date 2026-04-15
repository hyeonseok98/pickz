package team.pickz.api.global.auth.presentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Tag(name = "Auth", description = "인증 관련 API")
@RequestMapping("/auths")
public interface AuthDocsController {

    @Operation(summary = "토큰 재발급", description = "access 토큰 만료 시 refresh 토큰으로 재발급합니다.")
    @Parameter(name = "refresh_token", description = "쿠키에 저장된 리프레시 토큰", in = ParameterIn.COOKIE, required = true)
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "토큰 발급 성공"),
            @ApiResponse(responseCode = "401", description = "리프레시 토큰 누락/유효하지 않음")
    })
    @SecurityRequirements(value = {})
    @PostMapping("/token")
    ResponseEntity<Void> reissue(HttpServletRequest request, HttpServletResponse response);

}
