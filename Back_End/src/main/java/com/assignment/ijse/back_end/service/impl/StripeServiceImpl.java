package com.assignment.ijse.back_end.service.impl;

import com.assignment.ijse.back_end.service.StripeService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class StripeServiceImpl implements StripeService {

    @Value("${stripe.api.key}")
    private String secretKey;

    @Override
    public PaymentIntent createPayment(BigDecimal amount, String currency) throws StripeException {
        // Set Stripe API key for this request
        Stripe.apiKey = secretKey;

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount.multiply(BigDecimal.valueOf(100)).longValue()) // Stripe expects cents
                .setCurrency(currency)
                .build();

        return PaymentIntent.create(params);
    }

}
