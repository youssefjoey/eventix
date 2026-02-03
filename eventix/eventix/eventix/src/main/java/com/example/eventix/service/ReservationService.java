package com.example.eventix.service;

import com.example.eventix.dto.ReservationDTO;
import com.example.eventix.exception.ResourceNotFoundException;
import com.example.eventix.model.*;
import com.example.eventix.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservationService {


    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final PaymentRepository paymentRepository;
    private final TicketService ticketService;


    public ReservationDTO createReservation(ReservationDTO dto){

        User user = userRepository.findById(dto.getUser_id())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + dto.getUser_id()));
        Event event = eventRepository.findById(dto.getEvent_id())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + dto.getEvent_id()));

        if(dto.getSeats_reserved() <= 0) throw new IllegalArgumentException("Seats reserved must be at least 1");
        if(event.getAvailableSeats() < dto.getSeats_reserved()) throw new IllegalStateException("Not enough available seats");

        // We do NOT decrease available seats here anymore.
        // Seats will be decreased only when payment is successfully processed.

        
        Reservation reservation = Reservation.builder()
                .user(user)
                .event(event)
                .seats(dto.getSeats_reserved())
                .status(ReservationStatus.HELD) // Initial status is HELD
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plus(30, java.time.temporal.ChronoUnit.MINUTES))
                .build();

        Reservation saved = reservationRepository.save(reservation);

        // removed automatic payment record creation and ticket generation here
        // this will be handled in PaymentService after user confirms payment

        return mapToDTO(saved);
    }

    public ReservationDTO getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + id));
        return mapToDTO(reservation);
    }


    public void cancelReservation(Long id){
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation Not Found"));

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        paymentRepository.findByReservation_Id(reservation.getId())
                .ifPresent(payment -> {
                    payment.setStatus(Payment_Status.FAILED);
                    paymentRepository.save(payment);
                });

        // Only restore seats if the reservation was already PAID.
        // Since we now only decrease seats on Payment, we only restore them if they were taken.
        if (ReservationStatus.PAID.equals(reservation.getStatus())) {
            Event event = reservation.getEvent();
            event.setAvailableSeats(event.getAvailableSeats() + reservation.getSeats());
            eventRepository.save(event);
        }

        // Cancel all tickets for this reservation
        ticketService.cancelTicketsByReservationId(reservation.getId());
    }



    public List<ReservationDTO> findReservationByUserId(Long id){
        List<Reservation> reservations  = reservationRepository.findByUser_Id(id);
        return reservations.stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<ReservationDTO> findByEventIdAndStatus(Long eventId , ReservationStatus reservationStatus){
        List<Reservation> reservations = Collections.singletonList(reservationRepository.findByEvent_IdAndStatus(eventId, reservationStatus));
        if (reservations.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No reservations found for Event id: " + eventId+ " with status"+reservationStatus);
        }
        return reservations.stream()
                .map(this::mapToDTO)
                .toList();
    }


    public List<ReservationDTO> getAllReservations() {
        return reservationRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }



    private ReservationDTO mapToDTO(Reservation reservation) {
        return ReservationDTO.builder()
                .id(reservation.getId())
                .user_id(reservation.getUser().getId())
                .userName(reservation.getUser().getName())
                .event_id(reservation.getEvent().getId())
                .eventName(reservation.getEvent().getName())
                .seats_reserved(reservation.getSeats())
                .status(String.valueOf(reservation.getStatus()))
                .reservationDate(reservation.getCreatedAt())
                .build();
    }



}
