package com.parkease.controller;

import com.parkease.config.CustomUserDetails;
import com.parkease.dto.ReviewRequest;
import com.parkease.dto.ReviewResponse;
import com.parkease.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/spots/{spotId}/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {
    
    @Autowired
    private ReviewService reviewService;
    
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable Long spotId,
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        ReviewResponse review = reviewService.createReview(spotId, request, userDetails.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }
    
    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getReviewsBySpotId(@PathVariable Long spotId) {
        List<ReviewResponse> reviews = reviewService.getReviewsBySpotId(spotId);
        return ResponseEntity.ok(reviews);
    }
}

