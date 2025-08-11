package com.assignment.ijse.back_end.controller;

import com.assignment.ijse.back_end.dto.ItemCategoryDTO;
import com.assignment.ijse.back_end.service.ItemCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("claimright/item-categories")
@RequiredArgsConstructor
@Slf4j
public class ItemCategoryController {

    private final ItemCategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<ItemCategoryDTO>> getAllCategories() {
        log.info("Fetching all categories");
        List<ItemCategoryDTO> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemCategoryDTO> getCategoryById(@PathVariable Long id) {
        log.info("Fetching category with id: {}", id);
        ItemCategoryDTO category = categoryService.getCategoryById(id);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(category);
    }

    @PostMapping
    public ResponseEntity<ItemCategoryDTO> createCategory(@RequestBody ItemCategoryDTO categoryDto) {
        log.info("Creating new category: {}", categoryDto);
        ItemCategoryDTO savedCategory = categoryService.saveCategory(categoryDto);
        return ResponseEntity.ok(savedCategory);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemCategoryDTO> updateCategory(@PathVariable Long id, @RequestBody ItemCategoryDTO categoryDto) {
        log.info("Updating category with id: {}", id);
        categoryDto.setCategoryId(id);
        ItemCategoryDTO updatedCategory = categoryService.saveCategory(categoryDto);
        return ResponseEntity.ok(updatedCategory);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        log.info("Deleting category with id: {}", id);
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

}
