package com.assignment.ijse.securebackend.dto;

import lombok.Data;

@Data
public class AuthDTO {
    private String username;
    private String password;
    private String role; // USER, ADMIN
}
