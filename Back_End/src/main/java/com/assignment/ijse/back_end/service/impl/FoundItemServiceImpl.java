package com.assignment.ijse.back_end.service.impl;

import com.assignment.ijse.back_end.dto.FoundItemDTO;
import com.assignment.ijse.back_end.entity.Category;
import com.assignment.ijse.back_end.entity.FoundItem;
import com.assignment.ijse.back_end.entity.User;
import com.assignment.ijse.back_end.repository.FoundItemRepository;
import com.assignment.ijse.back_end.repository.ItemCategoryRepository;
import com.assignment.ijse.back_end.repository.UserRepository;
import com.assignment.ijse.back_end.service.FoundItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FoundItemServiceImpl implements FoundItemService {

    private final FoundItemRepository foundItemRepository;
    private final UserRepository userRepository;
    private final ItemCategoryRepository categoryRepository;

    // -------------------- CREATE --------------------
    @Override
    public FoundItemDTO createFoundItem(FoundItemDTO dto) {
        dto.setPostedAt(LocalDateTime.now());
        FoundItem entity = mapToEntity(dto);
        FoundItem saved = foundItemRepository.save(entity);
        return mapToDTO(saved);
    }

    // -------------------- UPDATE --------------------
    @Override
    public FoundItemDTO updateFoundItem(Long id, FoundItemDTO dto) {
        return foundItemRepository.findById(id)
                .map(existing -> {
                    existing.setItemName(dto.getItemName());
                    existing.setGeneralDescription(dto.getGeneralDescription());

                    // Only update image if a new one is provided
                    if (dto.getImageUrl() != null) {
                        existing.setImageUrl(dto.getImageUrl());
                    }

                    existing.setDateFound(dto.getDateFound());
                    existing.setLocationFound(dto.getLocationFound());
                    existing.setPrivateIdentifierHint(dto.getPrivateIdentifierHint());

                    if (dto.getFinderId() != null) {
                        userRepository.findById(dto.getFinderId()).ifPresent(existing::setFinder);
                    }

                    if (dto.getCategoryIds() != null) {
                        List<Category> categories = categoryRepository.findAllById(dto.getCategoryIds());
                        existing.setCategories(categories);
                    }

                    existing.setIsClaimed(dto.getIsClaimed());
                    return mapToDTO(foundItemRepository.save(existing));
                })
                .orElse(null);
    }


    // -------------------- DELETE --------------------
    @Override
    public boolean deleteFoundItem(Long id) {
        if (foundItemRepository.existsById(id)) {
            foundItemRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public boolean disableFoundItem(Long id) {
        if (foundItemRepository.existsById(id)) {
            foundItemRepository.deactivateFoundItem(id);
            return true;
        }
        return false;
    }

    // -------------------- READ --------------------
    @Override
    public FoundItemDTO getFoundItemById(Long id) {
        return foundItemRepository.findById(id)
                .map(this::mapToDTO)
                .orElse(null);
    }

    @Override
    public List<FoundItemDTO> getAllFoundItems() {
        return foundItemRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FoundItemDTO> getFoundItemsByFinder(Long finderId) {
        return foundItemRepository.findByFinderUserIdAndIsActiveTrue(finderId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FoundItemDTO> searchFoundItems(String keyword) {
        // search in both itemName and location
        List<FoundItem> byName = foundItemRepository.findByItemNameContainingIgnoreCase(keyword);
        List<FoundItem> byLocation = foundItemRepository.findByLocationFoundContainingIgnoreCase(keyword);

        return List.of(byName, byLocation).stream()
                .flatMap(List::stream)
                .distinct()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // -------------------- CLAIM --------------------
    @Override
    public FoundItemDTO markAsClaimed(Long id) {
        return foundItemRepository.findById(id)
                .map(foundItem -> {
                    foundItem.setIsClaimed(true);
                    return mapToDTO(foundItemRepository.save(foundItem));
                })
                .orElse(null);
    }

    // -------------------- MAPPER --------------------
    private FoundItem mapToEntity(FoundItemDTO dto) {
        User finder = null;
        if (dto.getFinderId() != null) {
            finder = userRepository.findById(dto.getFinderId()).orElse(null);
        }

        List<Category> categories = null;
        if (dto.getCategoryIds() != null) {
            categories = categoryRepository.findAllById(dto.getCategoryIds());
        }

        return FoundItem.builder()
                .id(dto.getId())
                .itemName(dto.getItemName())
                .generalDescription(dto.getGeneralDescription())
                .imageUrl(dto.getImageUrl())
                .dateFound(dto.getDateFound())
                .locationFound(dto.getLocationFound())
                .privateIdentifierHint(dto.getPrivateIdentifierHint())
                .finder(finder)
                .postedAt(dto.getPostedAt())
                .categories(categories)
                .isClaimed(dto.getIsClaimed() != null ? dto.getIsClaimed() : false)
                .isActive(true) // New items are active by default
                .build();
    }

    private FoundItemDTO mapToDTO(FoundItem entity) {
        return FoundItemDTO.builder()
                .id(entity.getId())
                .itemName(entity.getItemName())
                .generalDescription(entity.getGeneralDescription())
                .imageUrl(entity.getImageUrl())
                .dateFound(entity.getDateFound())
                .locationFound(entity.getLocationFound())
                .privateIdentifierHint(entity.getPrivateIdentifierHint())
                .finderId(entity.getFinder() != null ? entity.getFinder().getUserId() : null)
                .finderName(entity.getFinder() != null ? entity.getFinder().getUsername() : null)
                .postedAt(entity.getPostedAt())
                .categoryIds(entity.getCategories() != null ?
                        entity.getCategories().stream().map(Category::getCategoryId).toList() : null)
                .categoryNames(entity.getCategories() != null ?
                        entity.getCategories().stream().map(Category::getName).toList() : null)
                .isClaimed(entity.getIsClaimed())
                .isActive(entity.getIsActive())
                .build();
    }

    public void deleteExpiredItems() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        foundItemRepository.deleteExpiredItems(cutoffDate);
    }

}