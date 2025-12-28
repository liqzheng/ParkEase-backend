package com.parkease.dto;

import com.parkease.enums.SpotType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParkingSpotResponse {
    private Long id;
    private Long hostId;
    private String hostName;
    private String title;
    private String description;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private Double latitude;
    private Double longitude;
    private BigDecimal pricePerHour;
    private BigDecimal pricePerDay;
    private String imageUrl;
    private SpotType spotType;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
    private Double averageRating;
    private Long reviewCount;
}

