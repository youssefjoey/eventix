package com.example.eventix.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketDTO {

    private Long id;

    @NotNull(message = "Reservation ID is required")
    private Long reservation_id;


    @NotBlank(message = "Ticket Code is required")
    @Size(min = 15, max = 24, message = "Ticket Code must be between 15 and 24 characters and Unique")
    private String ticketCode;

    private boolean checked_in;

    private String status;

}
