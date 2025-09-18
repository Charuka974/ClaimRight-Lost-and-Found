package com.assignment.ijse.back_end.service.impl;

import com.assignment.ijse.back_end.dto.PaymentDTO;
import com.assignment.ijse.back_end.entity.Claim;
import com.assignment.ijse.back_end.entity.Payment;
import com.assignment.ijse.back_end.entity.enums.ClaimStatus;
import com.assignment.ijse.back_end.entity.enums.PaymentStatus;
import com.assignment.ijse.back_end.entity.enums.PaymentType;
import com.assignment.ijse.back_end.repository.*;
import com.assignment.ijse.back_end.service.PaymentService;
import com.assignment.ijse.back_end.service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Transfer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final StripeService stripeService;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final ClaimRepository claimRepository;

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

    @Override
    public Transfer transferToFinder(Long lostItemID, Long userID, String stripeID) throws StripeException {
        // Find the payment associated with the lost item
        Payment payment = paymentRepository.findByLostItemIdAndType(lostItemID, PaymentType.REWARD);
        if (payment == null) {
            throw new RuntimeException("No reward payment found for lost item ID: " + lostItemID);
        }

        // If receiver is not set, get it from an approved or completed claim
        if (payment.getReceiver() == null) {
            List<ClaimStatus> allowedStatuses = List.of(
                    ClaimStatus.FINDER_APPROVED,
                    ClaimStatus.ADMIN_APPROVED,
                    ClaimStatus.COMPLETED
            );

            Claim claim = claimRepository.findFirstByLostItemIdAndClaimStatusIn(lostItemID, allowedStatuses)
                    .orElseThrow(() -> new RuntimeException(
                            "No approved or completed claim found for lost item ID: " + lostItemID));

            // Validate that the claim's claimant matches the provided userID
            if (!claim.getClaimant().getUserId().equals(userID)) {
                throw new RuntimeException("Claimant (finder) does not match the provided user ID.");
            }

            // Only now set the receiver and save
            payment.setReceiver(claim.getClaimant());
            paymentRepository.save(payment);
        } else {
            // Validate existing receiver matches userID
            if (!payment.getReceiver().getUserId().equals(userID)) {
                throw new RuntimeException("Existing receiver does not match the provided user ID.");
            }
        }

        // Validate Stripe account ID
        if (stripeID == null || stripeID.isEmpty()) {
            throw new RuntimeException("Stripe account ID must be provided for the receiver.");
        }

        // Transfer money
        Transfer transfer = stripeService.transferToConnectedAccount(
                payment.getAmount(), "usd", stripeID
        );

        // Update payment status
        payment.setStatus(PaymentStatus.COMPLETED);
        paymentRepository.save(payment);

        return transfer;
    }





}
