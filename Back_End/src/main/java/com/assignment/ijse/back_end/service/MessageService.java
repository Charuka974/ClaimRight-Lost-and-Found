package com.assignment.ijse.back_end.service;

import com.assignment.ijse.back_end.dto.MessageDTO;

import java.util.List;

public interface MessageService {
    MessageDTO saveMessage(MessageDTO messageDTO);

    List<MessageDTO> getMessagesByClaimSenderReceiver(Long claimId, Long senderId, Long receiverId);

    public List<MessageDTO> getConversationBetweenUsers(Long userA, Long userB);

    List<MessageDTO> getMessagesByClaim(Long claimId);

    MessageDTO markMessageAsRead(Long messageId);

    void deleteMessage(Long messageId);
}
