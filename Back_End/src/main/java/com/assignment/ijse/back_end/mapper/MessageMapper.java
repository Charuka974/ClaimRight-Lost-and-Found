package com.assignment.ijse.back_end.mapper;

import com.assignment.ijse.back_end.dto.MessageDTO;
import com.assignment.ijse.back_end.entity.Message;
import com.assignment.ijse.back_end.repository.ClaimRepository;
import com.assignment.ijse.back_end.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MessageMapper {

    private final UserRepository userRepository;
    private final ClaimRepository claimRepository;

    public MessageDTO toDTO(Message message) {
        return new MessageDTO(
                message.getMessageId(),
                message.getContent(),
                message.getSentAt(),
                message.getClaim() != null ? message.getClaim().getClaimId() : null,
                message.getSender() != null ? message.getSender().getUserId() : null,
                message.getReceiver() != null ? message.getReceiver().getUserId() : null,
                message.isMsgRead(),
                message.getReadAt()
        );
    }

    public Message toEntity(MessageDTO dto) {
        Message message = new Message();
        message.setMessageId(dto.getMessageId());
        message.setContent(dto.getContent());
        message.setSentAt(dto.getSentAt());
        message.setReadAt(dto.getReadAt());
        message.setMsgRead(dto.isMsgRead());

        // Safely fetch optional claim
        if (dto.getClaimId() != null) {
            claimRepository.findById(dto.getClaimId()).ifPresent(message::setClaim);
        }

        userRepository.findById(dto.getSenderId()).ifPresent(message::setSender);
        userRepository.findById(dto.getReceiverId()).ifPresent(message::setReceiver);

        return message;
    }
}
