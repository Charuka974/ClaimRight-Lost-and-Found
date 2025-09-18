package com.assignment.ijse.back_end.service.impl;

import com.assignment.ijse.back_end.service.StripeService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Payout;
import com.stripe.model.Transfer;
import com.stripe.net.RequestOptions;
import com.stripe.param.AccountCreateParams;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PayoutCreateParams;
import com.stripe.param.TransferCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class StripeServiceImpl implements StripeService {

    @Value("${stripe.api.key}")
    private String secretKey;

    // Initialize Stripe with the secret API key after bean creation
    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    @Override
    public PaymentIntent createPayment(BigDecimal amount, String currency) throws StripeException {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount.multiply(BigDecimal.valueOf(100)).longValue())
                .setCurrency(currency)
                .build();

        return PaymentIntent.create(params);
    }

    @Override
    public Account createConnectedAccount(String email, String country) throws StripeException {
        AccountCreateParams params = AccountCreateParams.builder()
                .setType(AccountCreateParams.Type.EXPRESS)
                .setCountry(country)
                .setEmail(email)
                .build();

        return Account.create(params);
    }

    @Override
    public Transfer transferToConnectedAccount(BigDecimal amount, String currency, String connectedAccountId) throws StripeException {
        TransferCreateParams params = TransferCreateParams.builder()
                .setAmount(amount.multiply(BigDecimal.valueOf(100)).longValue())
                .setCurrency(currency)
                .setDestination(connectedAccountId)
                .build();

        return Transfer.create(params);
    }

    @Override
    public Payout payoutToBank(BigDecimal amount, String currency, String connectedAccountId) throws StripeException {
        PayoutCreateParams params = PayoutCreateParams.builder()
                .setAmount(amount.multiply(BigDecimal.valueOf(100)).longValue())
                .setCurrency(currency)
                .build();

        return Payout.create(params,
                RequestOptions.builder().setStripeAccount(connectedAccountId).build()
        );
    }

}

