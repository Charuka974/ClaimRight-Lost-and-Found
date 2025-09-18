package com.assignment.ijse.back_end.service;

import com.assignment.ijse.back_end.dto.PaymentDTO;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Transfer;

public interface PaymentService {
    PaymentIntent handlePayment(PaymentDTO dto) throws StripeException;

    Transfer transferToFinder(Long lostItemID, Long userID, String stripeID) throws StripeException;

}
