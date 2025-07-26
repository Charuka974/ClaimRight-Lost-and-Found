package com.assignment.ijse.back_end.service;

import reactor.core.publisher.Mono;

public interface ImgBBUploadService {
    Mono<String> uploadToImgBB(byte[] fileBytes, String filename);
}
