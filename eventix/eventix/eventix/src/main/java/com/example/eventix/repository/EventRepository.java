package com.example.eventix.repository;

import com.example.eventix.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event,Long> {

    List<Event> findByCategory_Id(Long CategoryId);

    @Query("SELECT e FROM Event e WHERE DATE(e.date) = :date")
    List<Event> findByDateOnly(@Param("date") LocalDate date);

}
