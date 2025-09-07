package com.assignment.ijse.back_end.dto;

import com.assignment.ijse.back_end.entity.enums.ClaimStatus;
import com.assignment.ijse.back_end.entity.enums.ExchangeMethod;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClaimDTO {

    private Long claimId;

    private String claimType; // FOUND your item or that is my LOST item

    private ClaimStatus claimStatus;
    // PENDING, FINDER_APPROVED, ADMIN_APPROVED, FINDER_REJECTED, ADMIN_REJECTED, COMPLETED

    private String verificationLevel;
    // FINDER_ONLY, ADMIN_ONLY, DUAL_APPROVAL

    private LocalDateTime createdAt;

    private ExchangeMethod exchangeMethod;
    // PUBLIC_PLACE, COURIER_SERVICE, MAILING

    private String exchangeDetails;
    // Flexible description (address, tracking, meeting point)

    private Long foundItemId;
    private Long lostItemId;
    private Long claimantId;

    private List<ProofDTO> proofs; // new
    private List<ClaimVerificationDTO> verifications; // new
}