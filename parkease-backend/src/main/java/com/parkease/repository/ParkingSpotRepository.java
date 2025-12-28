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
    
    @Query(value = "SELECT * FROM parking_spots p WHERE " +
           "(:city IS NULL OR LOWER(CAST(p.city AS TEXT)) = LOWER(:city)) AND " +
           "(:spotType IS NULL OR p.spot_type = CAST(:spotType AS TEXT)) AND " +
           "(:priceMin IS NULL OR p.price_per_hour >= :priceMin) AND " +
           "(:priceMax IS NULL OR p.price_per_hour <= :priceMax) AND " +
           "p.is_available = true", nativeQuery = true)
    List<ParkingSpot> searchSpots(@Param("city") String city,
                                   @Param("spotType") String spotType,
                                   @Param("priceMin") BigDecimal priceMin,
                                   @Param("priceMax") BigDecimal priceMax);
}

