package team.pickz.api.infra.chzzk.dto;

import java.util.List;

public record ChzzkLiveListResponse(

        int code,

        String message,

        Content content

) {

    public record Content(
            List<ChzzkLiveResponse> data,
            ChzzkPage page
    ) {
    }

    public record ChzzkPage(
            String next
    ) {
    }

    public List<ChzzkLiveResponse> getData() {
        return content != null && content.data != null ? content.data : List.of();
    }

    public String getPage() {
        return content != null && content.page != null ? content.page.next() : null;
    }

}
