package com.assignment.ijse.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long messageId;
    private String content;
    private LocalDateTime sentAt;
    private Long claimId;
    private Long senderId;
    private Long receiverId;
    private boolean isMsgRead;
    private LocalDateTime readAt;
}
