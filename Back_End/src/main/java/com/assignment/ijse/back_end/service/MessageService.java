package com.assignment.ijse.back_end.service;

import com.assignment.ijse.back_end.dto.MessageDTO;

import java.util.List;
import java.util.Map;

public interface MessageService {
    MessageDTO saveMessage(MessageDTO messageDTO);

    List<MessageDTO> getMessagesByClaimSenderReceiver(Long claimId, Long senderId, Long receiverId);

    public List<MessageDTO> getConversationBetweenUsers(Long userA, Long userB);

    List<MessageDTO> getMessagesByClaim(Long claimId);

    MessageDTO markMessageAsRead(Long messageId);

    void deleteMessage(Long messageId);

    long countUnreadMessagesForUser(Long userId);

    void markConversationAsRead(Long userA, Long userB);

    List<Map<String, Object>> getUnreadMessagesCountGroupedBySender(Long receiverId);

}
