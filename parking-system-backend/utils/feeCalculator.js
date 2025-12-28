/**
 * Calculate parking fee
 * @param {Date} checkInTime - Check-in time
 * @param {Date} checkOutTime - Check-out time
 * @param {String} spaceType - Parking space type (REGULAR, VIP, DISABLED)
 * @returns {Number} Total fee
 */
export const calculateFee = (checkInTime, checkOutTime, spaceType) => {
    // Calculate parking duration (hours)
    const durationMs = checkOutTime - checkInTime;
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60)); // Round up to hours
    
    // Base rate (per hour)
    const baseRate = 5; // Regular space: $5 per hour
    
    // Adjust rate based on space type
    let rateMultiplier = 1;
    switch (spaceType) {
        case "VIP":
            rateMultiplier = 2; // VIP space: double price
            break;
        case "DISABLED":
            rateMultiplier = 0.5; // Disabled space: half price
            break;
        case "REGULAR":
        default:
            rateMultiplier = 1;
            break;
    }
    
    // Calculate base fee
    let fee = durationHours * baseRate * rateMultiplier;
    
    // Overtime penalty (over 24 hours)
    if (durationHours > 24) {
        const overtimeHours = durationHours - 24;
        const overtimeFee = overtimeHours * baseRate * rateMultiplier * 1.5; // 1.5x for overtime
        fee = (24 * baseRate * rateMultiplier) + overtimeFee;
    }
    
    // Minimum charge (at least 1 hour)
    if (durationHours < 1) {
        fee = baseRate * rateMultiplier;
    }
    
    return Math.round(fee * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate reservation fee (optional feature)
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time
 * @param {String} spaceType - Parking space type
 * @returns {Number} Reservation fee
 */
export const calculateReservationFee = (startTime, endTime, spaceType) => {
    const durationMs = endTime - startTime;
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
    
    const baseRate = 5;
    let rateMultiplier = 1;
    
    switch (spaceType) {
        case "VIP":
            rateMultiplier = 2;
            break;
        case "DISABLED":
            rateMultiplier = 0.5;
            break;
        default:
            rateMultiplier = 1;
    }
    
    // Reservation fee can be discounted (e.g., 20% off)
    const discount = 0.8;
    const fee = durationHours * baseRate * rateMultiplier * discount;
    
    return Math.round(fee * 100) / 100;
};
