package com.example.eventix.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class ReservationDTO {
    private Long id;

    @NotNull(message = "User ID is required")
    private Long user_id;

    private String userName;

    @NotNull(message = "Event ID is required")
    private Long event_id;

    private String eventName;

    @Min(1)
    private Long seats_reserved;

    private String status;

    private LocalDateTime reservationDate;
}
