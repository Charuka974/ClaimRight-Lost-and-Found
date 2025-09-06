package com.assignment.ijse.back_end.controller;

import com.assignment.ijse.back_end.dto.FoundItemDTO;
import com.assignment.ijse.back_end.service.FoundItemService;
import com.assignment.ijse.back_end.service.ImgBBUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("claimright/found-item")
@RequiredArgsConstructor
@Slf4j
public class FoundItemController {

    private final FoundItemService foundItemService;
    private final ImgBBUploadService imgBBUploadService;

    @PostMapping("/report-found-item")
    public ResponseEntity<FoundItemDTO> reportFoundItem(
            @RequestPart("foundItem") FoundItemDTO foundItemDTO,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        log.info("Reporting found item: {}", foundItemDTO);

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                byte[] bytes = imageFile.getBytes();
                String filename = imageFile.getOriginalFilename();
                // Upload image (blocking call for simplicity)
                String imageUrl = imgBBUploadService.uploadToImgBB(bytes, filename).block();
                foundItemDTO.setImageUrl(imageUrl);
            } catch (IOException e) {
                log.error("Failed to read image file", e);
                throw new RuntimeException("Failed to read image file", e);
            }
        }

        FoundItemDTO savedItem = foundItemService.createFoundItem(foundItemDTO);
        return ResponseEntity.ok(savedItem);
    }

    @PostMapping("/update-found-item/{id}")
    public ResponseEntity<FoundItemDTO> updateFoundItem(
            @PathVariable Long id,
            @RequestPart("foundItem") FoundItemDTO foundItemDTO,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        log.info("Updating found item with id {}: {}", id, foundItemDTO);

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                byte[] bytes = imageFile.getBytes();
                String filename = imageFile.getOriginalFilename();
                // Upload image (blocking call for simplicity)
                String imageUrl = imgBBUploadService.uploadToImgBB(bytes, filename).block();
                foundItemDTO.setImageUrl(imageUrl);
            } catch (IOException e) {
                log.error("Failed to read image file", e);
                throw new RuntimeException("Failed to read image file", e);
            }
        }

        FoundItemDTO updatedItem = foundItemService.updateFoundItem(id, foundItemDTO);

        if (updatedItem != null) {
            return ResponseEntity.ok(updatedItem);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping
    public ResponseEntity<List<FoundItemDTO>> getAllFoundItems() {
        List<FoundItemDTO> foundItems = foundItemService.getAllFoundItems();
        return ResponseEntity.ok(foundItems);
    }

    @GetMapping("/item-id/{id}")
    public ResponseEntity<FoundItemDTO> getFoundItemById(@PathVariable Long id) {
        FoundItemDTO item = foundItemService.getFoundItemById(id);
        if (item != null) {
            return ResponseEntity.ok(item);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/finder/{finderId}")
    public ResponseEntity<List<FoundItemDTO>> getFoundItemsByFinder(@PathVariable Long finderId) {
        List<FoundItemDTO> foundItems = foundItemService.getFoundItemsByFinder(finderId);
        return ResponseEntity.ok(foundItems);
    }

//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteFoundItem(@PathVariable Long id) {
//        boolean deleted = foundItemService.deleteFoundItem(id);
//
//        if (deleted) {
//            return ResponseEntity.noContent().build();
//        } else {
//            return ResponseEntity.notFound().build();
//        }
//    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoundItem(@PathVariable Long id) {
        boolean deleted = foundItemService.disableFoundItem(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @PatchMapping("/{id}/claim")
    public ResponseEntity<FoundItemDTO> markItemAsClaimed(@PathVariable Long id) {
        FoundItemDTO updatedItem = foundItemService.markAsClaimed(id);
        if (updatedItem != null) {
            return ResponseEntity.ok(updatedItem);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
