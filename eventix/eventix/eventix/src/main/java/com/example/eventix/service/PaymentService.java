package com.example.eventix.service;

import com.example.eventix.dto.PaymentDTO;
import com.example.eventix.exception.ResourceNotFoundException;
import com.example.eventix.model.*;
import com.example.eventix.repository.PaymentRepository;
import com.example.eventix.repository.ReservationRepository;
import com.example.eventix.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final TicketRepository ticketRepository;

    public PaymentDTO createPayment(PaymentDTO dto) {

        System.out.println("\n\n========== PAYMENT CREATION START ==========");
        System.out.println("📥 Received payment request for reservation ID: " + dto.getReservation_id());
        System.out.println("📥 Amount: " + (dto.getAmount()));
        System.out.println("📥 Method: " + dto.getMethod());

        Reservation reservation = reservationRepository.findById(dto.getReservation_id())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + dto.getReservation_id()));

        System.out.println("✅ Reservation found - ID: " + reservation.getId() + ", Status: " + reservation.getStatus());

        
        java.util.Optional<Payment> existingPayment = paymentRepository.findByReservation_Id(dto.getReservation_id());

        Payment payment;
        if (existingPayment.isPresent()) {
            System.out.println("⚠️  Payment already exists for reservation: " + dto.getReservation_id());
            payment = existingPayment.get();
        } else {
            System.out.println("✅ No existing payment found - creating new payment");

            payment = Payment.builder()
                    .reservation(reservation)
                    .amount(dto.getAmount())
                    .method(Payment_Method.valueOf(dto.getMethod()))
                    .status(Payment_Status.SUCCESS)
                    .paidAt(LocalDateTime.now())
                    .build();

            System.out.println("💾 Saving payment to database...");
            payment = paymentRepository.save(payment);
            System.out.println("✅ Payment saved! Payment ID: " + payment.getId());

            
            System.out.println("🔄 Updating reservation status to PAID...");
            reservation.setStatus(ReservationStatus.PAID);
            reservationRepository.save(reservation);
            System.out.println("✅ Reservation updated to PAID status");
        }

        
        System.out.println("\n🎫 STARTING TICKET GENERATION...");
        generateTicketForReservation(reservation);
        System.out.println("🎫 TICKET GENERATION COMPLETED\n");

        System.out.println("========== PAYMENT CREATION END (SUCCESS) ==========\n\n");
        return mapToDTO(payment);
    }

    private void generateTicketForReservation(Reservation reservation) {
        System.out.println("\n>>> ENTER: generateTicketForReservation()");
        System.out.println("    Reservation ID: " + reservation.getId());
        System.out.println("    User ID: " + reservation.getUser().getId());
        System.out.println("    Event ID: " + reservation.getEvent().getId());
        System.out.println("    Seats Reserved: " + reservation.getSeats());

        try {
            
            System.out.println("    Checking if tickets already exist...");
            List<Ticket> existingTickets = ticketRepository.findAll()
                    .stream()
                    .filter(t -> t.getReservation().getId().equals(reservation.getId()))
                    .collect(Collectors.toList());

            if (!existingTickets.isEmpty()) {
                System.out.println("    ⚠️  Tickets already exist for this reservation!");
                System.out.println("    ✅ Found " + existingTickets.size() + " existing tickets");
                return;
            }

            
            Long seatsReserved = reservation.getSeats();
            System.out.println("    📝 Creating " + seatsReserved + " ticket(s) for " + seatsReserved + " seat(s)");

            for (int i = 0; i < seatsReserved; i++) {
                String ticketCode = generateTicketCode();
                System.out.println("    📝 Creating ticket " + (i + 1) + "/" + seatsReserved + " with code: " + ticketCode);

                Ticket ticket = new Ticket();
                ticket.setReservation(reservation);
                ticket.setTicketCode(ticketCode);
                ticket.setChecked_in(false);

                System.out.println("    💾 Saving ticket to database...");
                Ticket savedTicket = ticketRepository.save(ticket);
                System.out.println("    ✅ TICKET SAVED SUCCESSFULLY!");
                System.out.println("    ✅ Ticket ID: " + savedTicket.getId());
                System.out.println("    ✅ Ticket Code: " + savedTicket.getTicketCode());
                System.out.println("    ✅ Reservation ID: " + savedTicket.getReservation().getId());
            }

            System.out.println("    ✅ All " + seatsReserved + " tickets created successfully!");
        } catch (Exception e) {
            System.out.println("    ❌ EXCEPTION in generateTicketForReservation: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to generate ticket: " + e.getMessage(), e);
        }
        System.out.println("<<< EXIT: generateTicketForReservation()\n");
    }

    private String generateTicketCode() {
        return "TKT" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
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
