package com.assignment.ijse.back_end.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Data
public class AuthDTO {
//    private String username;
    private String email;
    private String password;
    private String role; // USER, ADMIN
}
