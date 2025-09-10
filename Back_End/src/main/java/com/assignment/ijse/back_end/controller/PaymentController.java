package com.assignment.ijse.back_end.controller;

import com.assignment.ijse.back_end.dto.PaymentDTO;
import com.assignment.ijse.back_end.service.PaymentService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/claimright/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody PaymentDTO dto) {
        try {
            PaymentIntent intent = paymentService.handlePayment(dto);

            return ResponseEntity.ok(Map.of(
                    "clientSecret", intent.getClientSecret()
            ));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }




//    @PostMapping("/create-intent")
//    public ResponseEntity<?> createPaymentIntent(@RequestBody Map<String, Object> request) {
//        try {
//            BigDecimal amount = new BigDecimal(request.get("amount").toString()); // from frontend
//            PaymentIntent intent = stripeService.createPayment(amount, "usd");
//
//            return ResponseEntity.ok(Map.of(
//                    "clientSecret", intent.getClientSecret()
//            ));
//        } catch (StripeException e) {
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
//    }

}