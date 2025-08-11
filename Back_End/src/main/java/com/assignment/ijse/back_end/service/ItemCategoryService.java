package com.assignment.ijse.back_end.service;

import com.assignment.ijse.back_end.dto.ItemCategoryDTO;

import java.util.List;

public interface ItemCategoryService {
    List<ItemCategoryDTO> getAllCategories();
    ItemCategoryDTO getCategoryById(Long id);
    ItemCategoryDTO saveCategory(ItemCategoryDTO categoryDto);
    void deleteCategory(Long id);

}
