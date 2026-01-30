package com.example.eventix.repository;

import com.example.eventix.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment,Long> {

    Optional<Payment> findByReservation_Id(Long reservationId);

}
