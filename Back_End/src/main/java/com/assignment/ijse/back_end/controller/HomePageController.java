package com.assignment.ijse.back_end.controller;

import com.assignment.ijse.back_end.dto.ClaimViewDTO;
import com.assignment.ijse.back_end.dto.FoundItemDTO;
import com.assignment.ijse.back_end.dto.ItemCategoryDTO;
import com.assignment.ijse.back_end.dto.LostItemDTO;
import com.assignment.ijse.back_end.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/claimright-landing-page")
@RequiredArgsConstructor
@Slf4j
public class HomePageController {

    private final LostItemService lostItemService;
    private final FoundItemService foundItemService;
    private final ItemCategoryService categoryService;


    @GetMapping("/lost")
    public ResponseEntity<List<LostItemDTO>> getAllLostItems() {
        List<LostItemDTO> lostItems = lostItemService.getAllLostItems();
        return ResponseEntity.ok(lostItems);
    }

    @GetMapping("/found")
    public ResponseEntity<List<FoundItemDTO>> getAllFoundItems() {
        List<FoundItemDTO> foundItems = foundItemService.getAllFoundItems();
        return ResponseEntity.ok(foundItems);
    }

    @GetMapping("/category")
    public ResponseEntity<List<ItemCategoryDTO>> getAllCategories() {
        log.info("Fetching all categories");
        List<ItemCategoryDTO> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }


}
