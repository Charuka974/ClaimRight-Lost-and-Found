package com.assignment.ijse.back_end.dto;

import lombok.Data;

@Data
public class AuthDTO {
//    private String username;
    private String email;
    private String password;
    private String role; // USER, ADMIN
}
