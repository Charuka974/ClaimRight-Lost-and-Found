package com.assignment.ijse.back_end.controller;

import com.assignment.ijse.back_end.dto.MessageDTO;
import com.assignment.ijse.back_end.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    @MessageMapping("/send") // maps to /app/send
    public void sendMessage(MessageDTO messageDTO) {
        // Save the message
        MessageDTO saved = messageService.saveMessage(messageDTO);

        // Send to the receiver in real-time
        messagingTemplate.convertAndSend("/topic/messages/" + saved.getReceiverId(), saved);

        // Also send to sender, so they see their own message via WS
        messagingTemplate.convertAndSend("/topic/messages/" + saved.getSenderId(), saved);

    }

}