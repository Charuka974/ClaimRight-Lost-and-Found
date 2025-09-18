package com.assignment.ijse.back_end.repository;

import com.assignment.ijse.back_end.entity.Payment;
import com.assignment.ijse.back_end.entity.enums.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Payment findByLostItemIdAndType(Long lostItemId, PaymentType type);

}
