package com.assignment.ijse.back_end.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Data
public class PasswordChangeDTO {
    private String userId;
    private String currentPassword;
    private String newPassword;
}
