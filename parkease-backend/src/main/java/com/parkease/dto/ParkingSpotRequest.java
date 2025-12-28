package com.parkease.dto;

import com.parkease.enums.SpotType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ParkingSpotRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String state;

    private String zipCode;

    private Double latitude;

    private Double longitude;

    @NotNull(message = "Price per hour is required")
    @Positive(message = "Price must be positive")
    private BigDecimal pricePerHour;

    @NotNull(message = "Price per day is required")
    @Positive(message = "Price must be positive")
    private BigDecimal pricePerDay;

    private String imageUrl;

    @NotNull(message = "Spot type is required")
    private SpotType spotType;

    private Boolean isAvailable = true;
}

