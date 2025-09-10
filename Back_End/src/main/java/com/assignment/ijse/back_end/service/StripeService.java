package com.assignment.ijse.back_end.service;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

import java.math.BigDecimal;

public interface StripeService {
    PaymentIntent createPayment(BigDecimal amount, String currency) throws StripeException;
}
