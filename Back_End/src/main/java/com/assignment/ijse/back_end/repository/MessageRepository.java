package com.assignment.ijse.back_end.repository;

import com.assignment.ijse.back_end.entity.Message;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

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

    @Transactional
    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.userId = :receiverId AND m.isMsgRead = false")
    long countUnreadMessagesForUser(@Param("receiverId") Long receiverId);


    @Query("SELECT new map(m.sender.userId as senderId, COUNT(m) as unreadCount) " +
            "FROM Message m " +
            "WHERE m.receiver.userId = :receiverId AND m.isMsgRead = false " +
            "GROUP BY m.sender.userId")
    List<Map<String, Object>> countUnreadMessagesGroupedBySender(@Param("receiverId") Long receiverId);

}
