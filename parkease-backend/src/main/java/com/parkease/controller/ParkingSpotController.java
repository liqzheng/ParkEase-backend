package com.parkease.controller;

import com.parkease.config.CustomUserDetails;
import com.parkease.dto.ParkingSpotRequest;
import com.parkease.dto.ParkingSpotResponse;
import com.parkease.service.ParkingSpotService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/spots")
@CrossOrigin(origins = "*")
public class ParkingSpotController {
    
    @Autowired
    private ParkingSpotService parkingSpotService;
    
    @GetMapping
    public ResponseEntity<List<ParkingSpotResponse>> searchSpots(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String spotType,
            @RequestParam(required = false) BigDecimal priceMin,
            @RequestParam(required = false) BigDecimal priceMax,
            @RequestParam(required = false) String date) {
        List<ParkingSpotResponse> spots = parkingSpotService.searchSpots(city, spotType, priceMin, priceMax, date);
        return ResponseEntity.ok(spots);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ParkingSpotResponse> getSpotById(@PathVariable Long id) {
        ParkingSpotResponse spot = parkingSpotService.getSpotById(id);
        return ResponseEntity.ok(spot);
    }
    
    @PostMapping
    public ResponseEntity<ParkingSpotResponse> createSpot(
            @Valid @RequestBody ParkingSpotRequest request,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        ParkingSpotResponse spot = parkingSpotService.createSpot(request, userDetails.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(spot);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ParkingSpotResponse> updateSpot(
            @PathVariable Long id,
            @Valid @RequestBody ParkingSpotRequest request,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        ParkingSpotResponse spot = parkingSpotService.updateSpot(id, request, userDetails.getUserId());
        return ResponseEntity.ok(spot);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSpot(@PathVariable Long id, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        parkingSpotService.deleteSpot(id, userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/my")
    public ResponseEntity<List<ParkingSpotResponse>> getMySpots(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<ParkingSpotResponse> spots = parkingSpotService.getMySpots(userDetails.getUserId());
        return ResponseEntity.ok(spots);
    }
}

