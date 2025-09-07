package com.assignment.ijse.back_end.service.impl;

import com.assignment.ijse.back_end.dto.ClaimVerificationDTO;
import com.assignment.ijse.back_end.entity.Claim;
import com.assignment.ijse.back_end.entity.ClaimVerification;
import com.assignment.ijse.back_end.entity.User;
import com.assignment.ijse.back_end.repository.ClaimRepository;
import com.assignment.ijse.back_end.repository.ClaimVerificationRepository;
import com.assignment.ijse.back_end.repository.UserRepository;
import com.assignment.ijse.back_end.service.ClaimVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClaimVerificationServiceImpl implements ClaimVerificationService {

    private final ClaimVerificationRepository verificationRepository;
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;

    @Override
    public ClaimVerificationDTO createVerification(ClaimVerificationDTO dto) {
        ClaimVerification verification = new ClaimVerification();

        verification.setVerificationType(dto.getVerificationType());
        verification.setIsApproved(dto.getIsApproved());
        verification.setComments(dto.getComments());
        verification.setVerifiedAt(dto.getVerifiedAt() != null ? dto.getVerifiedAt() : LocalDateTime.now());

        if (dto.getClaimId() != null) {
            Claim claim = claimRepository.findById(dto.getClaimId())
                    .orElseThrow(() -> new RuntimeException("Claim not found"));
            verification.setClaim(claim);
        }

        if (dto.getVerifierId() != null) {
            User verifier = userRepository.findById(dto.getVerifierId())
                    .orElseThrow(() -> new RuntimeException("Verifier not found"));
            verification.setVerifier(verifier);
        }

        ClaimVerification saved = verificationRepository.save(verification);
        return mapToDTO(saved);
    }

    @Override
    public Optional<ClaimVerificationDTO> getVerificationById(Long id) {
        return verificationRepository.findById(id).map(this::mapToDTO);
    }

    @Override
    public List<ClaimVerificationDTO> getVerificationsByClaim(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        return verificationRepository.findByClaim(claim).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClaimVerificationDTO> getVerificationsByVerifier(Long verifierId) {
        User verifier = userRepository.findById(verifierId)
                .orElseThrow(() -> new RuntimeException("Verifier not found"));
        return verificationRepository.findByVerifier(verifier).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ClaimVerificationDTO updateVerificationStatus(Long verificationId, Boolean isApproved, String comments) {
        ClaimVerification verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new RuntimeException("Verification not found"));

        verification.setIsApproved(isApproved);
        verification.setComments(comments);
        verification.setVerifiedAt(LocalDateTime.now());

        return mapToDTO(verificationRepository.save(verification));
    }

    @Override
    public boolean deleteVerification(Long id) {
        if (verificationRepository.existsById(id)) {
            verificationRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private ClaimVerificationDTO mapToDTO(ClaimVerification verification) {
        ClaimVerificationDTO dto = new ClaimVerificationDTO();
        dto.setVerificationId(verification.getVerificationId());
        dto.setVerificationType(verification.getVerificationType());
        dto.setIsApproved(verification.getIsApproved());
        dto.setComments(verification.getComments());
        dto.setVerifiedAt(verification.getVerifiedAt());
        dto.setClaimId(verification.getClaim() != null ? verification.getClaim().getClaimId() : null);
        dto.setVerifierId(verification.getVerifier() != null ? verification.getVerifier().getUserId() : null);
        return dto;
    }

}
