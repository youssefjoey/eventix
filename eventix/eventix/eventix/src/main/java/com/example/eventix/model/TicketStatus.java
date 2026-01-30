package com.example.eventix.model;

public enum TicketStatus {
    ACTIVE,      // Ticket is valid and can be used
    USED,        // Ticket has been checked in/used
    CANCELED     // Ticket was canceled (reservation was canceled by admin/user)
}
