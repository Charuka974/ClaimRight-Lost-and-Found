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
    private String contactInfo;
    private LocalDateTime createdAt;
    private boolean isActive;
}
