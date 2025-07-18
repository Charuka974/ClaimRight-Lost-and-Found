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
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    private Double amount;
    private String transactionId;
    private String status; // "PENDING", "COMPLETED", "FAILED", "REFUNDED"
    private LocalDateTime processedAt;

    @ManyToOne
    @JoinColumn(name = "claim_id")
    private Claim claim;

}
