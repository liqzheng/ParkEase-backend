package com.parkease.service;

import com.parkease.dto.ReviewRequest;
import com.parkease.dto.ReviewResponse;
import com.parkease.entity.ParkingSpot;
import com.parkease.entity.Reservation;
import com.parkease.entity.Review;
import com.parkease.entity.User;
import com.parkease.enums.ReservationStatus;
import com.parkease.repository.ParkingSpotRepository;
import com.parkease.repository.ReservationRepository;
import com.parkease.repository.ReviewRepository;
import com.parkease.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReviewService {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private ParkingSpotRepository parkingSpotRepository;
    
    @Autowired
    private ReservationRepository reservationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public ReviewResponse createReview(Long spotId, ReviewRequest request, Long renterId) {
        ParkingSpot spot = parkingSpotRepository.findById(spotId)
                .orElseThrow(() -> new RuntimeException("Parking spot not found"));
        
        // Check if user has a completed reservation for this spot
        List<Reservation> completedReservations = reservationRepository
                .findBySpotIdAndRenterIdAndStatus(spotId, renterId, ReservationStatus.COMPLETED);
        
        if (completedReservations.isEmpty()) {
            throw new RuntimeException("You can only review spots you have booked and completed");
        }
        
        // Check if user already reviewed this spot
        if (reviewRepository.findBySpotIdAndRenterId(spotId, renterId).isPresent()) {
            throw new RuntimeException("You have already reviewed this spot");
        }
        
        Review review = new Review();
        review.setSpotId(spotId);
        review.setRenterId(renterId);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        
        review = reviewRepository.save(review);
        return convertToResponse(review);
    }
    
    public List<ReviewResponse> getReviewsBySpotId(Long spotId) {
        List<Review> reviews = reviewRepository.findBySpotId(spotId);
        return reviews.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    private ReviewResponse convertToResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setSpotId(review.getSpotId());
        response.setRenterId(review.getRenterId());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());
        
        // Load renter details
        if (review.getRenter() != null) {
            User renter = review.getRenter();
            response.setRenterName(renter.getName());
        } else {
            User renter = userRepository.findById(review.getRenterId()).orElse(null);
            if (renter != null) {
                response.setRenterName(renter.getName());
            }
        }
        
        return response;
    }
}

