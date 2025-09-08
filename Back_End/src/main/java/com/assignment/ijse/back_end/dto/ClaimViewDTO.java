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
public class ClaimViewDTO {

    private Long claimId;
    private String claimType; // FOUND or LOST
    private ClaimStatus claimStatus;
    private String verificationLevel; // USER_ONLY, ADMIN_ONLY, DUAL_APPROVAL
    private LocalDateTime createdAt;

    private ExchangeMethod exchangeMethod;
    private String exchangeDetails;

    private Long claimantId;
    private String claimantName; // for display

    private Long recipientId; // finder or owner
    private String recipientName; // finder or owner name for display

    // Item info (either found or lost)
    private Long itemId;
    private String itemName;
    private String itemDescription; // generalDescription for found / detailedDescription for lost
    private String itemImageUrl;
    private LocalDateTime itemDate; // dateFound / dateLost
    private String itemLocation;
    private List<String> itemCategoryNames;

    private Boolean itemIsClaimed;
    private Boolean itemIsActive;

    // Proofs associated with the claim
    private List<ProofDTO> proofs;

    // Optional verifications info if needed
    private List<ClaimVerificationDTO> verifications;

}
