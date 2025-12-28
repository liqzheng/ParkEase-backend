package com.parkease.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long spotId;
    private Long renterId;
    private String renterName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}

