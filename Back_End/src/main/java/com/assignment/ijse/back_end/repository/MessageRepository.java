package com.assignment.ijse.back_end.repository;

import com.assignment.ijse.back_end.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByClaimClaimIdAndSenderUserIdAndReceiverUserId(Long claimId, Long senderId, Long receiverId);

    @Query("""
    SELECT m FROM Message m 
    WHERE 
        (m.sender.userId = :userA AND m.receiver.userId = :userB) 
        OR 
        (m.sender.userId = :userB AND m.receiver.userId = :userA) 
    ORDER BY m.sentAt
""")
    List<Message> findConversationBetweenUsers(
            @Param("userA") Long userA,
            @Param("userB") Long userB
    );



    List<Message> findByClaimClaimIdOrderBySentAtDesc(Long claimId);


}
