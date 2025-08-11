package com.assignment.ijse.back_end.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Data
public class ItemCategoryDTO {
    private Long categoryId;
    private String name;
    private String description;
}
