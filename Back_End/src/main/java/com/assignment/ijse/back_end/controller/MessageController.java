package com.assignment.ijse.back_end.controller;

import com.assignment.ijse.back_end.dto.MessageDTO;
import com.assignment.ijse.back_end.service.ImgBBUploadService;
import com.assignment.ijse.back_end.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("claimright/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final MessageService messageService;
    private final ImgBBUploadService imgBBUploadService;

    @PostMapping("/send-message")
    public ResponseEntity<MessageDTO> sendMessage(
            @RequestPart("message") MessageDTO messageDTO,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        // Handle image if present
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                byte[] bytes = imageFile.getBytes();
                String filename = imageFile.getOriginalFilename();
                String imageUrl = imgBBUploadService.uploadToImgBB(bytes, filename).block();
                messageDTO.setContent("@@__claimRight_img__@@:" + imageUrl);
            } catch (IOException e) {
                throw new RuntimeException("Failed to read image file", e);
            }
        }

        MessageDTO saved = messageService.saveMessage(messageDTO);
        return ResponseEntity.ok(saved);
    }


    @GetMapping("/get-message-by-claim/claim/{claimId}")
    public ResponseEntity<List<MessageDTO>> getMessagesByClaim(@PathVariable Long claimId) {
        List<MessageDTO> messages = messageService.getMessagesByClaim(claimId);
        return ResponseEntity.ok(messages);
    }

//    @GetMapping("/getmessages/conversation")
//    public ResponseEntity<List<MessageDTO>> getMessagesByConversation(
//            @RequestParam Long claimId,
//            @RequestParam Long senderId,
//            @RequestParam Long receiverId) {
//        List<MessageDTO> messages = messageService.getMessagesByClaimSenderReceiver(claimId, senderId, receiverId);
//        return ResponseEntity.ok(messages);
//    }

    @GetMapping("/get-messages/conversation/users")
    public ResponseEntity<List<MessageDTO>> getConversationBetweenUsers(
            @RequestParam Long userA,
            @RequestParam Long userB) {
        List<MessageDTO> messages = messageService.getConversationBetweenUsers(userA, userB);
        return ResponseEntity.ok(messages);
    }

    @PutMapping("/mark-read/{messageId}/read")
    public ResponseEntity<MessageDTO> markAsRead(@PathVariable Long messageId) {
        MessageDTO updated = messageService.markMessageAsRead(messageId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete-message/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long messageId) {
        messageService.deleteMessage(messageId);
        return ResponseEntity.noContent().build();
    }

}
