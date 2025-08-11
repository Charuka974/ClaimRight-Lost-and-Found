package com.assignment.ijse.back_end.repository;

import com.assignment.ijse.back_end.entity.FoundItem;
import com.assignment.ijse.back_end.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoundItemRepository extends JpaRepository<FoundItem, Long> {
    List<FoundItem> findByFinder(User owner);

    List<FoundItem> findByIsClaimed(Boolean isClaimed);

    List<FoundItem> findByItemNameContainingIgnoreCase(String itemName);

    List<FoundItem> findByLocationFoundContainingIgnoreCase(String locationLost);

}
