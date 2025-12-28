package com.parkease.controller;

import com.parkease.config.CustomUserDetails;
import com.parkease.dto.ReservationRequest;
import com.parkease.dto.ReservationResponse;
import com.parkease.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "*")
public class ReservationController {
    
    @Autowired
    private ReservationService reservationService;
    
    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(
            @Valid @RequestBody ReservationRequest request,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        ReservationResponse reservation = reservationService.createReservation(request, userDetails.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
    }
    
    @GetMapping("/my")
    public ResponseEntity<List<ReservationResponse>> getMyReservations(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<ReservationResponse> reservations = reservationService.getMyReservations(userDetails.getUserId());
        return ResponseEntity.ok(reservations);
    }
    
    @GetMapping("/hosting")
    public ResponseEntity<List<ReservationResponse>> getHostingReservations(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<ReservationResponse> reservations = reservationService.getHostingReservations(userDetails.getUserId());
        return ResponseEntity.ok(reservations);
    }
    
    @PutMapping("/{id}/confirm")
    public ResponseEntity<ReservationResponse> confirmReservation(
            @PathVariable Long id,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        ReservationResponse reservation = reservationService.confirmReservation(id, userDetails.getUserId());
        return ResponseEntity.ok(reservation);
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ReservationResponse> cancelReservation(
            @PathVariable Long id,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        ReservationResponse reservation = reservationService.cancelReservation(id, userDetails.getUserId());
        return ResponseEntity.ok(reservation);
    }
}

