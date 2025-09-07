package com.assignment.ijse.back_end.repository;

import com.assignment.ijse.back_end.entity.Claim;
import com.assignment.ijse.back_end.entity.ClaimVerification;
import com.assignment.ijse.back_end.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClaimVerificationRepository extends JpaRepository<ClaimVerification, Long> {
    List<ClaimVerification> findByClaim(Claim claim);

    List<ClaimVerification> findByVerifier(User verifier);

    List<ClaimVerification> findByIsApproved(Boolean isApproved);
}
