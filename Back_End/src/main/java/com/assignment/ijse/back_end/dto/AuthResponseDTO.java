package com.assignment.ijse.back_end.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Data
public class AuthResponseDTO {
    private String accessToken;
    private UserDTO user;
}

