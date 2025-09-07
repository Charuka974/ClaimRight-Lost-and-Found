package com.assignment.ijse.back_end.service.impl;

import com.assignment.ijse.back_end.dto.ClaimDTO;
import com.assignment.ijse.back_end.dto.ClaimVerificationDTO;
import com.assignment.ijse.back_end.dto.ProofDTO;
import com.assignment.ijse.back_end.entity.*;
import com.assignment.ijse.back_end.entity.enums.ClaimStatus;
import com.assignment.ijse.back_end.entity.enums.ExchangeMethod;
import com.assignment.ijse.back_end.repository.ClaimRepository;
import com.assignment.ijse.back_end.repository.FoundItemRepository;
import com.assignment.ijse.back_end.repository.LostItemRepository;
import com.assignment.ijse.back_end.repository.UserRepository;
import com.assignment.ijse.back_end.service.ClaimService;
import com.assignment.ijse.back_end.service.ProofService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClaimServiceImpl implements ClaimService {

    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;
    private final FoundItemRepository foundItemRepository;
    private final LostItemRepository lostItemRepository;
    private final ProofService proofService;

    /**
     * Creates a new claim and attaches proofs and verifications.
     * Entire operation is transactional, so if proof saving fails,
     * the claim will also be rolled back.
     */
    @Transactional
    @Override
    public ClaimDTO createClaim(ClaimDTO dto) {
        //set the auto data
        dto.setClaimStatus(ClaimStatus.PENDING);
        dto.setCreatedAt(LocalDateTime.now());
        dto.setVerificationLevel("USER_ONLY");

        Claim claim = mapToEntity(dto);

        // Link claimant
        if (dto.getClaimantId() != null) {
            User claimant = userRepository.findById(dto.getClaimantId())
                    .orElseThrow(() -> new RuntimeException("Claimant not found"));
            claim.setClaimant(claimant);
        }

        // Link found item
        if (dto.getFoundItemId() != null) {
            FoundItem foundItem = foundItemRepository.findById(dto.getFoundItemId())
                    .orElseThrow(() -> new RuntimeException("Found item not found"));
            claim.setFoundItem(foundItem);
        }

        // Link lost item
        if (dto.getLostItemId() != null) {
            LostItem lostItem = lostItemRepository.findById(dto.getLostItemId())
                    .orElseThrow(() -> new RuntimeException("Lost item not found"));
            claim.setLostItem(lostItem);
        }

        claim.setClaimStatus(ClaimStatus.PENDING);
        claim.setCreatedAt(LocalDateTime.now());

        // Attach verifications (optional)
        if (dto.getVerifications() != null) {
            List<ClaimVerification> verifications = dto.getVerifications().stream()
                    .map(this::mapToVerificationEntity)
                    .peek(v -> v.setClaim(claim))
                    .collect(Collectors.toList());
            claim.setVerifications(verifications);
        }

        // Save claim first
        Claim savedClaim = claimRepository.save(claim);

        // Handle proofs via ProofService
        if (dto.getProofs() != null) {
            for (ProofDTO proofDTO : dto.getProofs()) {
                proofDTO.setClaimId(savedClaim.getClaimId());
                proofService.createProof(proofDTO); // if this throws -> rollback
            }
        }
        return mapToDTO(savedClaim);
    }

    @Override
    public Optional<ClaimDTO> getClaimById(Long id) {
        return claimRepository.findById(id).map(this::mapToDTO);
    }

    @Override
    public List<ClaimDTO> getAllClaims() {
        return claimRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ClaimDTO updateClaimStatus(Long claimId, ClaimStatus status) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        claim.setClaimStatus(status);
        return mapToDTO(claimRepository.save(claim));
    }

    @Override
    public ClaimDTO setExchangeMethod(Long claimId, ExchangeMethod method, String details) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        claim.setExchangeMethod(method);
        claim.setExchangeDetails(details);
        return mapToDTO(claimRepository.save(claim));
    }

    @Override
    public ClaimDTO markAsCompleted(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        claim.setClaimStatus(ClaimStatus.COMPLETED);

        // Mark related items as claimed
        if (claim.getLostItem() != null) {
            claim.getLostItem().setIsClaimed(true);
            lostItemRepository.save(claim.getLostItem());
        }
        if (claim.getFoundItem() != null) {
            claim.getFoundItem().setIsClaimed(true);
            foundItemRepository.save(claim.getFoundItem());
        }

        return mapToDTO(claimRepository.save(claim));
    }

    @Override
    public boolean deleteClaim(Long id) {
        if (claimRepository.existsById(id)) {
            claimRepository.deactivateClaim(id);
            return true;
        }
        return false;
    }

    @Override
    public List<ClaimDTO> getClaimsByClaimant(Long userId) {
        User claimant = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return claimRepository.findByClaimant(claimant).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClaimDTO> getClaimsByFoundItem(Long foundItemId) {
        return claimRepository.findByFoundItemId(foundItemId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClaimDTO> getClaimsByLostItem(Long lostItemId) {
        return claimRepository.findByLostItemId(lostItemId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteExpiredClaims(LocalDateTime cutoffDate) {
        List<Claim> expiredClaims = claimRepository.findByClaimStatusAndCreatedAtBefore(ClaimStatus.PENDING, cutoffDate);
        for (Claim claim : expiredClaims) {
            claimRepository.deactivateClaim(claim.getClaimId());
        }
    }

    @Override
    public List<ClaimDTO> getPendingClaimsBefore(LocalDateTime beforeDate) {
        return claimRepository.findByClaimStatusAndCreatedAtBefore(ClaimStatus.PENDING, beforeDate).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ---------------- Utility Mappers ----------------
    private ClaimDTO mapToDTO(Claim claim) {
        ClaimDTO dto = new ClaimDTO();
        dto.setClaimId(claim.getClaimId());
        dto.setClaimType(claim.getClaimType());
        dto.setClaimStatus(claim.getClaimStatus());
        dto.setVerificationLevel(claim.getVerificationLevel());
        dto.setCreatedAt(claim.getCreatedAt());
        dto.setExchangeMethod(claim.getExchangeMethod());
        dto.setExchangeDetails(claim.getExchangeDetails());
        dto.setFoundItemId(claim.getFoundItem() != null ? claim.getFoundItem().getId() : null);
        dto.setLostItemId(claim.getLostItem() != null ? claim.getLostItem().getId() : null);
        dto.setClaimantId(claim.getClaimant() != null ? claim.getClaimant().getUserId() : null);

        // Map verifications
        if (claim.getVerifications() != null) {
            List<ClaimVerificationDTO> verificationDTOs = claim.getVerifications().stream()
                    .map(this::mapToVerificationDTO)
                    .collect(Collectors.toList());
            dto.setVerifications(verificationDTOs);
        }

        return dto;
    }

    private Claim mapToEntity(ClaimDTO dto) {
        Claim claim = new Claim();
        claim.setClaimId(dto.getClaimId());
        claim.setClaimType(dto.getClaimType());
        claim.setClaimStatus(dto.getClaimStatus());
        claim.setVerificationLevel(dto.getVerificationLevel());
        claim.setExchangeMethod(dto.getExchangeMethod());
        claim.setExchangeDetails(dto.getExchangeDetails());
        return claim;
    }

    private ClaimVerification mapToVerificationEntity(ClaimVerificationDTO dto) {
        ClaimVerification verification = new ClaimVerification();
        verification.setVerificationType(dto.getVerificationType());
        verification.setIsApproved(dto.getIsApproved());
        verification.setComments(dto.getComments());
        verification.setVerifiedAt(dto.getVerifiedAt() != null ? dto.getVerifiedAt() : LocalDateTime.now());
        return verification;
    }

    private ClaimVerificationDTO mapToVerificationDTO(ClaimVerification verification) {
        ClaimVerificationDTO dto = new ClaimVerificationDTO();
        dto.setVerificationId(verification.getVerificationId());
        dto.setVerificationType(verification.getVerificationType());
        dto.setIsApproved(verification.getIsApproved());
        dto.setComments(verification.getComments());
        dto.setVerifiedAt(verification.getVerifiedAt());
        dto.setVerifierId(verification.getVerifier() != null ? verification.getVerifier().getUserId() : null);
        return dto;
    }

}