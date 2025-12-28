import * as dao from "./dao.js";
import * as spaceDao from "../ParkingSpaces/dao.js";

export default function ReservationRoutes(app) {
    
    // Create reservation
    const createReservation = async (req, res) => {
        try {
            // Require authentication
            if (!req.session.user) {
                res.status(401).json({ 
                    message: "Not authenticated" 
                });
                return;
            }
            
            const { spaceId, startTime, endTime } = req.body;
            
            // Validate time
            const start = new Date(startTime);
            const end = new Date(endTime);
            
            if (start >= end) {
                res.status(400).json({ 
                    message: "End time must be after start time" 
                });
                return;
            }
            
            if (start < new Date()) {
                res.status(400).json({ 
                    message: "Start time must be in the future" 
                });
                return;
            }
            
            // Check if parking space exists
            const space = await spaceDao.findSpaceById(spaceId);
            
            if (!space) {
                res.status(404).json({ 
                    message: "Parking space not found" 
                });
                return;
            }
            
            // Check if parking space is available
            if (space.status !== "AVAILABLE" && space.status !== "RESERVED") {
                res.status(400).json({ 
                    message: `Parking space is ${space.status.toLowerCase()}` 
                });
                return;
            }
            
            // Check for conflicting reservations
            const conflicts = await dao.findConflictingReservations(
                spaceId, 
                start, 
                end
            );
            
            if (conflicts.length > 0) {
                res.status(400).json({ 
                    message: "Time slot is already reserved" 
                });
                return;
            }
            
            // Create reservation
            const reservation = await dao.createReservation({
                user: req.session.user._id,
                space: spaceId,
                startTime: start,
                endTime: end,
                status: "PENDING"
            });
            
            // Update parking space status to RESERVED
            await spaceDao.updateSpaceStatus(spaceId, "RESERVED");
            
            const populatedReservation = await dao.findReservationById(reservation._id);
            res.json(populatedReservation);
        } catch (error) {
            res.status(400).json({ 
                message: "Error creating reservation", 
                error: error.message 
            });
        }
    };

    // Confirm reservation
    const confirmReservation = async (req, res) => {
        try {
            // Only admins can confirm reservations
            if (!req.session.user || req.session.user.role !== "ADMIN") {
                res.status(403).json({ 
                    message: "Access denied. Admin only." 
                });
                return;
            }
            
            const { reservationId } = req.body;
            
            const reservation = await dao.findReservationById(reservationId);
            if (!reservation) {
                res.status(404).json({ 
                    message: "Reservation not found" 
                });
                return;
            }
            
            if (reservation.status !== "PENDING") {
                res.status(400).json({ 
                    message: "Reservation is not pending" 
                });
                return;
            }
            
            await dao.updateReservationStatus(reservationId, "CONFIRMED");
            const updatedReservation = await dao.findReservationById(reservationId);
            res.json(updatedReservation);
        } catch (error) {
            res.status(400).json({ 
                message: "Error confirming reservation" 
            });
        }
    };

    // Cancel reservation
    const cancelReservation = async (req, res) => {
        try {
            const { reservationId } = req.body;
            
            const reservation = await dao.findReservationById(reservationId);
            if (!reservation) {
                res.status(404).json({ 
                    message: "Reservation not found" 
                });
                return;
            }
            
            // Only admin or reservation owner can cancel
            if (!req.session.user || 
                (req.session.user.role !== "ADMIN" && 
                 reservation.user._id.toString() !== req.session.user._id)) {
                res.status(403).json({ 
                    message: "Access denied" 
                });
                return;
            }
            
            if (reservation.status === "CANCELLED") {
                res.status(400).json({ 
                    message: "Reservation is already cancelled" 
                });
                return;
            }
            
            // Update reservation status to CANCELLED
            await dao.updateReservationStatus(reservationId, "CANCELLED");
            
            // Check if there are other active reservations for this space
            const activeReservations = await dao.findConflictingReservations(
                reservation.space._id,
                new Date(),
                new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Next year
            );
            
            // If no active reservations, restore parking space status to AVAILABLE
            if (activeReservations.length === 0) {
                await spaceDao.updateSpaceStatus(reservation.space._id, "AVAILABLE");
            }
            
            const updatedReservation = await dao.findReservationById(reservationId);
            res.json(updatedReservation);
        } catch (error) {
            res.status(400).json({ 
                message: "Error cancelling reservation" 
            });
        }
    };

    // Get all reservations
    const findAllReservations = async (req, res) => {
        try {
            // Only admins can view all reservations
            if (!req.session.user || req.session.user.role !== "ADMIN") {
                res.status(403).json({ 
                    message: "Access denied. Admin only." 
                });
                return;
            }
            
            const reservations = await dao.findAllReservations();
            res.json(reservations);
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching reservations" 
            });
        }
    };

    // Get reservation by ID
    const findReservationById = async (req, res) => {
        try {
            const reservation = await dao.findReservationById(req.params.reservationId);
            if (!reservation) {
                res.status(404).json({ 
                    message: "Reservation not found" 
                });
                return;
            }
            
            // Only admin or reservation owner can view
            if (req.session.user && 
                (req.session.user.role === "ADMIN" || 
                 reservation.user._id.toString() === req.session.user._id)) {
                res.json(reservation);
            } else {
                res.status(403).json({ 
                    message: "Access denied" 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching reservation" 
            });
        }
    };

    // Get reservations by user
    const findReservationsByUser = async (req, res) => {
        try {
            const userId = req.params.userId || req.session.user?._id;
            
            if (!userId) {
                res.status(401).json({ 
                    message: "Not authenticated" 
                });
                return;
            }
            
            // Only admin or user themselves can view
            if (req.session.user && 
                (req.session.user.role === "ADMIN" || 
                 userId === req.session.user._id)) {
                const reservations = await dao.findReservationsByUser(userId);
                res.json(reservations);
            } else {
                res.status(403).json({ 
                    message: "Access denied" 
                });
            }
        } catch (error) {
            res.status(500).json({ 
                message: "Error fetching reservations" 
            });
        }
    };

    // Register routes
    app.post("/api/reservations", createReservation);
    app.post("/api/reservations/confirm", confirmReservation);
    app.post("/api/reservations/cancel", cancelReservation);
    app.get("/api/reservations", findAllReservations);
    app.get("/api/reservations/user/:userId", findReservationsByUser);
    app.get("/api/reservations/:reservationId", findReservationById);
}

