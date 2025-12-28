package com.parkease.dto;

import com.parkease.enums.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponse {
    private Long id;
    private Long spotId;
    private ParkingSpotResponse spot;
    private Long renterId;
    private String renterName;
    private String renterEmail;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal totalPrice;
    private ReservationStatus status;
    private LocalDateTime createdAt;
}

