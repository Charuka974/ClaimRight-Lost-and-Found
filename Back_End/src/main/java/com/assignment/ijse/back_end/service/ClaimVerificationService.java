package com.assignment.ijse.back_end.service;

import com.assignment.ijse.back_end.dto.ClaimVerificationDTO;

import java.util.List;
import java.util.Optional;

public interface ClaimVerificationService {

    ClaimVerificationDTO createVerification(ClaimVerificationDTO dto);

    Optional<ClaimVerificationDTO> getVerificationById(Long id);

    List<ClaimVerificationDTO> getVerificationsByClaim(Long claimId);

    List<ClaimVerificationDTO> getVerificationsByVerifier(Long verifierId);

    ClaimVerificationDTO updateVerificationStatus(Long verificationId, Boolean isApproved, String comments);

    boolean deleteVerification(Long id);
}