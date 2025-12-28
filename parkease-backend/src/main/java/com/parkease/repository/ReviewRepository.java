package com.parkease.repository;

import com.parkease.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findBySpotId(Long spotId);
    
    Optional<Review> findBySpotIdAndRenterId(Long spotId, Long renterId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.spotId = :spotId")
    Double findAverageRatingBySpotId(@Param("spotId") Long spotId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.spotId = :spotId")
    Long countBySpotId(@Param("spotId") Long spotId);
}

