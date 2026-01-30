package com.example.eventix.repository;

import com.example.eventix.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket,Long> {

    Optional<Ticket> findByTicketCode(String ticketCode);

    java.util.List<Ticket> findByReservation_Id(Long reservationId);

}
