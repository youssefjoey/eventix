package com.example.eventix.controller;


import com.example.eventix.dto.ReservationDTO;
import com.example.eventix.model.ReservationStatus;
import com.example.eventix.service.AdminService;
import com.example.eventix.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {
    
    private final AdminService adminService;

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ReservationDTO> createReservation(@RequestBody ReservationDTO reservationDTO){
        ReservationDTO created = reservationService.createReservation(reservationDTO);
        return new ResponseEntity<> (created, HttpStatus.CREATED);
    }

    @GetMapping("/{userid}")
    public ResponseEntity<List<ReservationDTO>> getReservationByUserId(@PathVariable Long userid){
        return ResponseEntity.ok(reservationService.findReservationByUserId(userid));
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<ReservationDTO> getReservationById(@PathVariable Long id){
        return ResponseEntity.ok(reservationService.getReservationById(id));
    }

    @GetMapping("/byEvent-status/{eventId}")
    public ResponseEntity<List<ReservationDTO>> getReservationByEventAndStatus(@PathVariable Long eventId ,@RequestParam ReservationStatus reservationStatus){
        return ResponseEntity.ok(reservationService.findByEventIdAndStatus(eventId,reservationStatus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long id){
        reservationService.cancelReservation(id);
        return ResponseEntity.noContent().build();
    }


}
