package com.assignment.ijse.back_end.service.impl;

import com.assignment.ijse.back_end.dto.MessageDTO;
import com.assignment.ijse.back_end.mapper.MessageMapper;
import com.assignment.ijse.back_end.entity.Claim;
import com.assignment.ijse.back_end.entity.Message;
import com.assignment.ijse.back_end.entity.User;
import com.assignment.ijse.back_end.exceptions.ResourceNotFound;
import com.assignment.ijse.back_end.repository.ClaimRepository;
import com.assignment.ijse.back_end.repository.MessageRepository;
import com.assignment.ijse.back_end.repository.UserRepository;
import com.assignment.ijse.back_end.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ClaimRepository claimRepository;
    private final ModelMapper modelMapper;
    private final MessageMapper messageMapper;

    @Override
    public MessageDTO saveMessage(MessageDTO messageDTO) {
        Claim claim = null;
        if (messageDTO.getClaimId() != null) {
            claim = claimRepository.findById(messageDTO.getClaimId()).orElse(null);
        }

        User sender = userRepository.findById(messageDTO.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        User receiver = userRepository.findById(messageDTO.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = new Message();
        message.setContent(messageDTO.getContent());
        message.setSentAt(messageDTO.getSentAt() != null ? messageDTO.getSentAt() : LocalDateTime.now());
        message.setClaim(claim); // May be null
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setMsgRead(messageDTO.isMsgRead());
        message.setReadAt(messageDTO.getReadAt());

        Message saved = messageRepository.save(message);

        // Convert back to DTO
        MessageDTO savedDTO = new MessageDTO(
                saved.getMessageId(),
                saved.getContent(),
                saved.getSentAt(),
                saved.getClaim() != null ? saved.getClaim().getClaimId() : null,
                saved.getSender().getUserId(),
                saved.getReceiver().getUserId(),
                saved.isMsgRead(),
                saved.getReadAt()
        );

        return savedDTO;
    }


    @Override
    public List<MessageDTO> getMessagesByClaimSenderReceiver(Long claimId, Long senderId, Long receiverId) {
        List<Message> messages = messageRepository.findByClaimClaimIdAndSenderUserIdAndReceiverUserId(claimId, senderId, receiverId);
        return messages.stream()
                .map(message -> modelMapper.map(message, MessageDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageDTO> getConversationBetweenUsers(Long userA, Long userB) {
        List<Message> messages = messageRepository.findConversationBetweenUsers(userA, userB);
        return messages.stream()
                .map(messageMapper::toDTO)
                .collect(Collectors.toList());
    }


    @Override
    public List<MessageDTO> getMessagesByClaim(Long claimId) {
        List<Message> messages = messageRepository.findByClaimClaimIdOrderBySentAtDesc(claimId);
        return messages.stream()
                .map(message -> modelMapper.map(message, MessageDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public MessageDTO markMessageAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFound("Message not found with ID: " + messageId));

        if (!message.isMsgRead()) {
            message.setMsgRead(true);
            message.setReadAt(LocalDateTime.now());
            message = messageRepository.save(message);
        }

        return modelMapper.map(message, MessageDTO.class);
    }

    @Override
    public void deleteMessage(Long messageId) {
        if (!messageRepository.existsById(messageId)) {
            throw new ResourceNotFound("Message not found with ID: " + messageId);
        }
        messageRepository.deleteById(messageId);
    }

}
