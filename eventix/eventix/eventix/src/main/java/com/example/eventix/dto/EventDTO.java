package com.example.eventix.dto;


import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventDTO {

    private Long id;

    @NotBlank(message = "Event Name is required")
    @Size(min = 1, max = 255, message = "Event Name must be between 1 and 255 characters")
    private String name;

    @NotNull(message = "Category is required")
    private Long category_id;

    @NotBlank(message = "Event Location is required")
    @Size(min = 1, max = 1000, message = "Event Location must be between 1 and 1000 characters")
    private String location;

    private String description;

    @NotNull(message = "Event Date is required")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime date;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime startTime;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime endTime;

    @NotNull(message = "Number of Attendance is required")
    @Min(value = 0, message = "Number of Attendance cannot be negative")
    private Long totalCapacity;


    private Long availableSeats;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal priceBase;

    @NotNull(message = "User ID is required")
    private Long user_id;


}
