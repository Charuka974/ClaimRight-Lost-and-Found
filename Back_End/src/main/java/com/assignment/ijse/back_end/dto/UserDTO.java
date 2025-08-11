package com.assignment.ijse.back_end.dto;

import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Data
public class UserDTO {
    private Long userId;
    private String username;
    private String email;
    private String password;
    private String role; // "USER", "ADMIN"
    private String phoneNumber;
    private LocalDateTime createdAt;
    private String profilePictureUrl;
    private boolean isActive;
}
