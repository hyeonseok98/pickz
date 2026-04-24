package team.pickz.api.global.auth.application.dto;

public record TokenResponse(

        String accessToken,

        String refreshToken

) {
}
