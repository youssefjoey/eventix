package com.example.eventix.repository;

import com.example.eventix.model.Reservation;
import com.example.eventix.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation,Long> {

    List<Reservation> findByUser_Id(Long userId);

    Reservation findByEvent_IdAndStatus(Long eventId , ReservationStatus reservationStatus);

}
