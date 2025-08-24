package com.assignment.ijse.back_end.repository;

import com.assignment.ijse.back_end.entity.LostItem;
import com.assignment.ijse.back_end.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LostItemRepository extends JpaRepository<LostItem, Long> {
    List<LostItem> findByIsActiveTrue();

    List<LostItem> findByOwner(User owner);

    List<LostItem> findByIsClaimed(Boolean isClaimed);

    List<LostItem> findByItemNameContainingIgnoreCase(String itemName);

    List<LostItem> findByLocationLostContainingIgnoreCase(String locationLost);

    List<LostItem> findByOwnerUserId(Long ownerId);

    List<LostItem> findByOwnerUserIdAndIsActiveTrue(Long ownerId);


    List<LostItem> findByItemNameContainingIgnoreCaseOrDetailedDescriptionContainingIgnoreCase(String name, String description);

    @Modifying
    @Transactional
    @Query("UPDATE LostItem l SET l.isActive = false WHERE l.id = :id")
    void deactivateLostItem(@Param("id") Long id);

}
