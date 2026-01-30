package com.example.eventix.service;



import com.example.eventix.dto.EventDTO;
import com.example.eventix.exception.ResourceNotFoundException;
import com.example.eventix.model.Category;
import com.example.eventix.model.Event;
import com.example.eventix.model.User;
import com.example.eventix.repository.CategoryRepository;
import com.example.eventix.repository.EventRepository;
import com.example.eventix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EventService {

    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;


    public List<EventDTO> getAllEvents(){
        return eventRepository.findAll()
                .stream().map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public EventDTO getEventById(Long id){
        Event event= eventRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Event Not Found with id:"+ id));
        return mapToDTO(event);
    }

    public List<EventDTO> getEventByCategoryId(Long id){
        return eventRepository.findByCategory_Id(id)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<EventDTO>getEventByDate(LocalDate date){
        return eventRepository.findByDateOnly(date)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    public Long getSeatsReserved(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        return event.getTotalCapacity() - event.getAvailableSeats();
    }
    

    public EventDTO createEvent(EventDTO eventDTO) {

        Category category = categoryRepository.findById(eventDTO.getCategory_id())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + eventDTO.getCategory_id()));

        User user = userRepository.findById(eventDTO.getUser_id())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + eventDTO.getUser_id()));

        Event event = Event.builder()
                .name(eventDTO.getName())
                .description(eventDTO.getDescription())
                .imageUrl(eventDTO.getImageUrl())
                .category(category)
                .location(eventDTO.getLocation())
                .date(eventDTO.getDate())
                .startTime(eventDTO.getStartTime())
                .endTime(eventDTO.getEndTime())
                .totalCapacity(eventDTO.getTotalCapacity())
                .availableSeats(eventDTO.getAvailableSeats())
                .priceBase(eventDTO.getPriceBase())
                .user(user)
                .build();

        Event savedEvent = eventRepository.save(event);
        return mapToDTO(savedEvent);
    }

    public void deleteEvent(Long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Event not found with id: " + eventId));

        eventRepository.delete(event);
    }

    public EventDTO updateEvent(Long eventId, EventDTO eventDTO) {
        Event event = eventRepository.findById(eventId).orElseThrow(()-> new ResourceNotFoundException("Event not found with id: " + eventId));
        Category category = categoryRepository.findById(eventDTO.getCategory_id()).orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + eventDTO.getCategory_id()));

        event.setName(eventDTO.getName());
        event.setDescription(eventDTO.getDescription());
        event.setImageUrl(eventDTO.getImageUrl());
        event.setCategory(category);
        event.setLocation(eventDTO.getLocation());
        event.setDate(eventDTO.getDate());
        event.setStartTime(eventDTO.getStartTime());
        event.setEndTime(eventDTO.getEndTime());
        event.setTotalCapacity(eventDTO.getTotalCapacity());
        event.setAvailableSeats(eventDTO.getAvailableSeats());
        event.setPriceBase(eventDTO.getPriceBase());

        Event savedEvent = eventRepository.save(event);
        return mapToDTO(savedEvent);
    }



















    private EventDTO mapToDTO(Event event) {
        return EventDTO.builder()
                .id(event.getId())
                .name(event.getName())
                .description(event.getDescription())
                .imageUrl(event.getImageUrl())
                .location(event.getLocation())
                .date(event.getDate())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .totalCapacity(event.getTotalCapacity())
                .availableSeats(event.getAvailableSeats())
                .priceBase(event.getPriceBase())
                .category_id(event.getCategory().getId())
                .user_id(event.getUser().getId())
                .build();
    }


}
