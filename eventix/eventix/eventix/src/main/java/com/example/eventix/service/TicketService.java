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
        Ticket ticket = ticketRepository.findAll()
                .stream()
                .filter(t -> t.getReservation().getId().equals(reservationId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found for reservation: " + reservationId));
        return mapToDTO(ticket);
    }

    public List<TicketDTO> getAllTicketsByReservationId(Long reservationId) {
        List<Ticket> tickets = ticketRepository.findAll()
                .stream()
                .filter(t -> t.getReservation().getId().equals(reservationId))
                .collect(Collectors.toList());

        if (tickets.isEmpty()) {
            throw new ResourceNotFoundException("No tickets found for reservation: " + reservationId);
        }

        return tickets.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public boolean ticketExistsForReservation(Long reservationId) {
        return ticketRepository.findAll()
                .stream()
                .anyMatch(t -> t.getReservation().getId().equals(reservationId));
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

    private String generateTicketCode() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 20).toUpperCase();
    }
}
