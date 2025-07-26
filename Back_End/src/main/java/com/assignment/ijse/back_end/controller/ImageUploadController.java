package com.assignment.ijse.back_end.controller;

import com.assignment.ijse.back_end.service.ImgBBUploadService;
import com.assignment.ijse.back_end.service.impl.ImgBBUploadServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;


@RequiredArgsConstructor
@RestController
@RequestMapping("claimright/api/image")
@CrossOrigin(origins = "*")
@Slf4j
public class ImageUploadController {

    private final ImgBBUploadService imgBBUploadService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            String url = imgBBUploadService.uploadToImgBB(bytes, file.getOriginalFilename())
                    .block();  // block to get the result synchronously
            return ResponseEntity.ok(url);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Upload failed: " + e.getMessage());
        }
    }


}