package team.pickz.api.global.auth.application.dto;

public record TokenDto(

        String accessToken,

        String refreshToken

) {
}
