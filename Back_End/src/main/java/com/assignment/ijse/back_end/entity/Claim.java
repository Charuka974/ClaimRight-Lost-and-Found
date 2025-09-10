package com.assignment.ijse.back_end.entity;

import com.assignment.ijse.back_end.entity.enums.ClaimStatus;
import com.assignment.ijse.back_end.entity.enums.ExchangeMethod;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

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

    private String claimType; // FOUND your item or that is my LOST item

    @Enumerated(EnumType.STRING)
    private ClaimStatus claimStatus;
    // PENDING, FINDER_APPROVED, ADMIN_APPROVED, FINDER_REJECTED, ADMIN_REJECTED, COMPLETED

    private String verificationLevel;
    // USER_ONLY, ADMIN_ONLY, DUAL_APPROVAL

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private ExchangeMethod exchangeMethod;
    // PUBLIC_PLACE, COURIER_SERVICE, MAILING

    @Column(length = 500)
    private String exchangeDetails;
    // Flexible description (address, tracking, meeting point)

    @Column(nullable = false)
    private Boolean isActive = true;

    /**
     * If this is a claim on a FOUND item,
     * this will be the found item being claimed.
     */
    @ManyToOne
    @JoinColumn(name = "found_item_id")
    private FoundItem foundItem;

    /**
     * If this is a claim on a LOST item (someone says they found it),
     * this will be the lost item they are responding to.
     */
    @ManyToOne
    @JoinColumn(name = "lost_item_id")
    private LostItem lostItem;

    /**
     * The person making the claim (claimant).
     * Could be the owner in a claim on a found item,
     * or the finder in a claim on a lost item.
     */
    @ManyToOne
    @JoinColumn(name = "claimant_id")
    private User claimant;

    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Proof> proofs;

    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages;

    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClaimVerification> verifications;
}
