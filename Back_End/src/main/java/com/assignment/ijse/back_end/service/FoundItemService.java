package com.assignment.ijse.back_end.service;

import com.assignment.ijse.back_end.dto.FoundItemDTO;

import java.util.List;

public interface FoundItemService {
    FoundItemDTO createFoundItem(FoundItemDTO lostItemDTO);

    FoundItemDTO updateFoundItem(Long id, FoundItemDTO lostItemDTO);

    boolean deleteFoundItem(Long id);

    boolean disableFoundItem(Long id);

    FoundItemDTO getFoundItemById(Long id);

    List<FoundItemDTO> getAllFoundItems();

    List<FoundItemDTO> getFoundItemsByFinder(Long finderId);

    List<FoundItemDTO> searchFoundItems(String keyword);

    FoundItemDTO markAsClaimed(Long id);

    void deleteExpiredItems();

}
