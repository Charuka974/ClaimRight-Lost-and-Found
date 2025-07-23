package com.assignment.ijse.securebackend.dto;

import lombok.*;

@Data
public class RegisterDTO {
    private String username;
    private String password;
    private String role; // USER, ADMIN
}
