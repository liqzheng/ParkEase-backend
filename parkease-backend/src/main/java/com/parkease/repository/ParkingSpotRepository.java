package com.parkease.repository;

import com.parkease.entity.ParkingSpot;
import com.parkease.enums.SpotType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {
    List<ParkingSpot> findByHostId(Long hostId);
    
    List<ParkingSpot> findByCityIgnoreCase(String city);
    
    List<ParkingSpot> findByCityIgnoreCaseAndIsAvailableTrue(String city);
    
    @Query("SELECT p FROM ParkingSpot p WHERE " +
           "(:city IS NULL OR LOWER(p.city) = LOWER(:city)) AND " +
           "(:spotType IS NULL OR p.spotType = :spotType) AND " +
           "(:priceMin IS NULL OR p.pricePerHour >= :priceMin) AND " +
           "(:priceMax IS NULL OR p.pricePerHour <= :priceMax) AND " +
           "p.isAvailable = true")
    List<ParkingSpot> searchSpots(@Param("city") String city,
                                   @Param("spotType") SpotType spotType,
                                   @Param("priceMin") BigDecimal priceMin,
                                   @Param("priceMax") BigDecimal priceMax);
}

