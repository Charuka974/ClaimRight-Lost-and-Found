package com.assignment.ijse.back_end.repository;

import com.assignment.ijse.back_end.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
