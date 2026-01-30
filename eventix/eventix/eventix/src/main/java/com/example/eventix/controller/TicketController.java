package com.example.eventix.controller;

import com.example.eventix.dto.TicketDTO;
import com.example.eventix.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketDTO> createTicket(@RequestBody TicketDTO ticketDTO){
        return ResponseEntity.ok(ticketService.createTicket(ticketDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO> getTicketById(@PathVariable Long id){
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<TicketDTO> getTicketByReservation(@PathVariable Long reservationId){
        return ResponseEntity.ok(ticketService.getTicketByReservationId(reservationId));
    }

    @GetMapping("/byReservation/{reservationId}")
    public ResponseEntity<List<TicketDTO>> getAllTicketsByReservation(@PathVariable Long reservationId){
        return ResponseEntity.ok(ticketService.getAllTicketsByReservationId(reservationId));
    }

    @GetMapping("/code/{ticketCode}")
    public ResponseEntity<TicketDTO> getTicketByCode(@PathVariable String ticketCode){
        return ResponseEntity.ok(ticketService.getTicketByCode(ticketCode));
    }

    @PutMapping("/checkin/{ticketCode}")
    public ResponseEntity<TicketDTO> checkInTicket(@PathVariable String ticketCode){
        return ResponseEntity.ok(ticketService.checkInTicket(ticketCode));
    }

    @GetMapping
    public ResponseEntity<List<TicketDTO>> getAllTickets(){
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id){
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
}
