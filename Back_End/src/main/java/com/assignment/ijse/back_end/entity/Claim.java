package com.assignment.ijse.back_end.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "claims")
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long claimId;

    private String status; // "PENDING", "FINDER_APPROVED", "ADMIN_APPROVED", "FINDER_REJECTED", "ADMIN_REJECTED", "COMPLETED"
    private String verificationLevel; // "FINDER_ONLY", "ADMIN_ONLY", "DUAL_APPROVAL"
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "lost_item_id")
    private Item lostItem;

    @ManyToOne
    @JoinColumn(name = "found_item_id")
    private Item foundItem;

    @ManyToOne
    @JoinColumn(name = "claimant_id")
    private User claimant;

    @OneToMany(mappedBy = "claim")
    private List<Proof> proofs;

    @OneToMany(mappedBy = "claim")
    private List<Message> messages;

    @OneToMany(mappedBy = "claim")
    private List<ClaimVerification> verifications;

}