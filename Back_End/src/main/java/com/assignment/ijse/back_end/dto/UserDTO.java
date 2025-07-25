package com.assignment.ijse.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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
