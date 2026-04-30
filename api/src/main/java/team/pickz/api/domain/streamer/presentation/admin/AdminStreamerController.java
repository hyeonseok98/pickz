package team.pickz.api.domain.streamer.presentation.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.pickz.api.domain.streamer.application.admin.AdminStreamerService;
import team.pickz.api.infra.chzzk.dto.ChzzkLiveResponse;

import java.util.List;

@RestController
@RequestMapping("/admin/streamers")
@RequiredArgsConstructor
public class AdminStreamerController {

    private final AdminStreamerService adminstreamerService;

    @PostMapping
    public ResponseEntity<Void> registerStreamers(@RequestBody List<String> channelIds) {
        adminstreamerService.registerStreamers(channelIds);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/live")
    public ResponseEntity<List<ChzzkLiveResponse>> getLiveStreamers() {
        List<ChzzkLiveResponse> response = adminstreamerService.getLiveStreamers();

        return ResponseEntity.status(200).body(response);
    }

}
