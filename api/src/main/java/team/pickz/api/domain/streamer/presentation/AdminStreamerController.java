package team.pickz.api.domain.streamer.presentation;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.pickz.api.domain.streamer.application.StreamerSyncService;

import java.util.List;

@RestController
@RequestMapping("/admin/streamers")
@RequiredArgsConstructor
public class AdminStreamerController {

    private final StreamerSyncService streamerSyncService;

    @PostMapping("/sync")
    public ResponseEntity<Void> manualSyncTargetStreamers(@RequestBody List<String> channelIds) {
        streamerSyncService.syncStreamers(channelIds);
        return ResponseEntity.ok().build();
    }

}
