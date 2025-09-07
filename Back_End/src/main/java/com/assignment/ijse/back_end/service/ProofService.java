package com.assignment.ijse.back_end.service;

import com.assignment.ijse.back_end.dto.ProofDTO;

import java.util.List;
import java.util.Optional;

public interface ProofService {

    ProofDTO createProof(ProofDTO dto);

    Optional<ProofDTO> getProofById(Long id);

    List<ProofDTO> getProofsByClaim(Long claimId);

    ProofDTO updateProof(Long proofId, String filePath, String description);

    boolean deleteProof(Long id);
}
