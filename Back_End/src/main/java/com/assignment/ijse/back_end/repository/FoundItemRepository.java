package com.assignment.ijse.back_end.repository;

import com.assignment.ijse.back_end.entity.FoundItem;
import com.assignment.ijse.back_end.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoundItemRepository extends JpaRepository<FoundItem, Long> {

    List<FoundItem> findByIsActiveTrue();

    List<FoundItem> findByFinder(User owner);

    List<FoundItem> findByFinderUserIdAndIsActiveTrue(Long userId);

    List<FoundItem> findByIsClaimed(Boolean isClaimed);

    List<FoundItem> findByItemNameContainingIgnoreCase(String itemName);

    List<FoundItem> findByLocationFoundContainingIgnoreCase(String locationLost);

    @Modifying
    @Transactional
    @Query("UPDATE FoundItem f SET f.isActive = false WHERE f.id = :id")
    void deactivateFoundItem(@Param("id") Long id);

}
