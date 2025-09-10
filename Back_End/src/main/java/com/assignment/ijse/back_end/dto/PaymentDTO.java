package com.assignment.ijse.back_end.dto;

import lombok.*;

import java.math.BigDecimal;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class PaymentDTO {
    private BigDecimal amount;
    private String type;       // "REWARD" or "PRIORITY"
    private Long payerId;
    private Long receiverId;
    private Long lostItemId;
    private Long foundItemId;
}