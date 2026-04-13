package team.pickz.api.domain.member.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_member_provider_external_id",
                        columnNames = {"provider", "externalId"}
                )
        }
)
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoginProvider provider;

    @Column(nullable = false)
    private String externalId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private Member(String email, String nickname, LoginProvider provider, String externalId, Role role) {
        this.email = email;
        this.nickname = nickname;
        this.provider = provider;
        this.externalId = externalId;
        this.role = role;
    }

    public static Member createSocialMember(String email, String nickname, LoginProvider provider, String externalId) {
        return new Member(email, nickname, provider, externalId, Role.USER);
    }

}
