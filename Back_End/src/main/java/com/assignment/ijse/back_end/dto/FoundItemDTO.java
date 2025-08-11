package com.assignment.ijse.back_end.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoundItemDTO {

    private Long id;
    private String itemName;
    private String generalDescription;
    private String imageUrl;
    private LocalDateTime dateFound;
    private String locationFound;
    private String privateIdentifierHint;

    private Long finderId;      // ID of the finder (User)
    private String finderName;  // Optional — readable name for display

    private LocalDateTime postedAt;

    private List<Long> categoryIds;    // IDs only for linking
    private List<String> categoryNames; // Optional — for front-end display

    private Boolean isClaimed;
}
