package com.assignment.ijse.back_end.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Data
public class EmailRequestDTO {
    private String to;
    private String subject;
    private String htmlBody;
    private String fromUser;
}
