package com.assignment.ijse.back_end.service.impl;

import com.assignment.ijse.back_end.dto.LostItemDTO;
import com.assignment.ijse.back_end.entity.Category;
import com.assignment.ijse.back_end.entity.LostItem;
import com.assignment.ijse.back_end.entity.User;
import com.assignment.ijse.back_end.repository.ItemCategoryRepository;
import com.assignment.ijse.back_end.repository.LostItemRepository;
import com.assignment.ijse.back_end.repository.UserRepository;
import com.assignment.ijse.back_end.service.LostItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LostItemServiceImpl implements LostItemService {

    private final LostItemRepository lostItemRepository;
    private final UserRepository userRepository; // For linking owner
    private final ItemCategoryRepository categoryRepository; // For handling categories

    @Override
    public LostItemDTO createLostItem(LostItemDTO lostItemDTO) {
        LostItem lostItem = mapToEntity(lostItemDTO);
        // Set owner if provided
        if (lostItemDTO.getOwnerId() != null) {
            User owner = userRepository.findById(lostItemDTO.getOwnerId())
                    .orElseThrow(() -> new RuntimeException("Owner not found"));
            lostItem.setOwner(owner);
        }

        return mapToDTO(lostItemRepository.save(lostItem));
    }

    @Override
    public LostItemDTO updateLostItem(Long id, LostItemDTO lostItemDTO) {
        LostItem existing = lostItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lost item not found"));

        // Update basic fields
        existing.setItemName(lostItemDTO.getItemName());
        existing.setDetailedDescription(lostItemDTO.getDetailedDescription());
        existing.setDateLost(lostItemDTO.getDateLost());
        existing.setLocationLost(lostItemDTO.getLocationLost());
        existing.setReward(lostItemDTO.getReward() != null ? java.math.BigDecimal.valueOf(lostItemDTO.getReward()) : null);

        // Update claimed status if provided
        if (lostItemDTO.getIsClaimed() != null) {
            existing.setIsClaimed(lostItemDTO.getIsClaimed());
        }

        // Update image only if new URL provided
        if (lostItemDTO.getImageUrl() != null) {
            existing.setImageUrl(lostItemDTO.getImageUrl());
        }

        // Update categories if provided
        if (lostItemDTO.getCategoryIds() != null) {
            List<Category> categories = categoryRepository.findAllById(lostItemDTO.getCategoryIds());
            existing.setCategories(categories);
        }

        // Update owner if provided
        if (lostItemDTO.getOwnerId() != null) {
            User owner = userRepository.findById(lostItemDTO.getOwnerId())
                    .orElseThrow(() -> new RuntimeException("Owner not found"));
            existing.setOwner(owner);
        }
        return mapToDTO(lostItemRepository.save(existing));
    }

    @Override
    public boolean deleteLostItem(Long id) {
        if (lostItemRepository.existsById(id)) {
            lostItemRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public boolean disableLostItem(Long id) {
        if (lostItemRepository.existsById(id)) {
            lostItemRepository.deactivateLostItem(id);
            return true;
        }
        return false;
    }

    @Override
    public LostItemDTO getLostItemById(Long id) {
        return lostItemRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Lost item not found"));
    }

    @Override
    public List<LostItemDTO> getAllLostItems() {
        return lostItemRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LostItemDTO> getLostItemsByOwner(Long ownerId) {
        return lostItemRepository.findByOwnerUserIdAndIsActiveTrue(ownerId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LostItemDTO> searchLostItems(String keyword) {
        return lostItemRepository.findByItemNameContainingIgnoreCaseOrDetailedDescriptionContainingIgnoreCase(keyword, keyword)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public LostItemDTO updateReward(Long id, Double reward) {
        LostItem existingItem = lostItemRepository.findById(id).orElse(null);
        if (existingItem == null) return null;

        existingItem.setReward(BigDecimal.valueOf(reward)); // only update reward
        lostItemRepository.save(existingItem);

        return mapToDTO(existingItem);
    }


    @Override
    public LostItemDTO markAsClaimed(Long id) {
        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lost item not found"));
        item.setIsClaimed(true);
        return mapToDTO(lostItemRepository.save(item));
    }

    private LostItemDTO mapToDTO(LostItem entity) {
        return LostItemDTO.builder()
                .id(entity.getId())
                .itemName(entity.getItemName())
                .detailedDescription(entity.getDetailedDescription())
                .imageUrl(entity.getImageUrl())
                .dateLost(entity.getDateLost())
                .locationLost(entity.getLocationLost())
                .ownerId(entity.getOwner() != null ? entity.getOwner().getUserId() : null)
                .ownerName(entity.getOwner() != null ? entity.getOwner().getUsername() : null)
                .postedAt(entity.getPostedAt())
                .categoryIds(entity.getCategories() != null
                        ? entity.getCategories().stream().map(Category::getCategoryId).collect(Collectors.toList())
                        : List.of())
                .categoryNames(entity.getCategories() != null
                        ? entity.getCategories().stream().map(Category::getName).collect(Collectors.toList())
                        : List.of())
                .isClaimed(entity.getIsClaimed())
                .isActive(entity.getIsActive())
                .reward(entity.getReward() != null ? entity.getReward().doubleValue() : null)
                .priority(entity.getPriority())
                .build();
    }

    private LostItem mapToEntity(LostItemDTO dto) {
        LostItem lostItem = LostItem.builder()
                .id(dto.getId())
                .itemName(dto.getItemName())
                .detailedDescription(dto.getDetailedDescription())
                .imageUrl(dto.getImageUrl())
                .dateLost(dto.getDateLost())
                .locationLost(dto.getLocationLost())
                .isClaimed(dto.getIsClaimed() != null ? dto.getIsClaimed() : false)
                .isActive(true) // New items are active by default
                .reward(dto.getReward() != null ? java.math.BigDecimal.valueOf(dto.getReward()) : null)
                .priority(dto.getPriority() != null ? dto.getPriority() : 0)
                .build();

        // Map category IDs to actual Category entities if provided
        if (dto.getCategoryIds() != null) {
            lostItem.setCategories(
                    categoryRepository.findAllById(dto.getCategoryIds())
            );
        }

        return lostItem;
    }

    public void deleteExpiredItems() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        lostItemRepository.deleteExpiredItems(cutoffDate);
    }

}