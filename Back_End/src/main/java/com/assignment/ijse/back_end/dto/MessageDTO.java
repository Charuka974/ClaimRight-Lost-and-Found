package com.assignment.ijse.back_end.dto;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Data
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
