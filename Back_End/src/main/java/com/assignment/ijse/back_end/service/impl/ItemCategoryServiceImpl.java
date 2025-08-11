package com.assignment.ijse.back_end.service.impl;

import com.assignment.ijse.back_end.dto.ItemCategoryDTO;
import com.assignment.ijse.back_end.entity.Category;
import com.assignment.ijse.back_end.repository.ItemCategoryRepository;
import com.assignment.ijse.back_end.service.ItemCategoryService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemCategoryServiceImpl implements ItemCategoryService {
    private final ItemCategoryRepository categoryRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<ItemCategoryDTO> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ItemCategoryDTO getCategoryById(Long id) {
        Optional<Category> categoryOpt = categoryRepository.findById(id);
        return categoryOpt.map(this::toDTO).orElse(null);
    }

    @Override
    public ItemCategoryDTO saveCategory(ItemCategoryDTO categoryDto) {
        Category category;

        if (categoryDto.getCategoryId() != null) {
            // Update existing
            Optional<Category> existingOpt = categoryRepository.findById(categoryDto.getCategoryId());
            if (existingOpt.isPresent()) {
                category = existingOpt.get();
                // Map updated fields from DTO to existing entity (ignore id)
                modelMapper.map(categoryDto, category);
            } else {
                // Not found, treat as new
                category = toEntity(categoryDto);
            }
        } else {
            // Create new
            category = toEntity(categoryDto);
        }

        Category savedCategory = categoryRepository.save(category);
        return toDTO(savedCategory);
    }

    @Override
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    // Use ModelMapper for conversions
    private ItemCategoryDTO toDTO(Category category) {
        return modelMapper.map(category, ItemCategoryDTO.class);
    }

    private Category toEntity(ItemCategoryDTO dto) {
        return modelMapper.map(dto, Category.class);
    }

}
