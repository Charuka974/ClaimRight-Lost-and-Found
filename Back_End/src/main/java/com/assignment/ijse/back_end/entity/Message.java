package com.assignment.ijse.back_end.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messageId;

    private String content;
    private LocalDateTime sentAt;

    @ManyToOne(optional = true)  // or just omit, since true is default
    @JoinColumn(name = "claim_id", nullable = true)
    private Claim claim;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private User receiver;

    // fields to track read status
//    @Column(name = "is_read") // Avoid reserved keywords
    private boolean isMsgRead;                 // Default: false (unread)
    private LocalDateTime readAt;
}
