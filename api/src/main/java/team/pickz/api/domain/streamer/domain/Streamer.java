package team.pickz.api.domain.streamer.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Streamer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String channelId;

    private String channelName;

    private String profileImageUrl;


    public void updateProfile(String channelId, String channelName, String profileImageUrl) {
        this.channelId = channelId;
        this.channelName = channelName;
        this.profileImageUrl = profileImageUrl;
    }

    public static Streamer from(String channelId, String channelName,String profileImageUrl) {
        return Streamer.builder()
                .channelId(channelId)
                .channelName(channelName)
                .profileImageUrl(profileImageUrl)
                .build();
    }

}
