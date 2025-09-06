package com.assignment.ijse.back_end.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LostItemDTO {

    private Long id;
    private String itemName;
    private String detailedDescription;
    private String imageUrl;
    private LocalDateTime dateLost;
    private String locationLost;

    private Long ownerId;      // Only store owner's ID to avoid sending full User entity
    private String ownerName;  // Optional — to show name without fetching whole User

    private LocalDateTime postedAt;

    private List<Long> categoryIds;   // Store category IDs instead of full Category objects
    private List<String> categoryNames; // Optional — for UI display

    private Boolean isClaimed;

    private Boolean isActive;

    private Double reward; // Changed to Double for simplicity in DTO
    private Integer priority; // 0 = low, 1 = medium, 2 = high
}