package com.parkease.service;

import com.parkease.dto.ParkingSpotRequest;
import com.parkease.dto.ParkingSpotResponse;
import com.parkease.entity.ParkingSpot;
import com.parkease.entity.User;
import com.parkease.repository.ParkingSpotRepository;
import com.parkease.repository.ReviewRepository;
import com.parkease.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkease.enums.ReservationStatus;
import com.parkease.repository.ReservationRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ParkingSpotService {
    
    @Autowired
    private ParkingSpotRepository parkingSpotRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private ReservationRepository reservationRepository;
    
    public List<ParkingSpotResponse> searchSpots(String city, String spotType, BigDecimal priceMin, BigDecimal priceMax, String date) {
        String typeStr = spotType != null ? spotType.toUpperCase() : null;
        List<ParkingSpot> spots = parkingSpotRepository.searchSpots(city, typeStr, priceMin, priceMax);
        
        // Filter by date if provided
        if (date != null && !date.isEmpty()) {
            try {
                LocalDate searchDate = LocalDate.parse(date, DateTimeFormatter.ISO_LOCAL_DATE);
                LocalDateTime startOfDay = searchDate.atStartOfDay();
                LocalDateTime endOfDay = searchDate.plusDays(1).atStartOfDay();
                
                spots = spots.stream()
                    .filter(spot -> {
                        // Check if spot has any confirmed reservations on this date
                        List<com.parkease.entity.Reservation> conflicts = reservationRepository.findConflictingReservations(
                            spot.getId(), startOfDay, endOfDay, ReservationStatus.CONFIRMED
                        );
                        return conflicts.isEmpty();
                    })
                    .collect(Collectors.toList());
            } catch (Exception e) {
                // If date parsing fails, ignore date filter
            }
        }
        
        return spots.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    public ParkingSpotResponse getSpotById(Long id) {
        ParkingSpot spot = parkingSpotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parking spot not found"));
        return convertToResponse(spot);
    }
    
    public ParkingSpotResponse createSpot(ParkingSpotRequest request, Long hostId) {
        User host = userRepository.findById(hostId)
                .orElseThrow(() -> new RuntimeException("Host not found"));
        
        ParkingSpot spot = new ParkingSpot();
        spot.setHostId(hostId);
        spot.setTitle(request.getTitle());
        spot.setDescription(request.getDescription());
        spot.setAddress(request.getAddress());
        spot.setCity(request.getCity());
        spot.setState(request.getState());
        spot.setZipCode(request.getZipCode());
        spot.setLatitude(request.getLatitude());
        spot.setLongitude(request.getLongitude());
        spot.setPricePerHour(request.getPricePerHour());
        spot.setPricePerDay(request.getPricePerDay());
        spot.setImageUrl(request.getImageUrl());
        spot.setSpotType(request.getSpotType());
        spot.setIsAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true);
        
        spot = parkingSpotRepository.save(spot);
        return convertToResponse(spot);
    }
    
    public ParkingSpotResponse updateSpot(Long id, ParkingSpotRequest request, Long hostId) {
        ParkingSpot spot = parkingSpotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parking spot not found"));
        
        if (!spot.getHostId().equals(hostId)) {
            throw new RuntimeException("You are not authorized to update this spot");
        }
        
        spot.setTitle(request.getTitle());
        spot.setDescription(request.getDescription());
        spot.setAddress(request.getAddress());
        spot.setCity(request.getCity());
        spot.setState(request.getState());
        spot.setZipCode(request.getZipCode());
        spot.setLatitude(request.getLatitude());
        spot.setLongitude(request.getLongitude());
        spot.setPricePerHour(request.getPricePerHour());
        spot.setPricePerDay(request.getPricePerDay());
        if (request.getImageUrl() != null) {
            spot.setImageUrl(request.getImageUrl());
        }
        spot.setSpotType(request.getSpotType());
        if (request.getIsAvailable() != null) {
            spot.setIsAvailable(request.getIsAvailable());
        }
        
        spot = parkingSpotRepository.save(spot);
        return convertToResponse(spot);
    }
    
    public void deleteSpot(Long id, Long hostId) {
        ParkingSpot spot = parkingSpotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parking spot not found"));
        
        if (!spot.getHostId().equals(hostId)) {
            throw new RuntimeException("You are not authorized to delete this spot");
        }
        
        parkingSpotRepository.delete(spot);
    }
    
    public List<ParkingSpotResponse> getMySpots(Long hostId) {
        List<ParkingSpot> spots = parkingSpotRepository.findByHostId(hostId);
        return spots.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    private ParkingSpotResponse convertToResponse(ParkingSpot spot) {
        ParkingSpotResponse response = new ParkingSpotResponse();
        response.setId(spot.getId());
        response.setHostId(spot.getHostId());
        if (spot.getHost() != null) {
            response.setHostName(spot.getHost().getName());
        }
        response.setTitle(spot.getTitle());
        response.setDescription(spot.getDescription());
        response.setAddress(spot.getAddress());
        response.setCity(spot.getCity());
        response.setState(spot.getState());
        response.setZipCode(spot.getZipCode());
        response.setLatitude(spot.getLatitude());
        response.setLongitude(spot.getLongitude());
        response.setPricePerHour(spot.getPricePerHour());
        response.setPricePerDay(spot.getPricePerDay());
        response.setImageUrl(spot.getImageUrl());
        response.setSpotType(spot.getSpotType());
        response.setIsAvailable(spot.getIsAvailable());
        response.setCreatedAt(spot.getCreatedAt());
        
        // Calculate average rating
        Double avgRating = reviewRepository.findAverageRatingBySpotId(spot.getId());
        response.setAverageRating(avgRating != null ? avgRating : 0.0);
        
        Long reviewCount = reviewRepository.countBySpotId(spot.getId());
        response.setReviewCount(reviewCount != null ? reviewCount : 0L);
        
        return response;
    }
}

