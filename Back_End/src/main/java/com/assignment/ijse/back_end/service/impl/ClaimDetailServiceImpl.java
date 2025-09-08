package com.assignment.ijse.back_end.service.impl;

import com.assignment.ijse.back_end.dto.ClaimDTO;
import com.assignment.ijse.back_end.dto.ClaimVerificationDTO;
import com.assignment.ijse.back_end.dto.ClaimViewDTO;
import com.assignment.ijse.back_end.entity.Claim;
import com.assignment.ijse.back_end.entity.FoundItem;
import com.assignment.ijse.back_end.entity.LostItem;
import com.assignment.ijse.back_end.entity.User;
import com.assignment.ijse.back_end.repository.*;
import com.assignment.ijse.back_end.service.ClaimDetailService;
import com.assignment.ijse.back_end.service.ProofService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ClaimDetailServiceImpl implements ClaimDetailService {

    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;
    private final FoundItemRepository foundItemRepository;
    private final LostItemRepository lostItemRepository;
    private final ProofRepository proofRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ClaimViewDTO> getClaimsForUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Fetch all claims directly from repositories
        List<Claim> madeClaims = claimRepository.findByClaimant(user);
        List<Claim> receivedLostClaims = claimRepository.findByLostItemOwnerId(userId);
        List<Claim> receivedFoundClaims = claimRepository.findByFoundItemFinderId(userId);

        // Combine all claims without duplicates
        List<Claim> allClaims = Stream.of(madeClaims, receivedLostClaims, receivedFoundClaims)
                .flatMap(List::stream)
                .distinct()
                .collect(Collectors.toList());

        return allClaims.stream().map(claim -> {
            ClaimViewDTO viewDTO = new ClaimViewDTO();

            // Basic claim info
            viewDTO.setClaimId(claim.getClaimId());
            viewDTO.setClaimType(claim.getClaimType());
            viewDTO.setClaimStatus(claim.getClaimStatus());
            viewDTO.setVerificationLevel(claim.getVerificationLevel());
            viewDTO.setCreatedAt(claim.getCreatedAt());
            viewDTO.setExchangeMethod(claim.getExchangeMethod());
            viewDTO.setExchangeDetails(claim.getExchangeDetails());

            // Claimant info
            if (claim.getClaimant() != null) {
                viewDTO.setClaimantId(claim.getClaimant().getUserId());
                viewDTO.setClaimantName(claim.getClaimant().getUsername());
            }

            // Found item mapping
            if (claim.getFoundItem() != null) {
                FoundItem found = claim.getFoundItem();
                viewDTO.setRecipientId(found.getFinder().getUserId());
                viewDTO.setRecipientName(found.getFinder().getUsername());
                viewDTO.setItemId(found.getId());
                viewDTO.setItemName(found.getItemName());
                viewDTO.setItemDescription(found.getGeneralDescription());
                viewDTO.setItemImageUrl(found.getImageUrl());
                viewDTO.setItemDate(found.getDateFound());
                viewDTO.setItemLocation(found.getLocationFound());
                viewDTO.setItemCategoryNames(found.getCategories()
                        .stream().map(c -> c.getName()).toList());
                viewDTO.setItemIsClaimed(found.getIsClaimed());
                viewDTO.setItemIsActive(found.getIsActive());
            }

            // Lost item mapping
            if (claim.getLostItem() != null) {
                LostItem lost = claim.getLostItem();
                viewDTO.setRecipientId(lost.getOwner().getUserId());
                viewDTO.setRecipientName(lost.getOwner().getUsername());
                viewDTO.setItemId(lost.getId());
                viewDTO.setItemName(lost.getItemName());
                viewDTO.setItemDescription(lost.getDetailedDescription());
                viewDTO.setItemImageUrl(lost.getImageUrl());
                viewDTO.setItemDate(lost.getDateLost());
                viewDTO.setItemLocation(lost.getLocationLost());
                viewDTO.setItemCategoryNames(lost.getCategories()
                        .stream().map(c -> c.getName()).toList());
                viewDTO.setItemIsClaimed(lost.getIsClaimed());
                viewDTO.setItemIsActive(lost.getIsActive());
            }

            // Attach proofs directly from repository
            viewDTO.setProofs(proofRepository.findByClaim(claim)
                    .stream()
                    .map(proof -> {
                        var dto = new com.assignment.ijse.back_end.dto.ProofDTO();
                        dto.setProofId(proof.getProofId());
                        dto.setFilePath(proof.getFilePath());
                        dto.setDescription(proof.getDescription());
                        dto.setUploadedAt(proof.getUploadedAt());
                        dto.setClaimId(claim.getClaimId());
                        return dto;
                    }).toList()
            );

            // Attach verifications
            viewDTO.setVerifications(claim.getVerifications()
                    .stream()
                    .map(v -> {
                        var dto = new ClaimVerificationDTO();
                        dto.setVerificationId(v.getVerificationId());
                        dto.setVerificationType(v.getVerificationType());
                        dto.setIsApproved(v.getIsApproved());
                        dto.setComments(v.getComments());
                        dto.setVerifiedAt(v.getVerifiedAt());
                        if (v.getVerifier() != null) dto.setVerifierId(v.getVerifier().getUserId());
                        return dto;
                    }).toList()
            );

            return viewDTO;
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClaimViewDTO> getAllClaims() {

        List<Claim> allClaims = claimRepository.findAll();

        return allClaims.stream().map(claim -> {
            ClaimViewDTO viewDTO = new ClaimViewDTO();

            // Basic claim info
            viewDTO.setClaimId(claim.getClaimId());
            viewDTO.setClaimType(claim.getClaimType());
            viewDTO.setClaimStatus(claim.getClaimStatus());
            viewDTO.setVerificationLevel(claim.getVerificationLevel());
            viewDTO.setCreatedAt(claim.getCreatedAt());
            viewDTO.setExchangeMethod(claim.getExchangeMethod());
            viewDTO.setExchangeDetails(claim.getExchangeDetails());

            // Claimant info
            if (claim.getClaimant() != null) {
                viewDTO.setClaimantId(claim.getClaimant().getUserId());
                viewDTO.setClaimantName(claim.getClaimant().getUsername());
            }

            // Found item mapping
            if (claim.getFoundItem() != null) {
                FoundItem found = claim.getFoundItem();
                viewDTO.setRecipientId(found.getFinder().getUserId());
                viewDTO.setRecipientName(found.getFinder().getUsername());
                viewDTO.setItemId(found.getId());
                viewDTO.setItemName(found.getItemName());
                viewDTO.setItemDescription(found.getGeneralDescription());
                viewDTO.setItemImageUrl(found.getImageUrl());
                viewDTO.setItemDate(found.getDateFound());
                viewDTO.setItemLocation(found.getLocationFound());
                viewDTO.setItemCategoryNames(found.getCategories()
                        .stream().map(c -> c.getName()).toList());
                viewDTO.setItemIsClaimed(found.getIsClaimed());
                viewDTO.setItemIsActive(found.getIsActive());
            }

            // Lost item mapping
            if (claim.getLostItem() != null) {
                LostItem lost = claim.getLostItem();
                viewDTO.setRecipientId(lost.getOwner().getUserId());
                viewDTO.setRecipientName(lost.getOwner().getUsername());
                viewDTO.setItemId(lost.getId());
                viewDTO.setItemName(lost.getItemName());
                viewDTO.setItemDescription(lost.getDetailedDescription());
                viewDTO.setItemImageUrl(lost.getImageUrl());
                viewDTO.setItemDate(lost.getDateLost());
                viewDTO.setItemLocation(lost.getLocationLost());
                viewDTO.setItemCategoryNames(lost.getCategories()
                        .stream().map(c -> c.getName()).toList());
                viewDTO.setItemIsClaimed(lost.getIsClaimed());
                viewDTO.setItemIsActive(lost.getIsActive());
            }

            // Attach proofs directly from repository
            viewDTO.setProofs(proofRepository.findByClaim(claim)
                    .stream()
                    .map(proof -> {
                        var dto = new com.assignment.ijse.back_end.dto.ProofDTO();
                        dto.setProofId(proof.getProofId());
                        dto.setFilePath(proof.getFilePath());
                        dto.setDescription(proof.getDescription());
                        dto.setUploadedAt(proof.getUploadedAt());
                        dto.setClaimId(claim.getClaimId());
                        return dto;
                    }).toList()
            );

            // Attach verifications
            viewDTO.setVerifications(claim.getVerifications()
                    .stream()
                    .map(v -> {
                        var dto = new ClaimVerificationDTO();
                        dto.setVerificationId(v.getVerificationId());
                        dto.setVerificationType(v.getVerificationType());
                        dto.setIsApproved(v.getIsApproved());
                        dto.setComments(v.getComments());
                        dto.setVerifiedAt(v.getVerifiedAt());
                        if (v.getVerifier() != null) dto.setVerifierId(v.getVerifier().getUserId());
                        return dto;
                    }).toList()
            );

            return viewDTO;
        }).toList();
    }


}