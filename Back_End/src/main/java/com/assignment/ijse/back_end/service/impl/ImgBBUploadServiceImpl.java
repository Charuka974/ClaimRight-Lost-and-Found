package com.assignment.ijse.back_end.service.impl;


import com.assignment.ijse.back_end.service.ImgBBUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ImgBBUploadServiceImpl implements ImgBBUploadService {

    private final WebClient.Builder webClientBuilder; // FIXED: Inject builder

    @Value("${imgbb.api.key}")
    private String apiKey;

    @Override
    public Mono<String> uploadToImgBB(byte[] fileBytes, String filename) {
        WebClient webClient = webClientBuilder.baseUrl("https://api.imgbb.com/1").build(); // build when needed

        ByteArrayResource resource = new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return filename;
            }
        };

        return webClient.post()
                .uri(uriBuilder -> uriBuilder.path("/upload")
                        .queryParam("key", apiKey)
                        .build())
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("image", resource))
                .retrieve()
                .bodyToMono(ImgBBResponse.class)
                .map(response -> {
                    if (response.isSuccess()) {
                        return response.getData().getUrl();
                    } else {
                        throw new RuntimeException("Upload failed: " + response.getError().getMessage());
                    }
                });
    }

    // Define classes to map JSON response
    public static class ImgBBResponse {
        private boolean success;
        private Data data;
        private Error error;

        // getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public Data getData() { return data; }
        public void setData(Data data) { this.data = data; }
        public Error getError() { return error; }
        public void setError(Error error) { this.error = error; }

        public static class Data {
            private String url;
            // other fields if needed

            public String getUrl() { return url; }
            public void setUrl(String url) { this.url = url; }
        }

        public static class Error {
            private String message;

            public String getMessage() { return message; }
            public void setMessage(String message) { this.message = message; }
        }
    }
}
