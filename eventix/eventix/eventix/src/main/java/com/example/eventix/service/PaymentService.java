package com.example.eventix.service;

import com.example.eventix.dto.PaymentDTO;
import com.example.eventix.exception.ResourceNotFoundException;
import com.example.eventix.model.*;
import com.example.eventix.repository.EventRepository;
import com.example.eventix.repository.PaymentRepository;
import com.example.eventix.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final EventRepository eventRepository;
    private final TicketService ticketService;

    public PaymentDTO createPayment(PaymentDTO dto) {
        System.out.println("\n\n========== PAYMENT CREATION START ==========");
        System.out.println("📥 Received payment request for reservation ID: " + dto.getReservation_id());

        Reservation reservation = reservationRepository.findById(dto.getReservation_id())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + dto.getReservation_id()));

        System.out.println("✅ Reservation found - ID: " + reservation.getId() + ", Seats: " + reservation.getSeats());

        java.util.Optional<Payment> existingPayment = paymentRepository.findByReservation_Id(dto.getReservation_id());

        Payment payment;
        if (existingPayment.isPresent()) {
            System.out.println("⚠️ Updating existing payment for reservation: " + dto.getReservation_id());
            payment = existingPayment.get();
            payment.setMethod(Payment_Method.valueOf(dto.getMethod()));
            payment.setStatus(Payment_Status.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
            payment = paymentRepository.save(payment);
            
            // DECREASE SEATS ONLY ON SUCCESSFUL PAYMENT
            Event event = reservation.getEvent();
            if (event.getAvailableSeats() < reservation.getSeats()) {
                throw new IllegalStateException("Not enough seats available for this transaction.");
            }
            event.setAvailableSeats(event.getAvailableSeats() - reservation.getSeats());
            eventRepository.save(event);

            reservation.setStatus(ReservationStatus.PAID);
            reservationRepository.save(reservation);
        } else {
            System.out.println("✅ No existing payment found - creating new payment");

            // DECREASE SEATS ONLY ON SUCCESSFUL PAYMENT 
            Event event = reservation.getEvent();
            if (event.getAvailableSeats() < reservation.getSeats()) {
                throw new IllegalStateException("Not enough seats available for this transaction.");
            }
            event.setAvailableSeats(event.getAvailableSeats() - reservation.getSeats());
            eventRepository.save(event);

            payment = Payment.builder()
                    .reservation(reservation)
                    .amount(dto.getAmount())
                    .method(Payment_Method.valueOf(dto.getMethod()))
                    .status(Payment_Status.SUCCESS)
                    .paidAt(LocalDateTime.now())
                    .build();

            payment = paymentRepository.save(payment);
            reservation.setStatus(ReservationStatus.PAID);
            reservationRepository.save(reservation);
        }

        // Generate tickets via TicketService
        ticketService.generateTicketsForReservation(reservation);

        System.out.println("========== PAYMENT CREATION END (SUCCESS) ==========\n\n");
        return mapToDTO(payment);
    }

    public PaymentDTO getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + id));
        return mapToDTO(payment);
    }

    public PaymentDTO getPaymentByReservationId(Long reservationId) {
        Payment payment = paymentRepository.findByReservation_Id(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for reservation: " + reservationId));
        return mapToDTO(payment);
    }

    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + id));
        paymentRepository.delete(payment);
    }

    private PaymentDTO mapToDTO(Payment payment) {
        return PaymentDTO.builder()
                .id(payment.getId())
                .reservation_id(payment.getReservation().getId())
                .amount(payment.getAmount())
                .method(String.valueOf(payment.getMethod()))
                .status(String.valueOf(payment.getStatus()))
                .build();
    }
}
