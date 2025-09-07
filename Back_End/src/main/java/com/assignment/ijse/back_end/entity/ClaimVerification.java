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
@Table(name = "claim_verification")
public class ClaimVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long verificationId;

    private String verificationType; // "USER_VERIFICATION", "ADMIN_VERIFICATION"
    private Boolean isApproved;
    private String comments;
    private LocalDateTime verifiedAt;

    @ManyToOne
    @JoinColumn(name = "claim_id")
    private Claim claim;

    @ManyToOne
    @JoinColumn(name = "verifier_id")
    private User verifier;

}
