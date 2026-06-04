package team.pickz.api.global.oauth2;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpRequest;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.http.OAuth2ErrorResponseErrorHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.http.converter.OAuth2AccessTokenResponseHttpMessageConverter;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@Component
public class CustomTokenResponseClient implements OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> {

    private final RestTemplate restTemplate;

    public CustomTokenResponseClient() {
        this.restTemplate = new RestTemplate(Arrays.asList(
                new FormHttpMessageConverter(),
                new OAuth2AccessTokenResponseHttpMessageConverter()
        ));
        this.restTemplate.setErrorHandler(new OAuth2ErrorResponseErrorHandler());
        this.restTemplate.getInterceptors().add(new ChzzkTokenResponseInterceptor());
    }

    @Override
    public OAuth2AccessTokenResponse getTokenResponse(OAuth2AuthorizationCodeGrantRequest request) {
        ClientRegistration clientRegistration = request.getClientRegistration();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", request.getAuthorizationExchange().getAuthorizationResponse().getCode());

        // ⭐️ 핵심: 치지직일 경우 모든 파라미터를 카멜케이스로 맞춤 전송
        if ("chzzk".equals(clientRegistration.getRegistrationId())) {
            params.add("clientId", clientRegistration.getClientId());
            params.add("clientSecret", clientRegistration.getClientSecret());
            params.add("grantType", request.getGrantType().getValue());
            // 치지직은 종종 state 값 검증을 깐깐하게 하므로 필수로 넣어줍니다.
            params.add("state", request.getAuthorizationExchange().getAuthorizationResponse().getState());
        } else {
            params.add("client_id", clientRegistration.getClientId());
            params.add("client_secret", clientRegistration.getClientSecret());
            params.add("grant_type", request.getGrantType().getValue());
            params.add("redirect_uri", request.getAuthorizationExchange().getAuthorizationRequest().getRedirectUri());
        }

        RequestEntity<MultiValueMap<String, String>> requestEntity = new RequestEntity<>(
                params, headers, HttpMethod.POST, URI.create(clientRegistration.getProviderDetails().getTokenUri())
        );

        ResponseEntity<OAuth2AccessTokenResponse> response = restTemplate.exchange(requestEntity, OAuth2AccessTokenResponse.class);
        return response.getBody();
    }

    // --- 내부 클래스: 치지직 응답 및 에러 조작용 인터셉터 ---
    private static class ChzzkTokenResponseInterceptor implements ClientHttpRequestInterceptor {
        @Override
        public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution) throws IOException {
            ClientHttpResponse response = execution.execute(request, body);

            if (request.getURI().getHost().contains("chzzk")) {
                byte[] responseBytes = response.getBody().readAllBytes();
                String responseString = new String(responseBytes, StandardCharsets.UTF_8);

                try {
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode root = mapper.readTree(responseString);

                    // 🚨 1. 치지직에서 에러(4xx, 5xx)를 뱉었을 경우 처리
                    if (response.getStatusCode().is4xxClientError() || response.getStatusCode().is5xxServerError()) {
                        System.err.println("========== 🚨 치지직 토큰 발급 실패 🚨 ==========");
                        System.err.println("진짜 이유: " + responseString);
                        System.err.println("================================================");

                        ObjectNode standardError = mapper.createObjectNode();
                        // Spring Security가 뻗지 않도록 "error" 필드를 억지로 만들어 줍니다.
                        standardError.put("error", root.path("code").asText("chzzk_error"));
                        standardError.put("error_description", root.path("message").asText(responseString));

                        return new CustomClientHttpResponse(response, mapper.writeValueAsBytes(standardError));
                    }

                    // ✅ 2. 정상 응답인 경우 평탄화(Flatten) 작업
                    if (root.has("content")) {
                        JsonNode content = root.get("content");
                        ObjectNode standardResponse = mapper.createObjectNode();

                        standardResponse.put("access_token", content.path("accessToken").asText());
                        standardResponse.put("token_type", content.path("tokenType").asText("Bearer"));
                        standardResponse.put("expires_in", content.path("expiresIn").asInt(3600));

                        if (content.has("refreshToken")) {
                            standardResponse.put("refresh_token", content.path("refreshToken").asText());
                        }

                        return new CustomClientHttpResponse(response, mapper.writeValueAsBytes(standardResponse));
                    }
                } catch (Exception e) {
                    return new CustomClientHttpResponse(response, responseBytes);
                }
                return new CustomClientHttpResponse(response, responseBytes);
            }
            return response;
        }
    }

    private static class CustomClientHttpResponse implements ClientHttpResponse {
        private final ClientHttpResponse original;
        private final byte[] body;

        public CustomClientHttpResponse(ClientHttpResponse original, byte[] body) {
            this.original = original;
            this.body = body;
        }

        @Override public InputStream getBody() { return new ByteArrayInputStream(body); }
        @Override public HttpHeaders getHeaders() { return original.getHeaders(); }
        @Override public org.springframework.http.HttpStatusCode getStatusCode() throws IOException { return original.getStatusCode(); }
        @Override public String getStatusText() throws IOException { return original.getStatusText(); }
        @Override public void close() { original.close(); }
    }
}