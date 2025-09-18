package com.assignment.ijse.back_end.service;

import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Payout;
import com.stripe.model.Transfer;

import java.math.BigDecimal;

public interface StripeService {
    PaymentIntent createPayment(BigDecimal amount, String currency) throws StripeException;

    Account createConnectedAccount(String email, String country) throws StripeException;

    Transfer transferToConnectedAccount(BigDecimal amount, String currency, String connectedAccountId) throws StripeException;

    Payout payoutToBank(BigDecimal amount, String currency, String connectedAccountId) throws StripeException;

}
