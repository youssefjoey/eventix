package com.example.eventix.controller;


import com.example.eventix.dto.EventDTO;
import com.example.eventix.model.Event;
import com.example.eventix.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventDTO>> getAllEvents(){
        return ResponseEntity.ok(eventService.getAllEvents());
    }


    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Long id){
        return ResponseEntity.ok(eventService.getEventById(id));
    }


    @GetMapping("/byCategory/{id}")
    public  ResponseEntity<List<EventDTO>> getEventByCategoryId(@PathVariable Long id){
        return ResponseEntity.ok(eventService.getEventByCategoryId(id));
    }

    @GetMapping("byDate/{date}")
    public ResponseEntity<List<EventDTO>> getEventByDate(@PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date){
        return ResponseEntity.ok(eventService.getEventByDate(date));
    }

}
