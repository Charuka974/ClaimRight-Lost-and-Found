package com.assignment.ijse.back_end.service;

import com.assignment.ijse.back_end.dto.LostItemDTO;

import java.util.List;

public interface LostItemService {
    LostItemDTO createLostItem(LostItemDTO lostItemDTO);

    LostItemDTO updateLostItem(Long id, LostItemDTO lostItemDTO);

    boolean deleteLostItem(Long id);

    LostItemDTO getLostItemById(Long id);

    List<LostItemDTO> getAllLostItems();

    List<LostItemDTO> getLostItemsByOwner(Long ownerId);

    List<LostItemDTO> searchLostItems(String keyword);

    LostItemDTO markAsClaimed(Long id);

    boolean disableLostItem(Long id);

    void deleteExpiredItems();

}
