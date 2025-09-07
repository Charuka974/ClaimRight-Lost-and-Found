package com.assignment.ijse.back_end.service.impl;

import com.assignment.ijse.back_end.dto.ProofDTO;
import com.assignment.ijse.back_end.entity.Claim;
import com.assignment.ijse.back_end.entity.Proof;
import com.assignment.ijse.back_end.repository.ClaimRepository;
import com.assignment.ijse.back_end.repository.ProofRepository;
import com.assignment.ijse.back_end.service.ProofService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProofServiceImpl implements ProofService {

    private final ProofRepository proofRepository;
    private final ClaimRepository claimRepository;

    @Override
    public ProofDTO createProof(ProofDTO dto) {
        Proof proof = new Proof();
        proof.setFilePath(dto.getFilePath());
        proof.setDescription(dto.getDescription());
        proof.setUploadedAt(dto.getUploadedAt() != null ? dto.getUploadedAt() : LocalDateTime.now());

        if (dto.getClaimId() != null) {
            Claim claim = claimRepository.findById(dto.getClaimId())
                    .orElseThrow(() -> new RuntimeException("Claim not found"));
            proof.setClaim(claim);
        }

        Proof saved = proofRepository.save(proof);
        return mapToDTO(saved);
    }

    @Override
    public Optional<ProofDTO> getProofById(Long id) {
        return proofRepository.findById(id).map(this::mapToDTO);
    }

    @Override
    public List<ProofDTO> getProofsByClaim(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        return proofRepository.findByClaim(claim).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProofDTO updateProof(Long proofId, String filePath, String description) {
        Proof proof = proofRepository.findById(proofId)
                .orElseThrow(() -> new RuntimeException("Proof not found"));

        if (filePath != null) proof.setFilePath(filePath);
        if (description != null) proof.setDescription(description);

        return mapToDTO(proofRepository.save(proof));
    }

    @Override
    public boolean deleteProof(Long id) {
        if (proofRepository.existsById(id)) {
            proofRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private ProofDTO mapToDTO(Proof proof) {
        ProofDTO dto = new ProofDTO();
        dto.setProofId(proof.getProofId());
        dto.setFilePath(proof.getFilePath());
        dto.setDescription(proof.getDescription());
        dto.setUploadedAt(proof.getUploadedAt());
        dto.setClaimId(proof.getClaim() != null ? proof.getClaim().getClaimId() : null);
        return dto;
    }

}
