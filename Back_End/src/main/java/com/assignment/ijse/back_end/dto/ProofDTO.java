package com.assignment.ijse.back_end.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProofDTO {

    private Long proofId;
    private String filePath;
    private String description;
    private LocalDateTime uploadedAt;
    private Long claimId;

}
