package com.parkease.service;

import com.parkease.dto.ReservationRequest;
import com.parkease.dto.ReservationResponse;
import com.parkease.entity.ParkingSpot;
import com.parkease.entity.Reservation;
import com.parkease.entity.User;
import com.parkease.enums.ReservationStatus;
import com.parkease.repository.ParkingSpotRepository;
import com.parkease.repository.ReservationRepository;
import com.parkease.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReservationService {
    
    @Autowired
    private ReservationRepository reservationRepository;
    
    @Autowired
    private ParkingSpotRepository parkingSpotRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public ReservationResponse createReservation(ReservationRequest request, Long renterId) {
        ParkingSpot spot = parkingSpotRepository.findById(request.getSpotId())
                .orElseThrow(() -> new RuntimeException("Parking spot not found"));
        
        if (!spot.getIsAvailable()) {
            throw new RuntimeException("Parking spot is not available");
        }
        
        // Validate time
        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Start time must be in the future");
        }
        
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }
        
        // Check for conflicts
        List<Reservation> conflicts = reservationRepository.findConflictingReservations(
                request.getSpotId(),
                request.getStartTime(),
                request.getEndTime(),
                ReservationStatus.CONFIRMED
        );
        
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Parking spot is already booked for this time period");
        }
        
        // Calculate price
        BigDecimal totalPrice = calculatePrice(spot, request.getStartTime(), request.getEndTime());
        
        Reservation reservation = new Reservation();
        reservation.setSpotId(request.getSpotId());
        reservation.setRenterId(renterId);
        reservation.setStartTime(request.getStartTime());
        reservation.setEndTime(request.getEndTime());
        reservation.setTotalPrice(totalPrice);
        reservation.setStatus(ReservationStatus.PENDING);
        
        reservation = reservationRepository.save(reservation);
        return convertToResponse(reservation);
    }
    
    public List<ReservationResponse> getMyReservations(Long renterId) {
        List<Reservation> reservations = reservationRepository.findByRenterId(renterId);
        return reservations.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    public List<ReservationResponse> getHostingReservations(Long hostId) {
        List<Reservation> reservations = reservationRepository.findByHostId(hostId);
        return reservations.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    public ReservationResponse confirmReservation(Long id, Long hostId) {
        Reservation reservation = reservationRepository.findByIdAndSpotHostId(id, hostId)
                .orElseThrow(() -> new RuntimeException("Reservation not found or you are not authorized"));
        
        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new RuntimeException("Only pending reservations can be confirmed");
        }
        
        // Check for conflicts again before confirming
        List<Reservation> conflicts = reservationRepository.findConflictingReservations(
                reservation.getSpotId(),
                reservation.getStartTime(),
                reservation.getEndTime(),
                ReservationStatus.CONFIRMED
        );
        
        if (!conflicts.isEmpty() && !conflicts.get(0).getId().equals(id)) {
            throw new RuntimeException("Parking spot is already booked for this time period");
        }
        
        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation = reservationRepository.save(reservation);
        return convertToResponse(reservation);
    }
    
    public ReservationResponse cancelReservation(Long id, Long userId) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        // User can cancel if they are the renter or the host
        boolean isRenter = reservation.getRenterId().equals(userId);
        ParkingSpot spot = parkingSpotRepository.findById(reservation.getSpotId())
                .orElseThrow(() -> new RuntimeException("Parking spot not found"));
        boolean isHost = spot.getHostId().equals(userId);
        
        if (!isRenter && !isHost) {
            throw new RuntimeException("You are not authorized to cancel this reservation");
        }
        
        if (reservation.getStatus() == ReservationStatus.CANCELLED || 
            reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel this reservation");
        }
        
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation = reservationRepository.save(reservation);
        return convertToResponse(reservation);
    }
    
    private BigDecimal calculatePrice(ParkingSpot spot, LocalDateTime startTime, LocalDateTime endTime) {
        Duration duration = Duration.between(startTime, endTime);
        long totalHours = duration.toHours();
        long totalMinutes = duration.toMinutes();
        
        // If duration is less than 24 hours, calculate by hour
        if (totalHours < 24) {
            // Round up to the nearest hour if there are extra minutes
            long hours = totalMinutes % 60 == 0 ? totalHours : totalHours + 1;
            return spot.getPricePerHour().multiply(BigDecimal.valueOf(hours));
        } else {
            // If duration is 24 hours or more, calculate by day
            // Round up to the nearest day
            long days = totalHours / 24;
            if (totalHours % 24 > 0) {
                days += 1; // Round up to next day if there are extra hours
            }
            return spot.getPricePerDay().multiply(BigDecimal.valueOf(days));
        }
    }
    
    private ReservationResponse convertToResponse(Reservation reservation) {
        ReservationResponse response = new ReservationResponse();
        response.setId(reservation.getId());
        response.setSpotId(reservation.getSpotId());
        
        // Load spot details
        ParkingSpot spot = parkingSpotRepository.findById(reservation.getSpotId()).orElse(null);
        if (spot != null) {
            com.parkease.dto.ParkingSpotResponse spotResponse = new com.parkease.dto.ParkingSpotResponse();
            spotResponse.setId(spot.getId());
            spotResponse.setTitle(spot.getTitle());
            spotResponse.setAddress(spot.getAddress());
            spotResponse.setCity(spot.getCity());
            spotResponse.setImageUrl(spot.getImageUrl());
            spotResponse.setPricePerHour(spot.getPricePerHour());
            spotResponse.setPricePerDay(spot.getPricePerDay());
            response.setSpot(spotResponse);
        }
        
        response.setRenterId(reservation.getRenterId());
        
        // Load renter details
        User renter = userRepository.findById(reservation.getRenterId()).orElse(null);
        if (renter != null) {
            response.setRenterName(renter.getName());
            response.setRenterEmail(renter.getEmail());
        }
        
        response.setStartTime(reservation.getStartTime());
        response.setEndTime(reservation.getEndTime());
        response.setTotalPrice(reservation.getTotalPrice());
        response.setStatus(reservation.getStatus());
        response.setCreatedAt(reservation.getCreatedAt());
        
        return response;
    }
}

