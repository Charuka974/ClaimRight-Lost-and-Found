package com.assignment.ijse.back_end.controller;

import com.assignment.ijse.back_end.dto.LostItemDTO;
import com.assignment.ijse.back_end.service.ImgBBUploadService;
import com.assignment.ijse.back_end.service.LostItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("claimright/lost-item")
@RequiredArgsConstructor
@Slf4j
public class LostItemController {

    private final LostItemService lostItemService;
    private final ImgBBUploadService imgBBUploadService;

    @PostMapping("/report-lost-item")
    public ResponseEntity<LostItemDTO> reportLostItem(
            @RequestPart("lostItem") LostItemDTO lostItemDTO,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        log.info("Reporting lost item: {}", lostItemDTO);

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                byte[] bytes = imageFile.getBytes();
                String filename = imageFile.getOriginalFilename();
                // Upload image (blocking call for simplicity)
                String imageUrl = imgBBUploadService.uploadToImgBB(bytes, filename).block();
                lostItemDTO.setImageUrl(imageUrl);
            } catch (IOException e) {
                log.error("Failed to read image file", e);
                throw new RuntimeException("Failed to read image file", e);
            }
        }

        LostItemDTO savedItem = lostItemService.createLostItem(lostItemDTO);
        return ResponseEntity.ok(savedItem);
    }

    @PostMapping("/update-lost-item/{id}")
    public ResponseEntity<LostItemDTO> updateLostItem(
            @PathVariable Long id,
            @RequestPart("lostItem") LostItemDTO lostItemDTO,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        log.info("Updating lost item with id {}: {}", id, lostItemDTO);

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                byte[] bytes = imageFile.getBytes();
                String filename = imageFile.getOriginalFilename();
                String imageUrl = imgBBUploadService.uploadToImgBB(bytes, filename).block();
                lostItemDTO.setImageUrl(imageUrl);
            } catch (IOException e) {
                log.error("Failed to read image file", e);
                throw new RuntimeException("Failed to read image file", e);
            }
        }

        LostItemDTO updatedItem = lostItemService.updateLostItem(id, lostItemDTO);

        if (updatedItem != null) {
            return ResponseEntity.ok(updatedItem);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping
    public ResponseEntity<List<LostItemDTO>> getAllLostItems() {
        List<LostItemDTO> lostItems = lostItemService.getAllLostItems();
        return ResponseEntity.ok(lostItems);
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<LostItemDTO>> getLostItemsByOwner(@PathVariable Long ownerId) {
        List<LostItemDTO> lostItems = lostItemService.getLostItemsByOwner(ownerId);
        return ResponseEntity.ok(lostItems);
    }

//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteLostItem(@PathVariable Long id) {
//        boolean deleted = lostItemService.deleteLostItem(id);
//
//        if (deleted) {
//            return ResponseEntity.noContent().build();
//        } else {
//            return ResponseEntity.notFound().build();
//        }
//    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLostItem(@PathVariable Long id) {
        boolean deleted = lostItemService.disableLostItem(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }


}
