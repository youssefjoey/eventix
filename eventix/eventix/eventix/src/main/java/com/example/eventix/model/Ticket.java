package com.example.eventix.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tickets")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reservation_id", nullable = false, updatable = false)
    private Reservation reservation;

    @Column(unique = true, nullable = false)
    private String ticketCode;

    private boolean checked_in;

    private TicketStatus status;

}
