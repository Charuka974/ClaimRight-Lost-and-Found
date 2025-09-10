package com.assignment.ijse.back_end.entity;

import com.assignment.ijse.back_end.entity.enums.PaymentStatus;
import com.assignment.ijse.back_end.entity.enums.PaymentType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentType type; // REWARD, PRIORITY

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.PENDING; // PENDING, COMPLETED, FAILED, REFUNDED

    @ManyToOne
    @JoinColumn(name = "payer_id", referencedColumnName = "userId", nullable = false)
    private User payer;

    @ManyToOne
    @JoinColumn(name = "receiver_id", referencedColumnName = "userId")
    private User receiver; // null if payment is for priority (goes to system)

    @ManyToOne
    @JoinColumn(name = "lost_item_id", referencedColumnName = "id")
    private LostItem lostItem; // linked if payment is reward for a lost item

    @ManyToOne
    @JoinColumn(name = "found_item_id", referencedColumnName = "id")
    private FoundItem foundItem; // optional, if you want to track who found it

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

}
