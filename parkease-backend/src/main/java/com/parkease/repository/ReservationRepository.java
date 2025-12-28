package com.parkease.repository;

import com.parkease.entity.Reservation;
import com.parkease.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByRenterId(Long renterId);
    
    List<Reservation> findBySpotId(Long spotId);
    
    @Query("SELECT r FROM Reservation r JOIN r.spot p WHERE p.hostId = :hostId")
    List<Reservation> findByHostId(@Param("hostId") Long hostId);
    
    @Query("SELECT r FROM Reservation r WHERE r.spotId = :spotId AND " +
           "r.status = :status AND " +
           "((r.startTime <= :startTime AND r.endTime > :startTime) OR " +
           "(r.startTime < :endTime AND r.endTime >= :endTime) OR " +
           "(r.startTime >= :startTime AND r.endTime <= :endTime))")
    List<Reservation> findConflictingReservations(@Param("spotId") Long spotId,
                                                   @Param("startTime") LocalDateTime startTime,
                                                   @Param("endTime") LocalDateTime endTime,
                                                   @Param("status") ReservationStatus status);
    
    @Query("SELECT r FROM Reservation r WHERE r.spotId = :spotId AND r.renterId = :renterId AND r.status = :status")
    List<Reservation> findBySpotIdAndRenterIdAndStatus(@Param("spotId") Long spotId,
                                                         @Param("renterId") Long renterId,
                                                         @Param("status") ReservationStatus status);
    
    Optional<Reservation> findByIdAndRenterId(Long id, Long renterId);
    
    @Query("SELECT r FROM Reservation r JOIN r.spot p WHERE r.id = :id AND p.hostId = :hostId")
    Optional<Reservation> findByIdAndSpotHostId(@Param("id") Long id, @Param("hostId") Long hostId);
}

