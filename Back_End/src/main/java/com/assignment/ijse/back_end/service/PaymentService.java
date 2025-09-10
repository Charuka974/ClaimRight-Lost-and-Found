package com.assignment.ijse.back_end.service;

import com.assignment.ijse.back_end.dto.PaymentDTO;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

public interface PaymentService {
    PaymentIntent handlePayment(PaymentDTO dto) throws StripeException;
}
