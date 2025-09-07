package com.assignment.ijse.back_end.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClaimVerificationDTO {

    private Long verificationId;
    private String verificationType; // FINDER_VERIFICATION, ADMIN_VERIFICATION
    private Boolean isApproved;
    private String comments;
    private LocalDateTime verifiedAt;

    private Long claimId;
    private Long verifierId;

}
