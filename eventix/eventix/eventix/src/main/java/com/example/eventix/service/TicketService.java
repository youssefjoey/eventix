package com.example.eventix.service;


import com.example.eventix.dto.TicketDTO;
import com.example.eventix.exception.ResourceNotFoundException;
import com.example.eventix.model.Reservation;
import com.example.eventix.model.ReservationStatus;
import com.example.eventix.model.Ticket;
import com.example.eventix.model.TicketStatus;
import com.example.eventix.repository.ReservationRepository;
import com.example.eventix.repository.TicketRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final ReservationRepository reservationRepository;

    public TicketDTO createTicket(TicketDTO dto){
        Reservation reservation = reservationRepository.findById(dto.getReservation_id())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + dto.getReservation_id()));

        if(reservation.getStatus() != ReservationStatus.PAID){
            throw new IllegalStateException("Cannot create ticket for unpaid reservation");
        }

        Ticket ticket = Ticket.builder()
                .reservation(reservation)
                .ticketCode(dto.getTicketCode() != null ? dto.getTicketCode() : generateTicketCode())
                .checked_in(false)
                .status(TicketStatus.ACTIVE)
                .build();

        return mapToDTO(ticketRepository.save(ticket));
    }




    public TicketDTO getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
        return mapToDTO(ticket);
    }



    public TicketDTO getTicketByReservationId(Long reservationId) {
        return ticketRepository.findByReservation_Id(reservationId)
                .stream()
                .findFirst()
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found for reservation: " + reservationId));
    }

    public List<TicketDTO> getAllTicketsByReservationId(Long reservationId) {
        List<Ticket> tickets = ticketRepository.findByReservation_Id(reservationId);

        if (tickets.isEmpty()) {
            throw new ResourceNotFoundException("No tickets found for reservation: " + reservationId);
        }

        return tickets.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public boolean ticketExistsForReservation(Long reservationId) {
        return !ticketRepository.findByReservation_Id(reservationId).isEmpty();
    }



    public TicketDTO getTicketByCode(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketCode));
        return mapToDTO(ticket);
    }

    public TicketDTO checkInTicket(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketCode));
        ticket.setChecked_in(true);
        Ticket updated = ticketRepository.save(ticket);
        return mapToDTO(updated);
    }


    public List<TicketDTO> getAllTickets() {
        return ticketRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void deleteTicket(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
        ticketRepository.delete(ticket);
    }

    private TicketDTO mapToDTO(Ticket ticket) {
        return TicketDTO.builder()
                .id(ticket.getId())
                .reservation_id(ticket.getReservation().getId())
                .ticketCode(ticket.getTicketCode())
                .checked_in(ticket.isChecked_in())
                .status(ticket.getStatus() != null ? ticket.getStatus().toString() : "ACTIVE")
                .build();
    }

    public List<TicketDTO> generateTicketsForReservation(Reservation reservation) {
        System.out.println("🎫 Generating tickets for reservation: " + reservation.getId() + " (" + reservation.getSeats() + " seats)");
        
        Long seatsReserved = reservation.getSeats();
        if (seatsReserved == null || seatsReserved <= 0) {
            System.out.println("⚠️ No seats reserved, skipping ticket generation.");
            return List.of();
        }

        // Check if tickets already exist to avoid duplicates
        List<Ticket> existing = ticketRepository.findByReservation_Id(reservation.getId());
        if (!existing.isEmpty()) {
            System.out.println("⚠️ Tickets already exist for this reservation. Skipping.");
            return existing.stream().map(this::mapToDTO).collect(Collectors.toList());
        }

        for (int i = 0; i < seatsReserved; i++) {
            Ticket ticket = Ticket.builder()
                    .reservation(reservation)
                    .ticketCode(generateTicketCode())
                    .checked_in(false)
                    .status(TicketStatus.ACTIVE)
                    .build();
            ticketRepository.save(ticket);
            System.out.println("✅ Ticket created: " + ticket.getTicketCode());
        }
        
        return ticketRepository.findByReservation_Id(reservation.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private String generateTicketCode() {
        return "TKT-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
