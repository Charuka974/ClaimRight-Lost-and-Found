package com.assignment.ijse.back_end.repository;

import com.assignment.ijse.back_end.entity.Claim;
import com.assignment.ijse.back_end.entity.Message;
import com.assignment.ijse.back_end.entity.User;
import com.assignment.ijse.back_end.entity.enums.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByClaimStatus(ClaimStatus status);

    List<Claim> findByClaimant(User claimant);

    List<Claim> findByClaimantUserId(Long userId);

    List<Claim> findByFoundItemId(Long foundItemId);

    List<Claim> findByLostItemId(Long lostItemId);

    List<Claim> findByClaimStatusAndCreatedAtBefore(ClaimStatus status, LocalDateTime beforeDate);

    @Modifying
    @Transactional
    @Query("UPDATE Claim c SET c.verificationLevel = 'DEACTIVATED' WHERE c.claimId = :id")
    void deactivateClaim(@Param("id") Long id);

    // Delete expired or completed claims older than a cutoff date
    @Modifying
    @Transactional
    @Query("DELETE FROM Claim c WHERE c.claimStatus = 'COMPLETED' AND c.createdAt <= :cutoffDate")
    void deleteExpiredClaims(@Param("cutoffDate") LocalDateTime cutoffDate);



    // Claims received by user as owner of lost item
    @Query("SELECT c FROM Claim c WHERE c.lostItem.owner.userId = :userId")
    List<Claim> findByLostItemOwnerId(@Param("userId") Long userId);

    // Claims received by user as finder of found item
    @Query("SELECT c FROM Claim c WHERE c.foundItem.finder.userId = :userId")
    List<Claim> findByFoundItemFinderId(@Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("UPDATE Claim c SET c.isActive = false WHERE c.claimId = :id")
    void deactivateClaimById(@Param("id") Long id);

    @Modifying
    @Transactional
    @Query("UPDATE Claim c SET c.verificationLevel = :newLevel WHERE c.claimId = :id")
    void updateVerificationLevel(@Param("id") Long id, @Param("newLevel") String newLevel);



}
