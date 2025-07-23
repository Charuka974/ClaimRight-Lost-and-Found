package com.assignment.ijse.back_end.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RegisterDTO {
    private int userId;
    private String username;
    private String email;
    private String password;
    private String role; // "USER", "ADMIN"
    private String phoneNumber;
    private LocalDateTime createdAt;
    private String profilePictureUrl;
    private boolean isActive;
}
