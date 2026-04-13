package team.pickz.api.global.auth.domain;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Entity
public class RefreshToken {

    @Id
    @Column(name = "memberId")
    private Long memberId;

    @Column(nullable = false, unique = true)
    private String token;

    public static RefreshToken of(Long memberId, String token) {
        return RefreshToken.builder()
                .memberId(memberId)
                .token(token)
                .build();
    }

    public void updateToken(String newToken) {
        this.token = newToken;
    }
}
