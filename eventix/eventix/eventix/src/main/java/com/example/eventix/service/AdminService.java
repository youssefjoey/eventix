package com.example.eventix.service;
import com.example.eventix.dto.CategoryDTO;
import com.example.eventix.dto.EventDTO;
import com.example.eventix.dto.ReservationDTO;
import com.example.eventix.dto.UserDTO;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional

public class AdminService {

    private final CategoryService categoryService;
    private final EventService eventService;
    private final UserService userService;
    private final ReservationService reservationService;

    
    public CategoryDTO createCategory(CategoryDTO dto) {
        return categoryService.createCategory(dto);
    }

    public void deleteCategory(Long id) {
        categoryService.deleteCategory(id);
    }

    
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    

    public EventDTO createEvent(EventDTO eventDTO){
        return eventService.createEvent(eventDTO);
    }

    public EventDTO updateEvent(Long eventId, EventDTO eventDTO){
        return eventService.updateEvent(eventId,eventDTO);
    }

    public void deleteEvent(Long id){
        eventService.deleteEvent(id);
    }


    
    public void cancelReservation(Long id){
        reservationService.cancelReservation(id);
    }

    public List<ReservationDTO> getAllReservations(){
        return reservationService.getAllReservations();
    }

}

