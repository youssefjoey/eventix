package com.example.eventix.controller;

import com.example.eventix.dto.PaymentDTO;
import com.example.eventix.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentDTO> createPayment(@RequestBody PaymentDTO paymentDTO){
        return ResponseEntity.ok(paymentService.createPayment(paymentDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentDTO> getPaymentById(@PathVariable Long id){
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<PaymentDTO> getPaymentByReservationId(@PathVariable Long reservationId){
        return ResponseEntity.ok(paymentService.getPaymentByReservationId(reservationId));
    }


    @GetMapping
    public ResponseEntity<List<PaymentDTO>> getAllPayments(){
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id){
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }

    // DEBUG: Test endpoint to manually create tickets for a reservation
    private final com.example.eventix.service.TicketService ticketService;
    private final com.example.eventix.repository.ReservationRepository reservationRepository;

    @PostMapping("/debug/create-tickets/{reservationId}")
    public ResponseEntity<Map<String, String>> debugCreateTickets(@PathVariable Long reservationId) {
        try {
            com.example.eventix.model.Reservation reservation = reservationRepository.findById(reservationId)
                    .orElseThrow(() -> new RuntimeException("Reservation not found"));
            ticketService.generateTicketsForReservation(reservation);
            Map<String, String> response = new HashMap<>();
            response.put("status", "✅ Tickets created successfully");
            response.put("reservationId", String.valueOf(reservationId));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("status", "❌ Error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
