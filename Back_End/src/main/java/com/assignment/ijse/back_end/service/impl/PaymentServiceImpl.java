package com.assignment.ijse.back_end.service.impl;

import com.assignment.ijse.back_end.dto.PaymentDTO;
import com.assignment.ijse.back_end.entity.Payment;
import com.assignment.ijse.back_end.entity.enums.PaymentStatus;
import com.assignment.ijse.back_end.entity.enums.PaymentType;
import com.assignment.ijse.back_end.repository.FoundItemRepository;
import com.assignment.ijse.back_end.repository.LostItemRepository;
import com.assignment.ijse.back_end.repository.PaymentRepository;
import com.assignment.ijse.back_end.repository.UserRepository;
import com.assignment.ijse.back_end.service.PaymentService;
import com.assignment.ijse.back_end.service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final StripeService stripeService;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;         // Assume you have this
    private final LostItemRepository lostItemRepository; // Assume you have this
    private final FoundItemRepository foundItemRepository; // Assume you have this

    @Override
    public PaymentIntent handlePayment(PaymentDTO dto) throws StripeException {
        // Create Stripe payment intent
        PaymentIntent intent = stripeService.createPayment(dto.getAmount(), "usd");

        // Map DTO to Entity
        Payment payment = new Payment();
        payment.setAmount(dto.getAmount());
        payment.setType(PaymentType.valueOf(dto.getType().toUpperCase()));
        payment.setStatus(PaymentStatus.PENDING);

        payment.setPayer(userRepository.findById(dto.getPayerId())
                .orElseThrow(() -> new RuntimeException("Payer not found with ID: " + dto.getPayerId())));

        if (dto.getReceiverId() != null) {
            payment.setReceiver(userRepository.findById(dto.getReceiverId())
                    .orElseThrow(() -> new RuntimeException("Receiver not found with ID: " + dto.getReceiverId())));
        }

        if (dto.getLostItemId() != null) {
            payment.setLostItem(lostItemRepository.findById(dto.getLostItemId())
                    .orElseThrow(() -> new RuntimeException("Lost item not found with ID: " + dto.getLostItemId())));
        }

        if (dto.getFoundItemId() != null) {
            payment.setFoundItem(foundItemRepository.findById(dto.getFoundItemId())
                    .orElseThrow(() -> new RuntimeException("Found item not found with ID: " + dto.getFoundItemId())));
        }

        // Save entity
        paymentRepository.save(payment);

        return intent;
    }

}
