package com.assignment.ijse.back_end.controller;

import com.assignment.ijse.back_end.dto.ClaimDTO;
import com.assignment.ijse.back_end.dto.ProofDTO;
import com.assignment.ijse.back_end.entity.enums.ClaimStatus;
import com.assignment.ijse.back_end.entity.enums.DeleteResult;
import com.assignment.ijse.back_end.entity.enums.ExchangeMethod;
import com.assignment.ijse.back_end.service.ClaimService;
import com.assignment.ijse.back_end.service.ImgBBUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/claimright/claim-respond")
@RequiredArgsConstructor
@Slf4j
public class ClaimRespondController {
    private final ClaimService claimService;
    private final ImgBBUploadService imgBBUploadService;

    // ---------------- Create Claim ----------------
    @PostMapping("/create")
    public ResponseEntity<ClaimDTO> createClaim(
            @RequestPart("claim") ClaimDTO claimDTO,
            @RequestPart(value = "proofFiles", required = false) MultipartFile[] proofFiles,
            @RequestParam(value = "proofDescription", required = false) String proofDescription) {

        log.info("Creating claim: {}", claimDTO);

        List<ProofDTO> proofs = new ArrayList<>();

        // Add description as a separate ProofDTO
        if (proofDescription != null && !proofDescription.trim().isEmpty()) {
            ProofDTO descProof = new ProofDTO();
            descProof.setDescription(proofDescription.trim());
            descProof.setUploadedAt(null); // service will set timestamp
            proofs.add(descProof);
        }

        // Add each image as a separate ProofDTO with file URL
        if (proofFiles != null && proofFiles.length > 0) {
            for (MultipartFile file : proofFiles) {
                if (!file.isEmpty()) {
                    try {
                        byte[] bytes = file.getBytes();
                        String filename = file.getOriginalFilename();
                        String fileUrl = imgBBUploadService.uploadToImgBB(bytes, filename).block();

                        ProofDTO fileProof = new ProofDTO();
                        fileProof.setFilePath(fileUrl);
                        fileProof.setUploadedAt(null); // service will set timestamp
                        proofs.add(fileProof);

                    } catch (IOException e) {
                        log.error("Failed to read proof file", e);
                        throw new RuntimeException("Failed to read proof file", e);
                    }
                }
            }
        }
        // Set all proofs to the claim
        claimDTO.setProofs(proofs);

        ClaimDTO savedClaim = claimService.createClaim(claimDTO);
        return ResponseEntity.ok(savedClaim);
    }


    // ---------------- Update Claim Status ----------------
    @PatchMapping("/update-status/{claimId}")
    public ResponseEntity<ClaimDTO> updateClaimStatus(
            @PathVariable Long claimId,
            @RequestParam("status") ClaimStatus status) {

        ClaimDTO updated = claimService.updateClaimStatus(claimId, status);
        return ResponseEntity.ok(updated);
    }

    // ---------------- Set Exchange Method ----------------
    @PatchMapping("/set-exchange/{claimId}")
    public ResponseEntity<ClaimDTO> setExchangeMethod(
            @PathVariable Long claimId,
            @RequestParam("method") ExchangeMethod method,
            @RequestParam(value = "details", required = false) String details) {

        ClaimDTO updated = claimService.setExchangeMethod(claimId, method, details);
        return ResponseEntity.ok(updated);
    }

    // ---------------- Mark Claim as Completed ----------------
    @PatchMapping("/complete/{claimId}")
    public ResponseEntity<ClaimDTO> markAsCompleted(@PathVariable Long claimId) {
        ClaimDTO completed = claimService.markAsCompleted(claimId);
        return ResponseEntity.ok(completed);
    }

    // ---------------- Get Claims ----------------
    @GetMapping("/{claimId}")
    public ResponseEntity<ClaimDTO> getClaimById(@PathVariable Long claimId) {
        return claimService.getClaimById(claimId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    public ResponseEntity<List<ClaimDTO>> getAllClaims() {
        List<ClaimDTO> claims = claimService.getAllClaims();
        return ResponseEntity.ok(claims);
    }

    @GetMapping("/claimant/{userId}")
    public ResponseEntity<List<ClaimDTO>> getClaimsByClaimant(@PathVariable Long userId) {
        List<ClaimDTO> claims = claimService.getClaimsByClaimant(userId);
        return ResponseEntity.ok(claims);
    }

    @GetMapping("/found-item/{foundItemId}")
    public ResponseEntity<List<ClaimDTO>> getClaimsByFoundItem(@PathVariable Long foundItemId) {
        List<ClaimDTO> claims = claimService.getClaimsByFoundItem(foundItemId);
        return ResponseEntity.ok(claims);
    }

    @GetMapping("/lost-item/{lostItemId}")
    public ResponseEntity<List<ClaimDTO>> getClaimsByLostItem(@PathVariable Long lostItemId) {
        List<ClaimDTO> claims = claimService.getClaimsByLostItem(lostItemId);
        return ResponseEntity.ok(claims);
    }

    // ---------------- Delete Claim ----------------
    @DeleteMapping("/{claimId}")
    public ResponseEntity<Void> deleteClaim(@PathVariable Long claimId) {
        DeleteResult result = claimService.deleteClaim(claimId);

        return switch (result) {
            case NOT_FOUND -> ResponseEntity.notFound().build();
            case FORBIDDEN -> ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            case DELETED -> ResponseEntity.noContent().build();
        };
    }

    @PutMapping("/update-verification/{claimId}")
    public ResponseEntity<ClaimDTO> updateVerificationLevel(
            @PathVariable Long claimId,
            @RequestParam String newLevel) {
        ClaimDTO updated = claimService.updateVerificationLevel(claimId, newLevel);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/update-exchange/{claimId}")
    public ResponseEntity<ClaimDTO> updateExchange(
            @PathVariable Long claimId,
            @RequestBody ClaimDTO claimDTO) {

        ClaimDTO updatedClaim = claimService.setExchangeMethod(
                claimId,
                claimDTO.getExchangeMethod(),
                claimDTO.getExchangeDetails()
        );

        return ResponseEntity.ok(updatedClaim);
    }

}
