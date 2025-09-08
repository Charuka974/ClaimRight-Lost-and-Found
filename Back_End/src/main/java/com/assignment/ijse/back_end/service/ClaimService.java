package com.assignment.ijse.back_end.service;

import com.assignment.ijse.back_end.dto.ClaimDTO;
import com.assignment.ijse.back_end.entity.Claim;
import com.assignment.ijse.back_end.entity.enums.ClaimStatus;
import com.assignment.ijse.back_end.entity.enums.DeleteResult;
import com.assignment.ijse.back_end.entity.enums.ExchangeMethod;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ClaimService {
    ClaimDTO createClaim(ClaimDTO claim);

    Optional<ClaimDTO> getClaimById(Long id);

    List<ClaimDTO> getAllClaims();

    ClaimDTO updateClaimStatus(Long claimId, ClaimStatus status);

    ClaimDTO setExchangeMethod(Long claimId, ExchangeMethod method, String details);

    ClaimDTO markAsCompleted(Long claimId);

    DeleteResult deleteClaim(Long claimId);
    void deactivateClaim(Long claimId);

    public List<ClaimDTO> getClaimsByClaimant(Long userId);
    public List<ClaimDTO> getClaimsByFoundItem(Long foundItemId);
    public List<ClaimDTO> getClaimsByLostItem(Long lostItemId);
    public void deleteExpiredClaims(LocalDateTime cutoffDate);

    public List<ClaimDTO> getPendingClaimsBefore(LocalDateTime beforeDate);

    public ClaimDTO updateVerificationLevel(Long claimId, String newLevel);

}
