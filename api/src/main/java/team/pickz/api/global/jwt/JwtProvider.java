package team.pickz.api.global.jwt;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import team.pickz.api.global.jwt.config.TokenProperties;

import javax.crypto.SecretKey;
import java.util.Date;

import static io.jsonwebtoken.io.Decoders.BASE64;

@RequiredArgsConstructor
@Component
public class JwtProvider {

    private final TokenProperties tokenProperties;

    public String createAccessToken(Long memberId, String role) {
        return createToken(memberId, role, tokenProperties.expirationTime().accessToken());
    }

    public String createRefreshToken(Long memberId, String role) {
        return createToken(memberId, role, tokenProperties.expirationTime().refreshToken());
    }

    private String createToken(Long memberId, String role, long validityInMilliseconds) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + (validityInMilliseconds * 1000));

        return Jwts.builder()
                .subject(String.valueOf(memberId))
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(getSecretKey())
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSecretKey()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // 실무에서는 ExpiredJwtException 등을 잡아 Custom Exception으로 처리
            return false;
        }
    }

    public Long getMemberId(String token) {
        return Long.valueOf(Jwts.parser().verifyWith(getSecretKey()).build()
                .parseSignedClaims(token).getPayload().getSubject());
    }

    public String getRole(String token) {
        return String.valueOf(Jwts.parser().verifyWith(getSecretKey()).build()
                .parseSignedClaims(token).getPayload().get("role"));
    }

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(BASE64.decode(tokenProperties.secretKey()));
    }

}
